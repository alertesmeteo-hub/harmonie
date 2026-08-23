#!/usr/bin/env python3
"""Produit des cartes WebP depuis la grille native HARMONIE-AROME (KNMI).

Contrairement au tableau par commune, les cartes ne sont jamais reconstruites
depuis les communes : les points natifs du GRIB (nuage de points, grille
``rotated_ll``) sont reprojetés par interpolation IDW sur une image Web
Mercator couvrant la France, puis les côtes, frontières nationales et limites
départementales sont ajoutées dans une surcouche indépendante.

Moteur de rendu directement adapté de ``arome_maps.py`` (module AROME) — la
réinterpolation par nuage de points (``pregridded=False``) y est déjà
générique et ne dépend pas de la grille source, ce qui permet de la
réutiliser telle quelle pour la grille HARMONIE.
"""

from __future__ import annotations

import gzip
import json
import math
import struct
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Sequence

import numpy as np
from PIL import Image
from scipy.spatial import cKDTree


MAP_SCHEMA_VERSION = 1
MODULE_VERSION = "1.0.0"
# Une valeur numérique tous les deux pixels cartographiques : le survol reste
# précis à l'échelle d'une commune sans multiplier déraisonnablement le poids
# de la branche de données.
PROBE_DOWNSAMPLE = 2
PROBE_MAGIC = b"HMV1"
CONTOUR_STEPS = {
    "temperature_c": 1.0,
    "wind_speed_kmh": 5.0,
    "wind_gust_kmh": 5.0,
    "pressure_hpa": 2.0,
    "cloud_cover_pct": 5.0,
    "humidity_pct": 5.0,
}
DEFAULT_BOUNDS = {
    "south": 38.0,
    "west": -12.0,
    "north": 57.0,
    "east": 18.0,
}


def _iter_shapefile_parts(path: Path):
    """Lit les lignes/polygones ESRI Shapefile sans dépendance externe.

    Les couches Natural Earth embarquées n'ont besoin que des coordonnées X/Y
    et des indices de parties. Les éventuelles valeurs Z/M peuvent donc être
    ignorées en toute sécurité.
    """

    with path.open("rb") as handle:
        header = handle.read(100)
        if len(header) != 100 or struct.unpack_from(">i", header, 0)[0] != 9994:
            raise ValueError(f"En-tête Shapefile invalide : {path}")

        while True:
            record_header = handle.read(8)
            if not record_header:
                break
            if len(record_header) != 8:
                raise ValueError(f"Enregistrement Shapefile tronqué : {path}")

            _record_number, content_words = struct.unpack(">2i", record_header)
            content_size = content_words * 2
            content = handle.read(content_size)
            if len(content) != content_size:
                raise ValueError(f"Contenu Shapefile tronqué : {path}")
            if len(content) < 4:
                continue

            shape_type = struct.unpack_from("<i", content, 0)[0]
            if shape_type == 0:
                continue
            if shape_type not in {3, 5, 13, 15, 23, 25} or len(content) < 44:
                continue

            part_count, point_count = struct.unpack_from("<2i", content, 36)
            if part_count <= 0 or point_count <= 0:
                continue
            required_size = 44 + 4 * part_count + 16 * point_count
            if len(content) < required_size:
                raise ValueError(f"Géométrie Shapefile tronquée : {path}")

            part_starts = list(
                struct.unpack_from(f"<{part_count}i", content, 44)
            )
            points_offset = 44 + 4 * part_count
            part_ends = part_starts[1:] + [point_count]
            for start, end in zip(part_starts, part_ends):
                if start < 0 or end > point_count or start >= end:
                    continue
                yield [
                    struct.unpack_from("<2d", content, points_offset + index * 16)
                    for index in range(start, end)
                ]


@dataclass(frozen=True)
class LayerSpec:
    key: str
    label: str
    unit: str
    field: str
    stops: tuple[tuple[float, str], ...]
    group: str = "Autres"
    decimals: int = 0
    transparent_below: float | None = None
    opacity: int = 244
    discrete: bool = False


PRECIPITATION_STOPS = (
    (0.1, "#f5f5f7"),
    (1, "#c9e6ff"),
    (2, "#7fbbff"),
    (3, "#438fff"),
    (5, "#1bd0ef"),
    (7, "#00b8bd"),
    (10, "#00ca76"),
    (15, "#32e300"),
    (20, "#86ed00"),
    (25, "#d2ef00"),
    (30, "#fff000"),
    (40, "#ffd000"),
    (50, "#ff9900"),
    (60, "#ff6500"),
    (70, "#ff2e00"),
    (80, "#ef0054"),
    (90, "#d000a7"),
    (100, "#a000e8"),
)


LAYER_SPECS = (
    LayerSpec(
        "temperature",
        "Température à 2 m",
        "°C",
        "temperature_c",
        (
            (-25, "#482173"),
            (-15, "#303fa5"),
            (-5, "#3478c5"),
            (0, "#55b7dd"),
            (5, "#53c6a8"),
            (10, "#70cf66"),
            (15, "#cbd83f"),
            (20, "#f2d43d"),
            (25, "#f2a331"),
            (30, "#ea652b"),
            (35, "#d93435"),
            (40, "#a71f57"),
            (45, "#5b1037"),
        ),
        group="Températures",
        decimals=1,
    ),
    LayerSpec(
        "pluie_1h",
        "Précipitations sur 1 h",
        "mm",
        "precipitation_mm",
        PRECIPITATION_STOPS,
        group="Précipitations",
        decimals=1,
        transparent_below=0.03,
        opacity=255,
        discrete=True,
    ),
    LayerSpec(
        "neige_1h",
        "Neige sur 1 h (équivalent eau)",
        "mm",
        "snowfall_mm",
        tuple(stop for stop in PRECIPITATION_STOPS if stop[0] <= 100),
        group="Précipitations",
        decimals=1,
        transparent_below=0.03,
        opacity=255,
        discrete=True,
    ),
    LayerSpec(
        "neige_au_sol",
        "Épaisseur de neige au sol",
        "cm",
        "snow_depth_cm",
        (
            (0.1, "#f4f7fb"), (1, "#d7efff"), (2, "#a9d9ff"),
            (5, "#70b8ef"), (10, "#3a91d5"), (20, "#536bc1"),
            (30, "#7048ac"), (50, "#963b92"), (75, "#c65382"),
            (100, "#f0b5cf"),
        ),
        group="Précipitations",
        decimals=1,
        transparent_below=0.05,
        discrete=True,
    ),
    LayerSpec(
        "vent",
        "Vent moyen à 10 m",
        "km/h",
        "wind_speed_kmh",
        (
            (0, "#eef7ea"),
            (10, "#a7db8d"),
            (20, "#5cc27d"),
            (30, "#38aaa5"),
            (40, "#347cc3"),
            (50, "#6558b8"),
            (60, "#a43e94"),
            (80, "#d63c57"),
            (100, "#7e1736"),
        ),
        group="Vent",
    ),
    LayerSpec(
        "rafales",
        "Rafales à 10 m",
        "km/h",
        "wind_gust_kmh",
        (
            (0, "#edf7e8"),
            (20, "#a9d77d"),
            (40, "#f0cf46"),
            (60, "#ef8b2c"),
            (80, "#db3d3d"),
            (100, "#9e235d"),
            (130, "#4d1647"),
            (160, "#25152e"),
        ),
        group="Vent",
    ),
    LayerSpec(
        "pression",
        "Pression au niveau de la mer",
        "hPa",
        "pressure_hpa",
        (
            (960, "#562a7c"),
            (975, "#315ab4"),
            (990, "#2f98c5"),
            (1000, "#48b983"),
            (1010, "#c6d64f"),
            (1020, "#f0c646"),
            (1030, "#e57a34"),
            (1045, "#b52f43"),
        ),
        group="Pression",
    ),
    LayerSpec(
        "nebulosite",
        "Nébulosité totale",
        "%",
        "cloud_cover_pct",
        (
            (0, "#dceef6"),
            (20, "#c8dce5"),
            (40, "#abbac5"),
            (60, "#8997a4"),
            (80, "#626e79"),
            (100, "#343d46"),
        ),
        group="Nuages et humidité",
    ),
    LayerSpec(
        "humidite",
        "Humidité relative à 2 m",
        "%",
        "humidity_pct",
        (
            (0, "#9a5429"),
            (20, "#d19a52"),
            (40, "#e3d16b"),
            (60, "#83ca82"),
            (80, "#48a6b6"),
            (100, "#28569f"),
        ),
        group="Nuages et humidité",
    ),
)


def _hex_to_rgb(value: str) -> np.ndarray:
    clean = value.lstrip("#")
    return np.asarray(
        tuple(int(clean[index : index + 2], 16) for index in (0, 2, 4))
    )


def _mercator(latitude: np.ndarray | float) -> np.ndarray | float:
    radians = np.radians(np.clip(latitude, -85.0, 85.0))
    return np.log(np.tan(np.pi / 4.0 + radians / 2.0))


def _inverse_mercator(value: np.ndarray) -> np.ndarray:
    return np.degrees(2.0 * np.arctan(np.exp(value)) - np.pi / 2.0)


class HarmonieMapRenderer:
    """Rend les champs HARMONIE natifs et les frontières cartographiques."""

    def __init__(
        self,
        latitudes: np.ndarray,
        longitudes: np.ndarray,
        output_directory: Path,
        *,
        width: int = 1600,
        height: int = 1200,
        bounds: dict[str, float] | None = None,
        source_max_distance: float = 0.22,
        france_latitudes: np.ndarray | None = None,
        france_longitudes: np.ndarray | None = None,
        france_departments: Sequence[str] | None = None,
        boundary_directory: Path | None = None,
    ) -> None:
        self.latitudes = np.asarray(latitudes, dtype=np.float64)
        self.longitudes = np.asarray(longitudes, dtype=np.float64)
        if self.latitudes.shape != self.longitudes.shape or self.latitudes.ndim != 1:
            raise ValueError("Coordonnées cartographiques invalides")
        if len(self.latitudes) < 4:
            raise ValueError("Au moins quatre points HARMONIE sont nécessaires")

        self.output_directory = Path(output_directory)
        self.output_directory.mkdir(parents=True, exist_ok=True)
        self.width = int(width)
        self.height = int(height)
        self.bounds = dict(bounds or DEFAULT_BOUNDS)
        self.source_max_distance = float(source_max_distance)
        self.boundary_directory = (
            Path(boundary_directory) if boundary_directory is not None else None
        )
        self.france_latitudes = (
            np.asarray(france_latitudes, dtype=np.float64)
            if france_latitudes is not None
            else None
        )
        self.france_longitudes = (
            np.asarray(france_longitudes, dtype=np.float64)
            if france_longitudes is not None
            else None
        )
        self.france_departments = (
            list(france_departments) if france_departments is not None else None
        )
        self.steps: list[dict[str, Any]] = []
        self.available_layers: set[str] = set()

        self._prepare_interpolation()
        self._write_static_maps()

    def _prepare_interpolation(self) -> None:
        south = float(self.bounds["south"])
        north = float(self.bounds["north"])
        west = float(self.bounds["west"])
        east = float(self.bounds["east"])
        mercator_rows = np.linspace(_mercator(north), _mercator(south), self.height)
        grid_latitudes = _inverse_mercator(mercator_rows)
        grid_longitudes = np.linspace(west, east, self.width)
        longitude_grid, latitude_grid = np.meshgrid(grid_longitudes, grid_latitudes)
        self._target_latitudes = latitude_grid
        self._target_longitudes = longitude_grid
        latitude_midpoint = (south + north) / 2.0
        self._longitude_scale = math.cos(math.radians(latitude_midpoint))

        source = np.column_stack(
            (self.longitudes * self._longitude_scale, self.latitudes)
        )
        target = np.column_stack(
            (
                longitude_grid.ravel() * self._longitude_scale,
                latitude_grid.ravel(),
            )
        )
        neighbour_count = min(4, len(source))
        distances, indexes = cKDTree(source).query(
            target,
            k=neighbour_count,
            workers=-1,
        )
        if neighbour_count == 1:
            distances = distances[:, None]
            indexes = indexes[:, None]
        self._indexes = indexes.astype(np.int32, copy=False)
        self._weights = (
            1.0 / np.maximum(distances, 1.0e-4) ** 2
        ).astype(np.float32, copy=False)
        self._coverage_mask = (
            distances[:, 0].reshape(self.height, self.width)
            <= self.source_max_distance
        )

    def _interpolate(self, values: np.ndarray) -> np.ndarray:
        source = np.asarray(values, dtype=np.float64)
        if source.shape != self.latitudes.shape:
            raise ValueError("Le champ ne correspond pas à la grille HARMONIE native")
        selected = source[self._indexes]
        finite = np.isfinite(selected)
        weights = self._weights * finite
        denominator = np.sum(weights, axis=1)
        numerator = np.sum(np.where(finite, selected, 0.0) * weights, axis=1)
        result = np.full(len(denominator), np.nan, dtype=np.float32)
        valid = denominator > 0
        result[valid] = numerator[valid] / denominator[valid]
        return result.reshape(self.height, self.width)

    def _image_from_field(self, field: np.ndarray, spec: LayerSpec) -> Image.Image:
        stop_values = np.asarray([item[0] for item in spec.stops], dtype=np.float32)
        stop_colours = np.asarray([_hex_to_rgb(item[1]) for item in spec.stops])
        finite_field = np.isfinite(field)
        clipped = np.clip(
            np.where(finite_field, field, stop_values[0]),
            stop_values[0],
            stop_values[-1],
        )
        # Plages colorées nettes plutôt qu'un agrandissement flou des pixels
        # du raster : la quantification se fait après l'interpolation pleine
        # résolution, donc les frontières des plages restent lisses même lors
        # d'un zoom important.
        contour_step = CONTOUR_STEPS.get(spec.field)
        if contour_step:
            clipped = np.floor(clipped / contour_step) * contour_step
        upper = np.searchsorted(stop_values, clipped, side="right")
        upper = np.clip(upper, 1, len(stop_values) - 1)
        lower = upper - 1
        if spec.discrete:
            rgb = stop_colours[lower].astype(np.uint8)
        else:
            low_values = stop_values[lower]
            high_values = stop_values[upper]
            fraction = np.divide(
                clipped - low_values,
                high_values - low_values,
                out=np.zeros_like(clipped),
                where=(high_values != low_values),
            )
            rgb = (
                stop_colours[lower] * (1.0 - fraction[..., None])
                + stop_colours[upper] * fraction[..., None]
            ).astype(np.uint8)
        alpha = np.full(field.shape, spec.opacity, dtype=np.uint8)
        valid = self._coverage_mask & finite_field
        if spec.transparent_below is not None:
            valid &= field >= spec.transparent_below
        alpha[~valid] = 0
        return Image.fromarray(np.dstack((rgb, alpha)), mode="RGBA")

    def _write_probe_field(
        self,
        field: np.ndarray,
        spec: LayerSpec,
        destination: Path,
    ) -> None:
        """Écrit une grille numérique compacte pour la valeur sous le pointeur.

        Les valeurs sont quantifiées sur 16 bits puis compressées en gzip ;
        65535 représente un point hors domaine ou manquant.
        """

        sampled = np.asarray(
            field[::PROBE_DOWNSAMPLE, ::PROBE_DOWNSAMPLE],
            dtype=np.float32,
        )
        coverage = self._coverage_mask[
            ::PROBE_DOWNSAMPLE,
            ::PROBE_DOWNSAMPLE,
        ]
        minimum = float(spec.stops[0][0])
        maximum = float(spec.stops[-1][0])
        if not maximum > minimum:
            raise ValueError(f"Échelle cartographique invalide : {spec.key}")

        valid = coverage & np.isfinite(sampled)
        encoded = np.full(sampled.shape, 65535, dtype="<u2")
        normalized = (
            np.clip(sampled[valid], minimum, maximum) - minimum
        ) / (maximum - minimum)
        encoded[valid] = np.rint(normalized * 65534.0).astype("<u2")

        destination.parent.mkdir(parents=True, exist_ok=True)
        header = struct.pack(
            "<4sHHff",
            PROBE_MAGIC,
            encoded.shape[1],
            encoded.shape[0],
            minimum,
            maximum,
        )
        with destination.open("wb") as raw:
            with gzip.GzipFile(
                filename="",
                mode="wb",
                fileobj=raw,
                compresslevel=6,
                mtime=0,
            ) as compressed:
                compressed.write(header)
                compressed.write(encoded.tobytes(order="C"))

    def _pixel(self, latitude: float, longitude: float) -> tuple[int, int]:
        west = float(self.bounds["west"])
        east = float(self.bounds["east"])
        north_y = float(_mercator(float(self.bounds["north"])))
        south_y = float(_mercator(float(self.bounds["south"])))
        x = (longitude - west) / (east - west) * (self.width - 1)
        y = (north_y - float(_mercator(latitude))) / (north_y - south_y)
        y *= self.height - 1
        return int(round(x)), int(round(y))

    def _shapefile_svg_path(self, path: Path) -> str:
        if not path.is_file():
            return ""
        south = float(self.bounds["south"]) - 1
        north = float(self.bounds["north"]) + 1
        west = float(self.bounds["west"]) - 1
        east = float(self.bounds["east"]) + 1
        paths: list[str] = []
        for points in _iter_shapefile_parts(path):
            segment: list[tuple[float, float]] = []
            for longitude, latitude in points:
                if west <= longitude <= east and south <= latitude <= north:
                    segment.append(self._pixel(latitude, longitude))
                elif segment:
                    if len(segment) >= 2:
                        paths.append(
                            "M" + " L".join(
                                f"{x:.1f},{y:.1f}" for x, y in segment
                            )
                        )
                    segment = []
            if len(segment) >= 2:
                paths.append(
                    "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in segment)
                )
        return " ".join(paths)

    @staticmethod
    def _true_runs(mask: np.ndarray):
        padded = np.concatenate(
            (np.asarray([False]), np.asarray(mask, dtype=bool), np.asarray([False]))
        )
        changes = np.flatnonzero(padded[1:] != padded[:-1])
        return zip(changes[::2], changes[1::2])

    def _department_svg_path(self) -> str:
        if (
            self.france_latitudes is None
            or self.france_longitudes is None
            or self.france_departments is None
            or len(self.france_departments) != len(self.france_latitudes)
        ):
            return ""

        source = np.column_stack(
            (
                self.france_longitudes * self._longitude_scale,
                self.france_latitudes,
            )
        )
        target = np.column_stack(
            (
                self._target_longitudes.ravel() * self._longitude_scale,
                self._target_latitudes.ravel(),
            )
        )
        distances, indexes = cKDTree(source).query(target, k=1, workers=-1)
        codes = {
            code: index + 1
            for index, code in enumerate(sorted(set(self.france_departments)))
        }
        encoded = np.asarray(
            [codes.get(code, 0) for code in self.france_departments]
        )
        departments = encoded[indexes].reshape(self.height, self.width)
        france = distances.reshape(self.height, self.width) <= 0.18

        changes_between_columns = (
            france[:, 1:]
            & france[:, :-1]
            & (departments[:, 1:] != departments[:, :-1])
        )
        changes_between_rows = (
            france[1:, :]
            & france[:-1, :]
            & (departments[1:, :] != departments[:-1, :])
        )
        paths: list[str] = []
        for x in range(changes_between_columns.shape[1]):
            for start, end in self._true_runs(changes_between_columns[:, x]):
                coordinate = x + 0.5
                paths.append(
                    f"M{coordinate:.1f},{start:.1f} L{coordinate:.1f},{end:.1f}"
                )
        for y in range(changes_between_rows.shape[0]):
            for start, end in self._true_runs(changes_between_rows[y, :]):
                coordinate = y + 0.5
                paths.append(
                    f"M{start:.1f},{coordinate:.1f} L{end:.1f},{coordinate:.1f}"
                )
        return " ".join(paths)

    def _write_static_maps(self) -> None:
        base = Image.new("RGB", (self.width, self.height), "#a5a6b0")
        base.save(self.output_directory / "fond.webp", "WEBP", quality=86, method=4)

        national_path = ""
        coastline_path = ""
        if self.boundary_directory is not None:
            national_path = self._shapefile_svg_path(
                self.boundary_directory / "ne_50m_admin_0_boundary_lines_land.shp",
            )
            coastline_path = self._shapefile_svg_path(
                self.boundary_directory / "ne_50m_coastline.shp",
            )
        department_path = self._department_svg_path()
        svg = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.width} '
            f'{self.height}" preserveAspectRatio="none" '
            'shape-rendering="geometricPrecision">\n'
            f'<path d="{department_path}" fill="none" stroke="#20242b" '
            'stroke-opacity="0.58" stroke-width="0.8" '
            'vector-effect="non-scaling-stroke"/>\n'
            f'<path d="{national_path}" fill="none" stroke="#111116" '
            'stroke-width="1.45" stroke-linejoin="round" stroke-linecap="round" '
            'vector-effect="non-scaling-stroke"/>\n'
            f'<path d="{coastline_path}" fill="none" stroke="#050507" '
            'stroke-width="2" stroke-linejoin="round" stroke-linecap="round" '
            'vector-effect="non-scaling-stroke"/>\n'
            '</svg>\n'
        )
        (self.output_directory / "frontieres.svg").write_text(
            svg,
            encoding="utf-8",
        )

    def render_step(
        self,
        *,
        lead_hour: int,
        valid_time: datetime,
        fields: dict[str, np.ndarray],
    ) -> None:
        files: dict[str, str] = {}
        probes: dict[str, str] = {}
        for spec in LAYER_SPECS:
            values = fields.get(spec.field)
            if values is None or not np.any(np.isfinite(values)):
                continue
            field = self._interpolate(values)
            destination_directory = self.output_directory / spec.key
            destination_directory.mkdir(parents=True, exist_ok=True)
            file_stem = f"{lead_hour:03d}"
            destination = destination_directory / f"{file_stem}.webp"
            image = self._image_from_field(field, spec)
            image.save(destination, "WEBP", quality=86, method=5)
            files[spec.key] = f"maps/{spec.key}/{destination.name}"
            probe_destination = (
                self.output_directory
                / "values"
                / spec.key
                / f"{file_stem}.hmv.gz"
            )
            self._write_probe_field(field, spec, probe_destination)
            probes[spec.key] = (
                f"maps/values/{spec.key}/{probe_destination.name}"
            )
            self.available_layers.add(spec.key)

        self.steps.append(
            {
                "lead_hour": int(lead_hour),
                "valid_time": valid_time.isoformat().replace("+00:00", "Z"),
                "files": files,
                "probes": probes,
            }
        )

    def write_manifest(
        self,
        *,
        generated_at: str,
        run_time: str | None,
        places_path: str | None = None,
    ) -> dict[str, Any]:
        layers = {
            spec.key: {
                "label": spec.label,
                "unit": spec.unit,
                "group": spec.group,
                "decimals": spec.decimals,
                "transparent_below": spec.transparent_below,
                "discrete": spec.discrete,
                "stops": [
                    {"value": value, "color": colour}
                    for value, colour in spec.stops
                ],
            }
            for spec in LAYER_SPECS
            if spec.key in self.available_layers
        }
        manifest = {
            "schema_version": MAP_SCHEMA_VERSION,
            "status": "ok",
            "module_version": MODULE_VERSION,
            "generated_at": generated_at,
            "run_time": run_time,
            "projection": "EPSG:3857",
            "bounds": self.bounds,
            "width": self.width,
            "height": self.height,
            "background": "maps/fond.webp",
            "overlay": "maps/frontieres.svg",
            "layers": layers,
            "steps": self.steps,
        }
        if places_path:
            manifest["places"] = places_path
        destination = self.output_directory / "index.json"
        with destination.open("w", encoding="utf-8") as handle:
            json.dump(manifest, handle, ensure_ascii=False, separators=(",", ":"))
            handle.write("\n")
        return manifest

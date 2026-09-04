(function () {
    'use strict';

    var REGIONS = {
        'auvergne-rhone-alpes': { name: 'Auvergne-Rhône-Alpes', cities: [
            ['01053','01','Bourg-en-Bresse',46.205,5.226], ['03190','03','Moulins',46.566,3.335], ['07186','07','Privas',44.735,4.599], ['15014','15','Aurillac',44.926,2.441], ['26362','26','Valence',44.933,4.892], ['38185','38','Grenoble',45.188,5.724], ['42218','42','Saint-Étienne',45.440,4.387], ['43157','43','Le Puy-en-Velay',45.043,3.885], ['63113','63','Clermont-Ferrand',45.778,3.087], ['69123','69','Lyon',45.758,4.835], ['73065','73','Chambéry',45.565,5.917], ['74010','74','Annecy',45.900,6.129]
        ]},
        'centre-val-de-loire': { name: 'Centre-Val de Loire', cities: [
            ['18033','18','Bourges',47.082,2.398], ['28085','28','Chartres',48.447,1.489], ['36044','36','Châteauroux',46.811,1.691], ['37261','37','Tours',47.394,0.685], ['41018','41','Blois',47.586,1.335], ['45234','45','Orléans',47.903,1.909]
        ]},
        'bretagne': { name: 'Bretagne', cities: [
            ['22278','22','Saint-Brieuc',48.514,-2.765], ['29232','29','Quimper',47.996,-4.102], ['35238','35','Rennes',48.111,-1.680], ['56260','56','Vannes',47.658,-2.760]
        ]},
        'bourgogne-franche-comte': { name: 'Bourgogne-Franche-Comté', cities: [
            ['21231','21','Dijon',47.322,5.041], ['25056','25','Besançon',47.238,6.024], ['39300','39','Lons-le-Saunier',46.675,5.555], ['58194','58','Nevers',46.990,3.159], ['70550','70','Vesoul',47.623,6.156], ['71270','71','Mâcon',46.306,4.832], ['89024','89','Auxerre',47.798,3.568], ['90010','90','Belfort',47.638,6.863]
        ]},
        'grand-est': { name: 'Grand Est', cities: [
            ['08105','08','Charleville-Mézières',49.762,4.726], ['10387','10','Troyes',48.297,4.074], ['51108','51','Châlons-en-Champagne',48.957,4.364], ['52121','52','Chaumont',48.111,5.139], ['54395','54','Nancy',48.693,6.184], ['55029','55','Bar-le-Duc',48.772,5.161], ['57463','57','Metz',49.120,6.177], ['67482','67','Strasbourg',48.584,7.748], ['68066','68','Colmar',48.079,7.359], ['88160','88','Épinal',48.174,6.451]
        ]},
        'hauts-de-france': { name: 'Hauts-de-France', cities: [
            ['02408','02','Laon',49.564,3.624], ['59350','59','Lille',50.630,3.058], ['60057','60','Beauvais',49.430,2.083], ['62041','62','Arras',50.292,2.778], ['80021','80','Amiens',49.895,2.302]
        ]},
        'ile-de-france': { name: 'Île-de-France', cities: [
            ['75056','75','Paris',48.857,2.352], ['78646','78','Versailles',48.801,2.130], ['77288','77','Melun',48.540,2.660], ['91228','91','Évry-Courcouronnes',48.624,2.430], ['92050','92','Nanterre',48.893,2.206], ['93008','93','Bobigny',48.910,2.439], ['94028','94','Créteil',48.790,2.455], ['95127','95','Cergy',49.036,2.078]
        ]},
        'normandie': { name: 'Normandie', cities: [
            ['14118','14','Caen',49.182,-0.370], ['27229','27','Évreux',49.027,1.151], ['50502','50','Saint-Lô',49.116,-1.090], ['61001','61','Alençon',48.430,0.092], ['76540','76','Rouen',49.443,1.100], ['76351','76','Le Havre',49.494,0.108]
        ]},
        'nouvelle-aquitaine': { name: 'Nouvelle-Aquitaine', cities: [
            ['16015','16','Angoulême',45.649,0.156], ['17300','17','La Rochelle',46.160,-1.151], ['19272','19','Tulle',45.267,1.770], ['23096','23','Guéret',46.170,1.872], ['24322','24','Périgueux',45.184,0.721], ['33063','33','Bordeaux',44.838,-0.579], ['40192','40','Mont-de-Marsan',43.891,-0.501], ['47001','47','Agen',44.204,0.621], ['64445','64','Pau',43.295,-0.370], ['79191','79','Niort',46.323,-0.459], ['86194','86','Poitiers',46.580,0.340], ['87085','87','Limoges',45.833,1.261]
        ]},
        'occitanie': { name: 'Occitanie', cities: [
            ['09122','09','Foix',42.965,1.607], ['12202','12','Rodez',44.350,2.575], ['11069','11','Carcassonne',43.213,2.351], ['30189','30','Nîmes',43.837,4.360], ['31555','31','Toulouse',43.604,1.444], ['32013','32','Auch',43.646,0.585], ['34172','34','Montpellier',43.611,3.877], ['46042','46','Cahors',44.448,1.441], ['48095','48','Mende',44.518,3.501], ['65440','65','Tarbes',43.233,0.078], ['66136','66','Perpignan',42.698,2.895], ['81004','81','Albi',43.929,2.148], ['82121','82','Montauban',44.018,1.355]
        ]},
        'pays-de-la-loire': { name: 'Pays de la Loire', cities: [
            ['44109','44','Nantes',47.218,-1.554], ['49007','49','Angers',47.478,-0.563], ['53130','53','Laval',48.070,-0.770], ['72181','72','Le Mans',48.006,0.200], ['85191','85','La Roche-sur-Yon',46.670,-1.427]
        ]},
        'provence-alpes-cote-d-azur': { name: 'Provence-Alpes-Côte d’Azur', cities: [
            ['04070','04','Digne-les-Bains',44.092,6.236], ['05061','05','Gap',44.559,6.079], ['06088','06','Nice',43.710,7.262], ['13055','13','Marseille',43.297,5.370], ['83137','83','Toulon',43.125,5.930], ['84007','84','Avignon',43.949,4.806]
        ]},
        'corse': { name: 'Corse', cities: [
            ['2A004','2A','Ajaccio',41.919,8.738], ['2B033','2B','Bastia',42.697,9.450], ['2B096','2B','Corte',42.306,9.150]
        ]}
    };
    var SIZE = { width: 980, height: 640 };
    var mapSequence = 0;
    Object.keys(REGIONS).forEach(function (slug) {
        REGIONS[slug].cities = REGIONS[slug].cities.map(function (city) {
            return { code: city[0], department: city[1], name: city[2], lat: city[3], lon: city[4], dx: 0, dy: 0 };
        });
    });

    function fetchJson(url) {
        return fetch(url, { cache: 'no-cache' }).then(function (response) {
            if (!response.ok) { throw new Error('HTTP ' + response.status); }
            return response.json();
        });
    }
    function htmlNode(name, className, value) {
        var node = document.createElement(name);
        if (className) { node.className = className; }
        if (value !== undefined) { node.textContent = value; }
        return node;
    }
    function svgNode(name, attributes, value) {
        var node = document.createElementNS('http://www.w3.org/2000/svg', name);
        Object.keys(attributes || {}).forEach(function (key) { node.setAttribute(key, attributes[key]); });
        if (value !== undefined) { node.textContent = value; }
        return node;
    }
    function coordinateBounds(features) {
        var bounds = { west: Infinity, east: -Infinity, south: Infinity, north: -Infinity };
        function visit(value) {
            if (!Array.isArray(value)) { return; }
            if (typeof value[0] === 'number' && typeof value[1] === 'number') {
                bounds.west = Math.min(bounds.west, value[0]); bounds.east = Math.max(bounds.east, value[0]);
                bounds.south = Math.min(bounds.south, value[1]); bounds.north = Math.max(bounds.north, value[1]); return;
            }
            value.forEach(visit);
        }
        features.forEach(function (feature) { visit(feature.geometry && feature.geometry.coordinates); });
        // Padding proportionnel à la taille réelle du contour : un plancher fixe trop élevé
        // (l'ancien 0.12°) écrasait les petits départements comme Paris, dont l'emprise ne
        // fait qu'environ 0.09° x 0.25°, au milieu d'un cadre presque vide.
        var xPad = Math.max((bounds.east - bounds.west) * .12, .02);
        var yPad = Math.max((bounds.north - bounds.south) * .12, .02);
        bounds.west -= xPad; bounds.east += xPad; bounds.south -= yPad; bounds.north += yPad;
        return bounds;
    }
    function projector(bounds) {
        // Correction volontairement adoucie : fidèle géographiquement sans donner
        // une impression de région trop écrasée dans le format de carte.
        var physicalLongitudeFactor = Math.cos(((bounds.south + bounds.north) / 2) * Math.PI / 180);
        var latitudeFactor = (physicalLongitudeFactor + 1) / 2;
        var scale = Math.min(SIZE.width / ((bounds.east - bounds.west) * latitudeFactor), SIZE.height / (bounds.north - bounds.south));
        var mapWidth = (bounds.east - bounds.west) * latitudeFactor * scale; var mapHeight = (bounds.north - bounds.south) * scale;
        var left = (SIZE.width - mapWidth) / 2; var top = (SIZE.height - mapHeight) / 2;
        return function (coordinate) { return [left + (coordinate[0] - bounds.west) * latitudeFactor * scale, top + (bounds.north - coordinate[1]) * scale]; };
    }
    function geometryPath(geometry, project) {
        function ringPath(ring) {
            return ring.map(function (coordinate, index) { var point = project(coordinate); return (index ? 'L' : 'M') + point[0].toFixed(1) + ',' + point[1].toFixed(1); }).join(' ') + ' Z';
        }
        if (!geometry) { return ''; }
        if (geometry.type === 'Polygon') { return geometry.coordinates.map(ringPath).join(' '); }
        if (geometry.type === 'MultiPolygon') { return geometry.coordinates.map(function (polygon) { return polygon.map(ringPath).join(' '); }).join(' '); }
        return '';
    }
    function lineGeometryPath(geometry, project) {
        function linePath(line) {
            return line.map(function (coordinate, index) { var point = project(coordinate); return (index ? 'L' : 'M') + point[0].toFixed(1) + ',' + point[1].toFixed(1); }).join(' ');
        }
        if (!geometry) { return ''; }
        if (geometry.type === 'LineString') { return linePath(geometry.coordinates); }
        if (geometry.type === 'MultiLineString') { return geometry.coordinates.map(linePath).join(' '); }
        return '';
    }
    function altitudeColor(altitude) {
        if (altitude < 100) { return '#dcefb6'; } if (altitude < 300) { return '#bcd98e'; }
        if (altitude < 700) { return '#d8bd7b'; } if (altitude < 1200) { return '#b58c61'; }
        if (altitude < 2000) { return '#8b7466'; } return '#eee9e1';
    }
    function weatherIcon(code, precipitation, cloud) {
        if (code === 7) { return '🌨️'; } if (code === 8) { return '🌫️'; } if (code === 9) { return '💨'; }
        if (precipitation >= .2 || code === 5 || code === 6) { return '🌧️'; }
        if (code >= 4 || cloud >= 85) { return '☁️'; } if (code >= 3 || cloud >= 55) { return '⛅'; }
        if (code === 2 || cloud >= 20) { return '🌤️'; } return '☀️';
    }
    function makeTimeTools(timezone) {
        return { key: new Intl.DateTimeFormat('fr-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }), hour: new Intl.DateTimeFormat('fr-FR', { timeZone: timezone, hour: '2-digit', hourCycle: 'h23' }), label: new Intl.DateTimeFormat('fr-FR', { timeZone: timezone, weekday: 'long', day: '2-digit', month: '2-digit' }) };
    }
    function parseDepartment(payload, city, tools) {
        var commune = (payload.communes || []).find(function (row) { return row[0] === city.code; });
        if (!commune) { return []; }
        var pointId = Number(commune[6]); var columns = payload.columns && payload.columns.values ? payload.columns.values : [];
        function column(name, fallback) { var position = columns.indexOf(name); return position >= 0 ? position : fallback; }
        var indexes = { temp: column('temperature_c', 0), rain: column('precipitation_mm', 2), cloud: column('cloud_cover_pct', 3), wind: column('wind_speed_kmh', 4), direction: column('wind_direction_deg', 5), gust: column('wind_gust_kmh', 6), condition: column('condition_code', 9) };
        return (payload.forecast || []).map(function (step) {
            var date = new Date(step[0]); var values = step[1][pointId];
            return { day: tools.key.format(date), hour: Number(tools.hour.format(date).replace(/\D/g, '')), temperature: Number(values[indexes.temp]) || 0, precipitation: Number(values[indexes.rain]) || 0, cloud: Number(values[indexes.cloud]) || 0, wind: Number(values[indexes.wind]) || 0, direction: Number(values[indexes.direction]) || 0, gust: Number(values[indexes.gust]) || 0, condition: Number(values[indexes.condition]) || 0 };
        });
    }
    function placeTooltip(tooltip, app, event) {
        var bounds = app.getBoundingClientRect();
        tooltip.style.left = Math.min(Math.max(8, event.clientX - bounds.left + 14), Math.max(8, bounds.width - 244)) + 'px';
        tooltip.style.top = Math.max(8, event.clientY - bounds.top + 14) + 'px';
    }
    function cityTooltip(group, tooltip, app, message) {
        function show(event) { tooltip.textContent = message; tooltip.hidden = false; if (event && event.clientX) { placeTooltip(tooltip, app, event); } }
        function hide() { tooltip.hidden = true; }
        group.addEventListener('pointerenter', show);
        group.addEventListener('pointermove', show);
        group.addEventListener('pointerleave', hide);
        group.addEventListener('focus', function () { tooltip.textContent = message; tooltip.style.left = '8px'; tooltip.style.top = '8px'; tooltip.hidden = false; });
        group.addEventListener('blur', hide);
        group.addEventListener('click', function (event) { event.stopPropagation(); if (tooltip.hidden) { show(event); } else { hide(); } });
    }
    function windDirectionLabel(direction) {
        return ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round((direction % 360) / 45) % 8];
    }
    function kmDistance(lat1, lon1, lat2, lon2) {
        var dLat = (lat2 - lat1) * 111; var dLon = (lon2 - lon1) * 111 * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
        return Math.sqrt(dLat * dLat + dLon * dLon);
    }
    function pickSpreadOutCities(rows, maxCount, minKm) {
        var chosen = [];
        rows.some(function (row) {
            var lat = Number(row[4]), lon = Number(row[5]);
            var tooClose = chosen.some(function (other) { return kmDistance(other[4], other[5], lat, lon) < minKm; });
            if (!tooClose) { chosen.push(row); }
            return chosen.length >= maxCount;
        });
        return chosen;
    }
    function boxesOverlap(first, second) {
        return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
    }
    function cityBox(city, x, y) {
        var lines = cityLabelLines(city.name), nameWidth = Math.min(154, Math.max(82, Math.max.apply(null, lines.map(function (line) { return line.length * 7.2; }))));
        return { left: x - nameWidth / 2 - 5, right: x + Math.max(nameWidth / 2, 62), top: y - 38, bottom: y + 47 + (lines.length - 1) * 13 };
    }
    function cityLabelLines(name) {
        if (name.length <= 17) { return [name]; }
        var words = name.replace(/-/g, '- ').split(/\s+/), lines = [''];
        words.forEach(function (word) {
            var current = lines[lines.length - 1];
            var separator = current && current.slice(-1) !== '-' ? ' ' : '';
            if (current && (current + separator + word).length > 17 && lines.length < 2) { lines.push(word); }
            else { lines[lines.length - 1] = current ? current + separator + word : word; }
        });
        return lines;
    }
    function layoutCities(cities, project, reserveLegend, strict) {
        var occupied = reserveLegend ? [{ left: 10, right: 270, top: 540, bottom: 628 }] : [];
        var candidates = [
            [0,0],[0,-56],[0,58],[68,-24],[-68,-24],[74,36],[-74,36],[0,-108],[0,110],[125,-58],[-125,-58],[130,62],[-130,62],
            [40,-90],[-40,-90],[40,92],[-40,92],[105,-14],[-105,-14],[105,16],[-105,16],[0,-160],[0,160],[170,-40],[-170,-40],[170,40],[-170,40]
        ];
        return cities.reduce(function (placed, city) {
            var base = project([city.lon, city.lat]); var choice = null; var fallback = null; var fallbackOverlaps = Infinity;
            candidates.some(function (offset) {
                var x = base[0] + offset[0], y = base[1] + offset[1], box = cityBox(city, x, y);
                if (box.left < 2 || box.right > SIZE.width - 2 || box.top < 2 || box.bottom > SIZE.height - 2) { return false; }
                var overlaps = occupied.filter(function (other) { return boxesOverlap(box, other); }).length;
                if (overlaps === 0) { choice = { city: city, base: base, x: x, y: y, box: box }; return true; }
                if (overlaps < fallbackOverlaps) { fallbackOverlaps = overlaps; fallback = { city: city, base: base, x: x, y: y, box: box }; }
                return false;
            });
            // Une étiquette qui chevauche une autre les rend toutes les deux illisibles : en mode
            // strict (cartes départementales, où l'on force jusqu'à 24 villes) on préfère omettre
            // une ville plutôt que de superposer son étiquette à une autre déjà placée. En mode
            // large (cartes régionales, peu de villes très espacées) on garde un repli pour éviter
            // qu'une ville ne disparaisse totalement alors qu'il y a largement la place.
            if (!choice && !strict) { choice = fallback || { city: city, base: base, x: base[0], y: base[1], box: cityBox(city, base[0], base[1]) }; }
            if (!choice) { return placed; }
            occupied.push(choice.box); placed.push(choice);
            return placed;
        }, []);
    }
    function renderMap(title, targetHour, dayKey, forecasts, boundaries, region, project, tooltip, app, terrain, rivers, strictLayout) {
        var panel = htmlNode('article', 'hkw-ara-icon-panel'); panel.appendChild(htmlNode('h3', '', title));
        var svg = svgNode('svg', { viewBox: '0 0 ' + SIZE.width + ' ' + SIZE.height, role: 'img', 'aria-label': title + ' en ' + region.name });
        var clipId = 'hkw-department-clip-' + (++mapSequence), hasRelief = !!(terrain && terrain.some(function (point) { return point.altitude > 100; }));
        var defs = svgNode('defs'); var clip = svgNode('clipPath', { id: clipId });
        boundaries.forEach(function (feature) { clip.appendChild(svgNode('path', { d: geometryPath(feature.geometry, project) })); });
        if (hasRelief) {
            var reliefFilter = svgNode('filter', { id: clipId + '-relief', x: '-15%', y: '-15%', width: '130%', height: '130%' });
            reliefFilter.appendChild(svgNode('feGaussianBlur', { stdDeviation: 15 })); defs.appendChild(reliefFilter);
        }
        defs.appendChild(clip); svg.appendChild(defs);
        if (hasRelief) {
            var reliefGroup = svgNode('g', { class: 'hkw-ara-relief', 'clip-path': 'url(#' + clipId + ')', filter: 'url(#' + clipId + '-relief)' });
            terrain.forEach(function (point) { var position = project([point.lon, point.lat]); reliefGroup.appendChild(svgNode('circle', { cx: position[0], cy: position[1], r: 44, fill: altitudeColor(point.altitude) })); });
            svg.appendChild(reliefGroup);
        }
        var mapGroup = svgNode('g', { class: 'hkw-ara-departments' });
        boundaries.forEach(function (feature) { mapGroup.appendChild(svgNode('path', { d: geometryPath(feature.geometry, project) })); }); svg.appendChild(mapGroup);
        if (rivers && rivers.length) {
            var riverGroup = svgNode('g', { class: 'hkw-ara-rivers', 'clip-path': 'url(#' + clipId + ')' });
            rivers.forEach(function (feature) { var path = lineGeometryPath(feature.geometry, project); if (path) { riverGroup.appendChild(svgNode('path', { d: path })); } });
            svg.appendChild(riverGroup);
        }
        if (hasRelief) {
            var legend = svgNode('g', { class: 'hkw-ara-map-legend', transform: 'translate(14 545)' });
            legend.appendChild(svgNode('rect', { x: 0, y: 0, width: 250, height: 77, rx: 8 }));
            legend.appendChild(svgNode('text', { x: 10, y: 18, class: 'hkw-ara-legend-title' }, 'Relief (m)'));
            [[0,'0'],[300,'300'],[700,'700'],[1200,'1 200'],[2000,'2 000+']].forEach(function (item, index) {
                legend.appendChild(svgNode('rect', { x: 10 + index * 45, y: 26, width: 26, height: 10, fill: altitudeColor(item[0]) }));
                legend.appendChild(svgNode('text', { x: 10 + index * 45, y: 50 }, item[1]));
            });
            svg.appendChild(legend);
        }
        layoutCities(region.cities, project, hasRelief, strictLayout).forEach(function (layout) {
            var city = layout.city;
            var row = (forecasts[city.code] || []).reduce(function (best, candidate) { if (candidate.day !== dayKey) { return best; } return !best || Math.abs(candidate.hour - targetHour) < Math.abs(best.hour - targetHour) ? candidate : best; }, null);
            if (!row) { return; }
            var moved = layout.x !== layout.base[0] || layout.y !== layout.base[1];
            if (moved) { svg.appendChild(svgNode('line', { class: 'hkw-ara-city-leader', x1: layout.base[0].toFixed(1), y1: layout.base[1].toFixed(1), x2: layout.x.toFixed(1), y2: layout.y.toFixed(1) })); }
            svg.appendChild(svgNode('circle', { class: 'hkw-ara-city-dot', cx: layout.base[0].toFixed(1), cy: layout.base[1].toFixed(1), r: 3.4 }));
            var group = svgNode('g', { class: 'hkw-ara-city', transform: 'translate(' + layout.x + ' ' + layout.y + ')', tabindex: '0', role: 'button', 'aria-label': 'Détails météo pour ' + city.name });
            group.appendChild(svgNode('text', { class: 'hkw-ara-weather-icon', x: 0, y: 0, 'text-anchor': 'middle' }, weatherIcon(row.condition, row.precipitation, row.cloud)));
            group.appendChild(svgNode('text', { class: 'hkw-ara-temperature', x: 24, y: 2 }, Math.round(row.temperature) + '°'));
            var cityName = svgNode('text', { class: 'hkw-ara-city-name', x: 0, y: 22, 'text-anchor': 'middle' });
            cityLabelLines(city.name).forEach(function (line, index) { cityName.appendChild(svgNode('tspan', { x: 0, dy: index ? 13 : 0 }, line)); }); group.appendChild(cityName);
            var windY = 39 + (cityLabelLines(city.name).length - 1) * 13;
            group.appendChild(svgNode('text', { class: 'hkw-ara-wind-arrow', x: -28, y: windY, transform: 'rotate(' + (row.direction + 90) + ' -28 ' + (windY - 5) + ')' }, '➤'));
            group.appendChild(svgNode('text', { class: 'hkw-ara-wind-force', x: -12, y: windY }, Math.round(row.wind) + ' km/h'));
            group.appendChild(svgNode('title', {}, city.name + ' · ' + Math.round(row.temperature) + ' °C · pluie ' + row.precipitation.toFixed(1) + ' mm'));
            cityTooltip(group, tooltip, app, city.name + '\n' + Math.round(row.temperature) + ' °C · pluie ' + row.precipitation.toFixed(1) + ' mm/h\nNuages : ' + Math.round(row.cloud) + ' %\nVent : ' + windDirectionLabel(row.direction) + ' ' + Math.round(row.wind) + ' km/h · rafales ' + Math.round(row.gust) + ' km/h');
            svg.appendChild(group);
        });
        svg.appendChild(svgNode('text', { x: SIZE.width - 14, y: SIZE.height - 14, 'text-anchor': 'end', class: 'hkw-ara-brand' }, 'www.alertes-meteo.com'));
        panel.appendChild(svg); return panel;
    }
    function pointInRing(point, ring) {
        var inside = false;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
            if (((yi > point[1]) !== (yj > point[1])) && point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi) { inside = !inside; }
        }
        return inside;
    }
    function pointInGeometry(point, geometry) {
        function inPolygon(polygon) { return polygon.length && pointInRing(point, polygon[0]) && !polygon.slice(1).some(function (hole) { return pointInRing(point, hole); }); }
        if (!geometry) { return false; }
        if (geometry.type === 'Polygon') { return inPolygon(geometry.coordinates); }
        if (geometry.type === 'MultiPolygon') { return geometry.coordinates.some(inPolygon); }
        return false;
    }
    function init(app) {
        var base = (app.dataset.baseUrl || '').replace(/\/+$/, ''); var tools = makeTimeTools(app.dataset.timezone || 'Europe/Paris');
        var heading = app.querySelector('h2'); var selector = htmlNode('select', 'hkw-region-selector'); var controls = htmlNode('div', 'hkw-region-controls'); var content = htmlNode('div', 'hkw-region-content'); var tooltip = htmlNode('div', 'hkw-ara-tooltip');
        tooltip.hidden = true; tooltip.setAttribute('role', 'tooltip'); app.appendChild(tooltip);
        var boundaryPromise = fetchJson(app.dataset.boundaryUrl);
        Object.keys(REGIONS).forEach(function (slug) { var option = htmlNode('option', '', REGIONS[slug].name); option.value = slug; selector.appendChild(option); });
        selector.value = REGIONS[app.dataset.region] ? app.dataset.region : 'auvergne-rhone-alpes';
        var controlLabel = htmlNode('label', '', 'Région :'); controls.appendChild(controlLabel); controls.appendChild(selector);
        if (app.dataset.selector !== 'non') { app.insertBefore(controls, app.querySelector('.hkw-ara-icons-loading')); }
        app.appendChild(content);
        function loadRegion(slug) {
            var region = REGIONS[slug]; var departments = Array.from(new Set(region.cities.map(function (city) { return city.department; })));
            content.replaceChildren(htmlNode('p', 'hkw-ara-icons-loading', 'Chargement des prévisions HARMONIE…'));
            if (app.dataset.customTitle !== 'oui') { heading.textContent = 'Prévisions météo — ' + region.name; }
            Promise.all([boundaryPromise, fetchJson(app.dataset.riversUrl)].concat(departments.map(function (code) { return fetchJson(base + '/departements/' + code + '.json'); }))).then(function (payloads) {
                var geojson = payloads.shift(); var riverData = payloads.shift(); var byDepartment = {}; departments.forEach(function (code, index) { byDepartment[code] = payloads[index]; });
                var forecasts = {}; region.cities.forEach(function (city) { forecasts[city.code] = parseDepartment(byDepartment[city.department], city, tools); });
                var firstRows = []; region.cities.some(function (city) { firstRows = forecasts[city.code] || []; return firstRows.length > 0; });
                var days = Array.from(new Set(firstRows.map(function (row) { return row.day; }))).slice(0, 3);
                var boundaries = (geojson.features || []).filter(function (feature) { return departments.indexOf(String(feature.properties.code).toUpperCase()) >= 0; });
                if (!days.length || !boundaries.length) { throw new Error('données régionales incomplètes'); }
                var terrain = departments.reduce(function (points, code) {
                    var payload = byDepartment[code];
                    return points.concat((payload && payload.points || []).map(function (row) { return { lat: Number(row[1]), lon: Number(row[2]), altitude: Math.max(0, Number(row[3]) || 0) }; }));
                }, []);
                var rivers = riverData.features || [];
                var project = projector(coordinateBounds(boundaries)); var navigation = htmlNode('div', 'hkw-ara-day-buttons'); var maps = htmlNode('div', 'hkw-ara-icon-maps'); content.replaceChildren(navigation, maps);
                function display(day, activeButton) {
                    navigation.querySelectorAll('button').forEach(function (button) { button.classList.toggle('is-active', button === activeButton); });
                    maps.replaceChildren(renderMap('Matin · 09 h', 9, day, forecasts, boundaries, region, project, tooltip, app, terrain, rivers), renderMap('Après-midi · 15 h', 15, day, forecasts, boundaries, region, project, tooltip, app, terrain, rivers));
                }
                days.forEach(function (day, index) { var button = htmlNode('button', '', tools.label.format(new Date(day + 'T12:00:00'))); button.type = 'button'; button.addEventListener('click', function () { display(day, button); }); navigation.appendChild(button); if (index === 0) { display(day, button); } });
            }).catch(function (error) { content.replaceChildren(htmlNode('p', 'hkw-ara-icons-error', 'Carte indisponible : ' + error.message)); });
        }
        function loadDepartment(department) {
            content.replaceChildren(htmlNode('p', 'hkw-ara-icons-loading', 'Chargement des prévisions HARMONIE…'));
            Promise.all([boundaryPromise, fetchJson(base + '/departements/' + department + '.json'), fetchJson(app.dataset.riversUrl)]).then(function (payloads) {
                var geojson = payloads[0]; var payload = payloads[1]; var riverData = payloads[2];
                var boundaries = (geojson.features || []).filter(function (feature) { return String(feature.properties.code).toUpperCase() === department; });
                if (!boundaries.length) { throw new Error('contour départemental introuvable'); }
                var candidateRows = (payload.communes || []).filter(function (row) {
                    return row[0] && row[1] && isFinite(Number(row[4])) && isFinite(Number(row[5])) && Number(row[6]) >= 0;
                }).sort(function (left, right) {
                    return Number(right[3]) - Number(left[3]);
                });
                // Les villes trop proches les unes des autres (ex. agglomérations frontalières denses
                // comme le Pays de Gex) rendent les étiquettes illisibles si on force les 24 villes les
                // plus peuplées : on garde la plus peuplée de chaque groupe rapproché et on complète
                // avec des villes plus éloignées plutôt que d'entasser un cluster.
                var cities = pickSpreadOutCities(candidateRows, 24, 6).map(function (row) {
                    return { code: row[0], department: department, name: row[1], lat: Number(row[4]), lon: Number(row[5]), dx: 0, dy: 0 };
                });
                if (!cities.length) { throw new Error('villes départementales introuvables'); }
                var departmentName = boundaries[0].properties.nom || ('Département ' + department);
                var region = { name: departmentName, cities: cities };
                if (app.dataset.customTitle !== 'oui') { heading.textContent = 'Prévisions météo — ' + departmentName; }
                var forecasts = {}; cities.forEach(function (city) { forecasts[city.code] = parseDepartment(payload, city, tools); });
                var terrain = (payload.points || []).map(function (row) { return { lat: Number(row[1]), lon: Number(row[2]), altitude: Math.max(0, Number(row[3]) || 0) }; });
                var rivers = riverData.features || [];
                var firstRows = []; cities.some(function (city) { firstRows = forecasts[city.code] || []; return firstRows.length > 0; });
                var days = Array.from(new Set(firstRows.map(function (row) { return row.day; }))).slice(0, 3);
                if (!days.length) { throw new Error('prévisions départementales indisponibles'); }
                var project = projector(coordinateBounds(boundaries)); var navigation = htmlNode('div', 'hkw-ara-day-buttons'); var maps = htmlNode('div', 'hkw-ara-icon-maps'); content.replaceChildren(navigation, maps);
                function display(day, activeButton) {
                    navigation.querySelectorAll('button').forEach(function (button) { button.classList.toggle('is-active', button === activeButton); });
                    maps.replaceChildren(renderMap('Matin · 09 h', 9, day, forecasts, boundaries, region, project, tooltip, app, terrain, rivers, true), renderMap('Après-midi · 15 h', 15, day, forecasts, boundaries, region, project, tooltip, app, terrain, rivers, true));
                }
                days.forEach(function (day, index) { var button = htmlNode('button', '', tools.label.format(new Date(day + 'T12:00:00'))); button.type = 'button'; button.addEventListener('click', function () { display(day, button); }); navigation.appendChild(button); if (index === 0) { display(day, button); } });
            }).catch(function (error) { content.replaceChildren(htmlNode('p', 'hkw-ara-icons-error', 'Carte indisponible : ' + error.message)); });
        }
        var loading = app.querySelector(':scope > .hkw-ara-icons-loading'); if (loading) { loading.remove(); }
        if (app.dataset.department) {
            controlLabel.textContent = 'Département :'; selector.disabled = true;
            boundaryPromise.then(function (geojson) {
                selector.replaceChildren();
                (geojson.features || []).slice().sort(function (left, right) { return String(left.properties.code).localeCompare(String(right.properties.code), 'fr', { numeric: true }); }).forEach(function (feature) {
                    var code = String(feature.properties.code).toUpperCase(); var option = htmlNode('option', '', code + ' — ' + feature.properties.nom); option.value = code; selector.appendChild(option);
                });
                selector.value = app.dataset.department; selector.disabled = false;
            });
            var locationButton = htmlNode('button', 'hkw-department-location', '⌖ Géolocalisation'); locationButton.type = 'button'; controls.appendChild(locationButton);
            locationButton.addEventListener('click', function () {
                if (!navigator.geolocation) { locationButton.textContent = 'Géolocalisation indisponible'; return; }
                locationButton.disabled = true; locationButton.textContent = 'Localisation…';
                navigator.geolocation.getCurrentPosition(function (position) {
                    boundaryPromise.then(function (geojson) {
                        var point = [position.coords.longitude, position.coords.latitude];
                        var feature = (geojson.features || []).find(function (candidate) { return pointInGeometry(point, candidate.geometry); });
                        if (!feature) { locationButton.textContent = 'Hors France métropolitaine'; locationButton.disabled = false; return; }
                        var code = String(feature.properties.code).toUpperCase(); selector.value = code; app.dataset.department = code; loadDepartment(code);
                        locationButton.textContent = '✓ ' + feature.properties.nom; locationButton.disabled = false;
                    });
                }, function () { locationButton.textContent = 'Localisation refusée'; locationButton.disabled = false; }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
            });
            selector.addEventListener('change', function () { app.dataset.department = selector.value; loadDepartment(selector.value); });
            loadDepartment(app.dataset.department);
        } else {
            selector.addEventListener('change', function () { loadRegion(selector.value); }); loadRegion(selector.value);
        }
    }
    function ready(callback) { if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', callback, { once: true }); } else { callback(); } }
    ready(function () { document.querySelectorAll('[data-hkw-ara-icons]').forEach(init); });
}());

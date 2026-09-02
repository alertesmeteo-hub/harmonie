(function () {
    'use strict';

    var DEPARTMENTS = ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74'];
    var CITIES = [
        { code: '01053', department: '01', name: 'Bourg-en-Bresse', lat: 46.205, lon: 5.226, dx: 2, dy: -2 },
        { code: '03190', department: '03', name: 'Moulins', lat: 46.566, lon: 3.335, dx: 0, dy: 0 },
        { code: '07186', department: '07', name: 'Privas', lat: 44.735, lon: 4.599, dx: -5, dy: 5 },
        { code: '15014', department: '15', name: 'Aurillac', lat: 44.926, lon: 2.441, dx: 0, dy: 2 },
        { code: '26362', department: '26', name: 'Valence', lat: 44.933, lon: 4.892, dx: 4, dy: 0 },
        { code: '38185', department: '38', name: 'Grenoble', lat: 45.188, lon: 5.724, dx: 10, dy: 4 },
        { code: '42218', department: '42', name: 'Saint-Étienne', lat: 45.440, lon: 4.387, dx: -6, dy: 5 },
        { code: '43157', department: '43', name: 'Le Puy-en-Velay', lat: 45.043, lon: 3.885, dx: -8, dy: 10 },
        { code: '63113', department: '63', name: 'Clermont-Ferrand', lat: 45.778, lon: 3.087, dx: -5, dy: 2 },
        { code: '69123', department: '69', name: 'Lyon', lat: 45.758, lon: 4.835, dx: 4, dy: -2 },
        { code: '73065', department: '73', name: 'Chambéry', lat: 45.565, lon: 5.917, dx: 5, dy: 8 },
        { code: '74010', department: '74', name: 'Annecy', lat: 45.900, lon: 6.129, dx: 4, dy: -6 }
    ];
    var VIEW = { width: 760, height: 600, west: 1.75, east: 7.35, south: 44.0, north: 46.85 };

    function fetchJson(url) {
        return fetch(url, { cache: 'no-cache' }).then(function (response) {
            if (!response.ok) { throw new Error('HTTP ' + response.status); }
            return response.json();
        });
    }

    function htmlNode(name, className, text) {
        var node = document.createElement(name);
        if (className) { node.className = className; }
        if (text !== undefined) { node.textContent = text; }
        return node;
    }

    function svgNode(name, attributes, text) {
        var node = document.createElementNS('http://www.w3.org/2000/svg', name);
        Object.keys(attributes || {}).forEach(function (key) { node.setAttribute(key, attributes[key]); });
        if (text !== undefined) { node.textContent = text; }
        return node;
    }

    function project(coordinate) {
        return [
            (coordinate[0] - VIEW.west) / (VIEW.east - VIEW.west) * VIEW.width,
            (VIEW.north - coordinate[1]) / (VIEW.north - VIEW.south) * VIEW.height
        ];
    }

    function ringPath(ring) {
        return ring.map(function (coordinate, index) {
            var point = project(coordinate);
            return (index ? 'L' : 'M') + point[0].toFixed(1) + ',' + point[1].toFixed(1);
        }).join(' ') + ' Z';
    }

    function geometryPath(geometry) {
        if (!geometry) { return ''; }
        if (geometry.type === 'Polygon') { return geometry.coordinates.map(ringPath).join(' '); }
        if (geometry.type === 'MultiPolygon') {
            return geometry.coordinates.map(function (polygon) { return polygon.map(ringPath).join(' '); }).join(' ');
        }
        return '';
    }

    function weatherIcon(code, precipitation, cloud) {
        if (code === 7) { return '🌨️'; }
        if (code === 8) { return '🌫️'; }
        if (code === 9) { return '💨'; }
        if (precipitation >= .2 || code === 5 || code === 6) { return '🌧️'; }
        if (code >= 4 || cloud >= 85) { return '☁️'; }
        if (code >= 3 || cloud >= 55) { return '⛅'; }
        if (code === 2 || cloud >= 20) { return '🌤️'; }
        return '☀️';
    }

    function makeTimeTools(timezone) {
        return {
            key: new Intl.DateTimeFormat('fr-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }),
            hour: new Intl.DateTimeFormat('fr-FR', { timeZone: timezone, hour: '2-digit', hourCycle: 'h23' }),
            label: new Intl.DateTimeFormat('fr-FR', { timeZone: timezone, weekday: 'long', day: '2-digit', month: '2-digit' })
        };
    }

    function parseDepartment(payload, city, tools) {
        var commune = (payload.communes || []).find(function (row) { return row[0] === city.code; });
        if (!commune) { return []; }
        var pointId = Number(commune[6]);
        var columns = payload.columns && payload.columns.values ? payload.columns.values : [];
        function column(name, fallback) {
            var position = columns.indexOf(name);
            return position >= 0 ? position : fallback;
        }
        var indexes = { temp: column('temperature_c', 0), rain: column('precipitation_mm', 2), cloud: column('cloud_cover_pct', 3), condition: column('condition_code', 9) };
        return (payload.forecast || []).map(function (step) {
            var date = new Date(step[0]);
            var values = step[1][pointId];
            return {
                day: tools.key.format(date), hour: Number(tools.hour.format(date).replace(/\D/g, '')),
                temperature: Number(values[indexes.temp]) || 0,
                precipitation: Number(values[indexes.rain]) || 0,
                cloud: Number(values[indexes.cloud]) || 0,
                condition: Number(values[indexes.condition]) || 0
            };
        });
    }

    function renderMap(title, targetHour, dayKey, forecasts, boundaries) {
        var panel = htmlNode('article', 'hkw-ara-icon-panel');
        panel.appendChild(htmlNode('h3', '', title));
        var svg = svgNode('svg', { viewBox: '0 0 ' + VIEW.width + ' ' + VIEW.height, role: 'img', 'aria-label': title + ' en Auvergne-Rhône-Alpes' });
        var mapGroup = svgNode('g', { class: 'hkw-ara-departments' });
        boundaries.forEach(function (feature) { mapGroup.appendChild(svgNode('path', { d: geometryPath(feature.geometry) })); });
        svg.appendChild(mapGroup);
        CITIES.forEach(function (city) {
            var rows = forecasts[city.code] || [];
            var row = rows.reduce(function (best, candidate) {
                if (candidate.day !== dayKey) { return best; }
                return !best || Math.abs(candidate.hour - targetHour) < Math.abs(best.hour - targetHour) ? candidate : best;
            }, null);
            if (!row) { return; }
            var point = project([city.lon, city.lat]);
            var group = svgNode('g', { class: 'hkw-ara-city', transform: 'translate(' + (point[0] + city.dx) + ' ' + (point[1] + city.dy) + ')' });
            group.appendChild(svgNode('text', { class: 'hkw-ara-weather-icon', x: 0, y: 0, 'text-anchor': 'middle' }, weatherIcon(row.condition, row.precipitation, row.cloud)));
            group.appendChild(svgNode('text', { class: 'hkw-ara-temperature', x: 24, y: 2 }, Math.round(row.temperature) + '°'));
            group.appendChild(svgNode('text', { class: 'hkw-ara-city-name', x: 0, y: 22, 'text-anchor': 'middle' }, city.name));
            group.appendChild(svgNode('title', {}, city.name + ' · ' + Math.round(row.temperature) + ' °C · pluie ' + row.precipitation.toFixed(1) + ' mm'));
            svg.appendChild(group);
        });
        panel.appendChild(svg);
        return panel;
    }

    function init(app) {
        var base = (app.dataset.baseUrl || '').replace(/\/+$/, '');
        var timezone = app.dataset.timezone || 'Europe/Paris';
        var tools = makeTimeTools(timezone);
        var requests = DEPARTMENTS.map(function (code) { return fetchJson(base + '/departements/' + code + '.json'); });
        requests.push(fetchJson(app.dataset.boundaryUrl));
        Promise.all(requests).then(function (payloads) {
            var geojson = payloads.pop();
            var byDepartment = {};
            DEPARTMENTS.forEach(function (code, index) { byDepartment[code] = payloads[index]; });
            var forecasts = {};
            CITIES.forEach(function (city) { forecasts[city.code] = parseDepartment(byDepartment[city.department], city, tools); });
            var firstRows = forecasts[CITIES[0].code] || [];
            var days = Array.from(new Set(firstRows.map(function (row) { return row.day; }))).slice(0, 3);
            var boundaries = (geojson.features || []).filter(function (feature) { return DEPARTMENTS.indexOf(String(feature.properties.code)) >= 0; });
            if (!days.length || !boundaries.length) { throw new Error('données régionales incomplètes'); }
            app.querySelector('.hkw-ara-icons-loading').remove();
            var navigation = htmlNode('div', 'hkw-ara-day-buttons');
            var maps = htmlNode('div', 'hkw-ara-icon-maps');
            app.appendChild(navigation); app.appendChild(maps);
            function display(day, activeButton) {
                navigation.querySelectorAll('button').forEach(function (button) { button.classList.toggle('is-active', button === activeButton); });
                maps.replaceChildren(renderMap('Matin · 09 h', 9, day, forecasts, boundaries), renderMap('Après-midi · 15 h', 15, day, forecasts, boundaries));
            }
            days.forEach(function (day, index) {
                var sample = firstRows.find(function (row) { return row.day === day; });
                var date = sample ? new Date(day + 'T12:00:00') : new Date();
                var button = htmlNode('button', '', tools.label.format(date));
                button.type = 'button';
                button.addEventListener('click', function () { display(day, button); });
                navigation.appendChild(button);
                if (index === 0) { display(day, button); }
            });
        }).catch(function (error) {
            var loading = app.querySelector('.hkw-ara-icons-loading');
            if (loading) { loading.className = 'hkw-ara-icons-error'; loading.textContent = 'Carte indisponible : ' + error.message; }
        });
    }

    function ready(callback) {
        if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', callback, { once: true }); }
        else { callback(); }
    }
    ready(function () { document.querySelectorAll('[data-hkw-ara-icons]').forEach(init); });
}());

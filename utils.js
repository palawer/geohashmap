
function combine([head, ...[headTail, ...tailTail]]) {
    if (!headTail) return head;
    const combined = headTail.reduce((acc, x) => {
        return acc.concat(head.map(h => `${h}${x}`));
    }, []);
    return combine([combined, ...tailTail]);
}

function generateGeohashes(currentGeohash) {
    currentGeohash = currentGeohash || '';
    
    var a = [];
    for (var i=0; i<1; i++) {
        a.push(base32.split(''));
    }
    var combinations = combine(a);
    
    var geohashes = [];
    for (var i=0; i<combinations.length; i++) {
        geohashes.push(currentGeohash+combinations[i]);
    }
    
    // add neighbours
    if (currentGeohash) {
        var neighbours = Geohash.neighbours(currentGeohash);
        for (var key in neighbours) {
            var geohash = neighbours[key];
            geohashes.push(geohash);
        }
    }
    
    return geohashes;
}

function generateGeojson(geohashes) {
    polygons = {};
    for (var i=0; i<geohashes.length; i++) {
        var gh = geohashes[i];
        var bounds = Geohash.bounds(gh);
        var polygon = geohashToPolygon(bounds);
        polygons[gh] = polygon;
    }
    
    var features = [];
    for (var key in polygons) {
        var polygon = polygons[key];
        features.push({
            type: "Feature",
            properties: {
                geohash: key
            },
            geometry: polygon
        });
    }
    
    var featureCollection = {
        type: "FeatureCollection",
        features: features
    };
    
    return featureCollection;
}

function geohashToPolygon(bounds) {
    polygon = {
        type: 'Polygon',
        coordinates: [[
            [bounds.sw.lon, bounds.sw.lat],
            [bounds.ne.lon, bounds.sw.lat],
            [bounds.ne.lon, bounds.ne.lat],
            [bounds.sw.lon, bounds.ne.lat],
            [bounds.sw.lon, bounds.sw.lat],
        ]]
    };
    return polygon;
}
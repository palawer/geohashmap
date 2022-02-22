function combine([head, ...[headTail, ...tailTail]]) {
  if (!headTail) return head;
  const combined = headTail.reduce((acc, x) => {
    return acc.concat(head.map((h) => `${h}${x}`));
  }, []);
  return combine([combined, ...tailTail]);
}

function generateGeohashes(geohash) {
  geohash = geohash || "";

  var geohashes = [];
  for (var i = 0; i < base32.length; i++) {
    geohashes.push(geohash + base32[i]);
  }

  // add neighbours
  if (geohash) {
    var neighbours = Geohash.neighbours(geohash);
    for (var key in neighbours) {
      var neighbour = neighbours[key];
      geohashes.push(neighbour);
    }
  }

  return geohashes;
}

function generateGeojson(geohashes) {
  polygons = {};
  for (var i = 0; i < geohashes.length; i++) {
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
        geohash: key,
      },
      geometry: polygon,
    });
  }

  var featureCollection = {
    type: "FeatureCollection",
    features: features,
  };

  return featureCollection;
}

function geohashToPolygon(bounds) {
  polygon = {
    type: "Polygon",
    coordinates: [
      [
        [bounds.sw.lon, bounds.sw.lat],
        [bounds.ne.lon, bounds.sw.lat],
        [bounds.ne.lon, bounds.ne.lat],
        [bounds.sw.lon, bounds.ne.lat],
        [bounds.sw.lon, bounds.sw.lat],
      ],
    ],
  };
  return polygon;
}

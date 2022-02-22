function combine([head, ...[headTail, ...tailTail]]) {
  if (!headTail) return head;
  const combined = headTail.reduce((acc, x) => {
    return acc.concat(head.map((h) => `${h}${x}`));
  }, []);
  return combine([combined, ...tailTail]);
}

function generateGeohashes(geohash) {
  geohash = geohash || "";

  const geohashes = [...base32].map((char) => {
    return geohash + char;
  });

  // add neighbours
  if (geohash) {
    const neighbours = Geohash.neighbours(geohash);
    for (const key in neighbours) {
      const neighbour = neighbours[key];
      geohashes.push(neighbour);
    }
  }

  return geohashes;
}

function generateGeojson(geohashes) {
  let polygons = {};
  for (const geohash of geohashes) {
    const bounds = Geohash.bounds(geohash);
    const polygon = geohashToPolygon(bounds);
    polygons[geohash] = polygon;
  }

  let features = [];
  for (const geohash in polygons) {
    const polygon = polygons[geohash];
    features.push({
      type: "Feature",
      properties: {
        geohash: geohash,
      },
      geometry: polygon,
    });
  }

  const featureCollection = {
    type: "FeatureCollection",
    features: features,
  };

  return featureCollection;
}

function geohashToPolygon(bounds) {
  const polygon = {
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

function getNominatimInfo(geohash) {
  const { lat, lon } = Geohash.decode(geohash);
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => console.log(geohash, data.address))
    .catch((error) => console.log(error));
}

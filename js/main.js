const MAX_GEOHASH_LENGTH = 7;

var map = L.map("map").setView([0, 0], 2);
L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);

var geojsonLayer;

start();

function start(currentGeohash) {
  var geohashes = generateGeohashes(currentGeohash);
  var featureCollection = generateGeojson(geohashes);
  geojsonLayer = loadGeojsonData(featureCollection);
}

function style(feature) {
  return {
    color: "#ff7800",
    weight: 1,
    opacity: 1,
  };
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: clickFeature,
  });
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 2,
    color: "lime",
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojsonLayer.resetStyle(e.target);
  info.update();
}

function clickFeature(e) {
  var geohash = e.target.feature.properties.geohash;

  if (geohash.length >= MAX_GEOHASH_LENGTH) {
    getNominatimInfo(geohash);
  } else {
    zoomIn(e);
  }
}

function getNominatimInfo(geohash) {
  var decoded_gh = Geohash.decode(geohash);
  const url = `https://nominatim.openstreetmap.org/reverse.php?format=json&lat=${decoded_gh.lat}&lon=${decoded_gh.lon}&zoom=14&addressdetails=1`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => console.log(data.address))
    .catch((error) => console.log(error));
}

function zoomIn(e) {
  var geohash = e.target.feature.properties.geohash;

  map.fitBounds(e.target.getBounds(), {
    padding: [200, 200],
  });

  map.removeLayer(geojsonLayer);
  start(geohash);
}

/*
// add world countries
fetch('./data/world_countries_v7.geojson')
.then(response => response.json())
.then(data => {
L.geoJSON(data, {
}).addTo(map);
})
.catch(error => console.log(error));
*/

function loadGeojsonData(featureCollection) {
  var geojsonLayer = L.geoJSON(featureCollection, {
    style: style,
    onEachFeature: onEachFeature,
  }).addTo(map);

  return geojsonLayer;
}

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (properties) {
  this._div.innerHTML =
    "<h4>Geohash</h4>" +
    (properties ? "<b>" + properties.geohash + "</b>" : "Hover over a geohash");
};

info.addTo(map);

/*
function getMapZoom(map) {
const zoom = map.getZoom();
console.log(zoom);
}

function getMapBounds(map) {
const bounds = map.getBounds();
console.log(bounds);
}

map.on('moveend', function(e) {
var map = e.target;
getMapZoom(map);
//getMapBounds(map);
});
*/

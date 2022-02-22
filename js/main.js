const MAX_GEOHASH_LENGTH = 7;

var map = L.map("map").setView([0, 0], 2);
L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);

var geojsonLayer;
var currentGeohash;

start();

function start(geohash) {
  currentGeohash = geohash;
  console.log(currentGeohash);
  var geohashes = generateGeohashes(geohash);
  var featureCollection = generateGeojson(geohashes);
  geojsonLayer = loadGeojsonData(featureCollection);
}

function style(feature) {
  return {
    color: "#ff7800",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.1,
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
    .then((data) => console.log(geohash, data.address))
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

function zoomOut() {
  const geohash = currentGeohash.slice(0, -1);

  map.fitBounds(geojsonLayer.getBounds(), {
    padding: [200, 200],
  });

  map.removeLayer(geojsonLayer);
  start(geohash);
}

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

// add home button
var homeControl = L.Control.extend({
  options: {
    position: "topleft", //topright, bottomleft, bottomright
  },
  onAdd: function (map) {
    var container = L.DomUtil.create(
      "div",
      "leaflet-control-zoom leaflet-bar leaflet-control"
    );
    var button = L.DomUtil.create(
      "a",
      "leaflet-control-zoom-in map-control-home",
      container
    );
    button.href = "#";
    button.style.lineHeight = "34px";
    button.text = "^";

    button.onclick = function (e) {
      e.preventDefault();
      zoomOut();
      return false;
    };
    return container;
  },
});
map.addControl(new homeControl());

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

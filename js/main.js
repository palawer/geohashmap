const MAX_GEOHASH_LENGTH = 7;

var map = L.map("map").setView([0, 0], 2);
//L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let geojsonLayer;
let currentGeohash;

const $historyBox = document.getElementById("historyBox");
const $resetButton = document.getElementById("resetButton");
const $currentLevel = document.getElementById("currentLevel");
const $currentGeohash = document.getElementById("currentGeohash");
const $lastGeohash = document.getElementById("lastGeohash");
const $overGeohash = document.getElementById("overGeohash");

function addGeohashToHistory(geohash) {
  $lastGeohash.textContent = geohash;
  $historyBox.textContent = geohash + "\n" + $historyBox.textContent;
}

$resetButton.onclick = function () {
  $historyBox.textContent = "";
};

function renderInfo() {
  $currentLevel.textContent = currentGeohash.length || "-";
  $currentGeohash.textContent = currentGeohash || "-";
}

function start(geohash) {
  currentGeohash = geohash || "";
  var geohashes = generateGeohashes(geohash);
  var featureCollection = generateGeojson(geohashes);
  geojsonLayer = loadGeojsonData(featureCollection);
  renderInfo();
}

start();

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
  const geohash = layer.feature.properties.geohash;

  if (geohash.length >= 7) {
    layer.setStyle({
      weight: 3,
      color: "#007aff",
    });
  } else {
    layer.setStyle({
      weight: 3,
      color: "lime",
    });
  }

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  $overGeohash.textContent = geohash;
}

function resetHighlight(e) {
  geojsonLayer.resetStyle(e.target);
  $overGeohash.textContent = "-";
}

function clickFeature(e) {
  var geohash = e.target.feature.properties.geohash;

  if (geohash.length >= MAX_GEOHASH_LENGTH) {
    addGeohashToHistory(geohash);
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

"use strict";

const MAX_GEOHASH_LENGTH = 9;
const BOUNDS_PADDING = 200;

const map = L.map("map", {
  scrollWheelZoom: false,
  doubleClickZoom: false,
}).setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let geojsonLayer;
let currentGeohash;

const $historyBox = document.getElementById("historyBox");
const $resetButton = document.getElementById("resetButton");
const $goToForm = document.getElementById("goToForm");
const $goToInput = document.getElementById("goToInput");
const $goToButton = document.getElementById("goToButton");
const $currentLevel = document.getElementById("currentLevel");
const $currentGeohash = document.getElementById("currentGeohash");
const $overGeohash = document.getElementById("overGeohash");

const addGeohashToHistory = (geohash) => {
  if (geohash) {
    $historyBox.textContent = geohash + "\n" + $historyBox.textContent;
  }
};

$resetButton.onclick = () => {
  $historyBox.textContent = "";
};

const renderInfo = () => {
  $currentLevel.textContent = currentGeohash.length || "-";
  $currentGeohash.textContent = currentGeohash || "-";
};

const featureStyle = (feature) => {
  return {
    color: "#ff7800",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.1,
  };
};

const onEachFeature = (feature, layer) => {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: clickFeature,
  });
};

const highlightFeature = (e) => {
  const layer = e.target;
  const geohash = layer.feature.properties.geohash;

  layer.setStyle({
    weight: 3,
    color: "lime",
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  $overGeohash.textContent = geohash;
};

const resetHighlight = (e) => {
  geojsonLayer.resetStyle(e.target);
  $overGeohash.textContent = "-";
};

const clickFeature = (e) => {
  const geohash = e.target.feature.properties.geohash;
  if (geohash.length <= MAX_GEOHASH_LENGTH) {
    zoomIn(e);
  }
};

const zoomIn = (e) => {
  const geohash = e.target.feature.properties.geohash;
  start(geohash);
};

const zoomOut = () => {
  const geohash = currentGeohash.slice(0, -1);
  start(geohash);
};

const loadGeojsonData = (featureCollection) => {
  if (geojsonLayer) {
    map.removeLayer(geojsonLayer);
  }
  
  geojsonLayer = L.geoJSON(featureCollection, {
    style: featureStyle,
    onEachFeature: onEachFeature,
  }).addTo(map);
  
  /*map.fitBounds(geojsonLayer.getBounds(), {
    padding: [BOUNDS_PADDING, BOUNDS_PADDING],
  });*/
  map.fitBounds(geojsonLayer.getBounds());
};

const start = (geohash) => {
  currentGeohash = geohash || "";
  
  const stopPopulating = currentGeohash.length >= MAX_GEOHASH_LENGTH;
  const geohashes = generateGeohashes(geohash, stopPopulating);
  const featureCollection = generateGeojson(geohashes);
  
  loadGeojsonData(featureCollection);
  addGeohashToHistory(geohash);
  renderInfo();
};

$goToForm.onsubmit = (e) => {
  e.preventDefault();
  
  const geohash = $goToInput.value;
  $goToInput.classList.remove('invalidInput');
  
  try {
    const bounds = Geohash.bounds(geohash);
    start(geohash);
  } catch (e) {
    console.log('Invalid geohash');
    $goToInput.classList.add('invalidInput');
  }
  
  return false;
};

start();
$goToInput.focus();

// add home button
const homeControl = L.Control.extend({
  options: {
    position: "topleft", //topright, bottomleft, bottomright
  },
  onAdd: (map) => {
    const container = L.DomUtil.create(
      "div",
      "leaflet-control-zoom leaflet-bar leaflet-control"
    );
    const button = L.DomUtil.create(
      "a",
      "leaflet-control-zoom-in map-control-home",
      container
    );
    button.href = "#";
    button.style.lineHeight = "34px";
    button.text = "^";

    button.onclick = (e) => {
      e.preventDefault();
      zoomOut();
      return false;
    };
    return container;
  },
});
map.addControl(new homeControl());

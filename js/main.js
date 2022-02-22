"use strict";

const MAX_GEOHASH_LENGTH = 7;
const BOUNDS_PADDING = 200;

const map = L.map("map").setView([0, 0], 2);
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

const addGeohashToHistory = (geohash) => {
  $lastGeohash.textContent = geohash;
  $historyBox.textContent = geohash + "\n" + $historyBox.textContent;
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

  if (geohash.length >= MAX_GEOHASH_LENGTH) {
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
};

const resetHighlight = (e) => {
  geojsonLayer.resetStyle(e.target);
  $overGeohash.textContent = "-";
};

const clickFeature = (e) => {
  const geohash = e.target.feature.properties.geohash;

  if (geohash.length >= MAX_GEOHASH_LENGTH) {
    addGeohashToHistory(geohash);
    getNominatimInfo(geohash);
  } else {
    zoomIn(e);
  }
};

const zoomIn = (e) => {
  const geohash = e.target.feature.properties.geohash;

  map.fitBounds(e.target.getBounds(), {
    padding: [BOUNDS_PADDING, BOUNDS_PADDING],
  });

  map.removeLayer(geojsonLayer);
  start(geohash);
};

const zoomOut = () => {
  const geohash = currentGeohash.slice(0, -1);

  map.fitBounds(geojsonLayer.getBounds(), {
    padding: [BOUNDS_PADDING, BOUNDS_PADDING],
  });

  map.removeLayer(geojsonLayer);
  start(geohash);
};

const loadGeojsonData = (featureCollection) => {
  const geojsonLayer = L.geoJSON(featureCollection, {
    style: featureStyle,
    onEachFeature: onEachFeature,
  }).addTo(map);

  return geojsonLayer;
};

const start = (geohash) => {
  currentGeohash = geohash || "";
  const geohashes = generateGeohashes(geohash);
  const featureCollection = generateGeojson(geohashes);
  geojsonLayer = loadGeojsonData(featureCollection);
  renderInfo();
};

start();

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

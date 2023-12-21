import suitability from "./suitability_values.js";

var coord = [-1.183, 37.117];
var map = L.map("map").setView(coord, 15);
var tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const southwest = [-0.7492605935410523, 36.42414663046995];
const northeast = [-1.3641416388587118, 37.475949540026704];

const rectangle = L.rectangle([[southwest, northeast]], {
  color: "blue",
  weight: 1,
  fillOpacity: 0.0,
}).addTo(map);
const bounds = rectangle.getBounds();

// Fit the map to the bounds of the bounding box
map.fitBounds(bounds);

// Function to handle geolocation
function getLocation() {
  if (navigator.geolocation) {
    // Geolocation is supported
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function getSuitability(value) {
  value = Math.round(value); // Round off to the nearest whole number
  if (value < 3) {
    return "Unsuitable";
  } else if (value === 3) {
    return "Marginally suitable";
  } else if (value === 4) {
    return "Moderately suitable";
  } else if (value === 5 || value > 5) {
    return "Highly suitable";
  } else {
    return "Suitability value out of range";
  }
}

function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  // Perform reverse geocoding to get the sublocation based on coordinates
  const userCoordinates = [longitude, latitude];

  let userSublocation = null;

  // Iterate through features to find the sublocation based on the user's coordinates
  let sublocationFound = false;

  suitability.features.forEach((feature) => {
    if (
      !sublocationFound &&
      feature.geometry.type === "Polygon" &&
      feature.geometry.coordinates.length > 0
    ) {
      feature.geometry.coordinates.forEach((polygonCoordinates) => {
        if (polygonCoordinates.length < 4) {
          console.error("Invalid Polygon: ", polygonCoordinates);
        } else {
          const sublocationPolygon = turf.polygon([polygonCoordinates]);
          const userPoint = turf.point(userCoordinates);

          if (turf.booleanPointInPolygon(userPoint, sublocationPolygon)) {
            userSublocation = feature.properties.NAME_5;
            const suitabilityValue = Math.round(feature.properties.MIN);

            // console.log("User is inside:", userSublocation);
            sublocationFound = true; // Set flag to exit loop

            // Add marker at user's location
            const userMarker = L.marker([latitude, longitude]).addTo(map);

            // Create popup with sublocation name
            userMarker
              .bindPopup(
                // `Sublocation: ${userSublocation}`
                `Sublocation: ${userSublocation}<br>Suitability: ${getSuitability(
                  suitabilityValue
                )}`
              )
              .openPopup();

            // Highlight the boundary of the identified sublocation
            const boundaryLayer = L.geoJSON(feature, {
              style: {
                color: "red",
                weight: 3,
                opacity: 1,
                fillOpacity: 0,
              },
            }).addTo(map);
          } else {
            console.log("User is outside this sublocation.");
          }
        }
      });
    }
  });
}

// Function to handle geolocation errors
function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}

// Call the getLocation function to initiate geolocation retrieval when needed
getLocation();

//define the colors
function getColor(d) {
  if (d > 5) {
    return "#FC4E2A";
  } else if (d > 4) {
    return "#FD8D3C";
  } else if (d > 3) {
    return "#FEB24C";
  } else if (d > 2) {
    return "#FED976";
  } else {
    return "#FFEDA0";
  }
}

//implement strying of the map
function style(feature) {
  const minPropertyValue = feature.properties.MIN;

  const fillColor = getColor(minPropertyValue);

  return {
    fillColor: fillColor,
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
    backdropFilter: "blur(6px)",
  };
}

//highlighting the feature
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7,
  });

  layer.bringToFront();
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

var geojson;
geojson = L.geoJson(suitability, {
  style: style,
  onEachFeature: onEachFeature,
}).addTo(map);

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();
  return this._div;
};

//screen sizing
const mediaQuery = window.matchMedia("(max-width:500px");

//information bar
info.update = function (props) {
  this._div.innerHTML =
    "<h4>Kiambu Basil suitability</h4>" +
    (props
      ? "<b>" + props.NAME_5 + "</b><br />" + getSuitability(props.MIN)
      : mediaQuery.matches
      ? "click on sublocation"
      : "Hover over sublocation");
};

info.addTo(map);

let suitability_values = {
  0: "Unsuitable",
  1: "Unsuitable",
  2: "Unsuitable",
  3: "Marginally suitable",
  4: "Moderately suitable",
  5: "Highly suitable",
  6: "Highly suitable",
};

// Filter out repeated values
let uniqueSuitabilityValues = {};
for (let key in suitability_values) {
  if (!uniqueSuitabilityValues[suitability_values[key]]) {
    uniqueSuitabilityValues[suitability_values[key]] = key;
  }
}

// Update legend based on unique values
var legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend"),
    labels = [];

  for (var key in uniqueSuitabilityValues) {
    labels.push(
      '<span  class="legend-item" style="background:' +
        getColor(parseInt(uniqueSuitabilityValues[key])) +
        '"></span> ' +
        key
    );
  }

  div.innerHTML = labels.join("<br>");
  return div;
};

legend.addTo(map);

//implementing search function
const searchInput = document.querySelector("#search-input");
const resultBox = document.querySelector(".result-box");

const filteredFeatures = suitability.features.map((feature) => {
  return feature.properties.NAME_5.toLowerCase();
});

searchInput.onkeydown = function () {
  let result = [];
  let input = searchInput.value;

  if (input.length) {
    result = filteredFeatures.filter((keyword) => {
      return keyword.toLowerCase().includes(input.toLowerCase());
    });
  }
  display(result);
};

//a function that displays the list of searched
function display(result) {
  const content = result.map((list) => {
    return `<li class="sublocation"> ${list} </li>`;
  });

  resultBox.innerHTML = `<ul class="ul"> ${content.join("")} </ul>`;

  const sublocationItems = document.querySelectorAll(".sublocation");

  let highlightedLayer = null;

  sublocationItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const clickedSublocation = e.target.textContent.trim().toLowerCase();

      let selectedFeature = suitability.features.find((feature) => {
        const featureName = feature.properties.NAME_5.trim().toLowerCase();
        return featureName === clickedSublocation;
      });

      if (selectedFeature) {
        clearPrevious();

        const bounds = L.geoJSON(selectedFeature).getBounds();
        map.fitBounds(bounds);

        // Calculate centroid of the polygon
        const centroid = L.geoJSON(selectedFeature).getBounds().getCenter();
        const sublocationName = selectedFeature.properties.NAME_5;

        // Store the selected feature for highlighting
        highlightedLayer = L.geoJSON(selectedFeature, {
          style: function (feature) {
            const minPropertyValue = feature.properties.MIN;
            const fillColor = getColor(minPropertyValue);

            return {
              fillColor: fillColor,
              color: "red",
              weight: 3,
              opacity: 1,
              fillOpacity: 0,
            };
          },
        }).addTo(map);
      }

      // Update info panel with selected sublocation's properties
      info.update(selectedFeature.properties);
      // Function to clear existing highlighted layer and marker
      function clearPrevious() {
        if (highlightedLayer) {
          map.removeLayer(highlightedLayer);
          highlightedLayer = null;
        }
      }
    });
  });
}

// /set the copyright at the bottom of the page
let copyright = document.querySelector(".copyright");
const date = new Date().getFullYear();
copyright.insertAdjacentHTML("beforeend", `<span> ${date} </span>`);

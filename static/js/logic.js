// Create the tile layer that will be the background of our map.
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the layer group for the earthquakes.
let earthquakeslayer = new L.layerGroup();

// Create the map object with options.
let map = L.map("map", {
  center: [0,0],
  zoom: 2,
  layers: [streetmap, earthquakeslayer]
});

// Create a baseMaps object to hold the streetmap layer.
let baseMaps = {
  "Street Map": streetmap
};

// Create an overlayMaps object to hold the earthquakes layer.
let overlayMaps = {
  "Earthquakes": earthquakeslayer
};

// Create a layer control, and pass it overlayMaps. Add the layer control to the map.
L.control.layers(null, overlayMaps, {
  collapsed: false
}).addTo(map);

// Create a legend
let legend = L.control({
  position: "bottomright" 
});

legend.onAdd = function() {
  let div = L.DomUtil.create('div', 'legend');
  grades = [-10, 10, 30, 50, 70, 90];
  labels = [];
  div.innerHTML +=
  '<h3>Depth:</h3>'
  // Looping through our intervals and generating a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColour(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  return div;
}
legend.addTo(map);

// Function to create circle markers coloured by depth and sized by magnitude
function drawCircle(point, latlng) {
  let mag = point.properties.mag;
  let depth = point.geometry.coordinates[2];
  return L.circle(latlng, {
      color: getColour(depth),
      fillColor: getColour(depth),
      fillOpacity: 1,
      radius: mag * 50000
  });
}

// Function to add a pop up when a quake is clicked
function bindPopUp(feature, layer) {
  layer.bindPopup(feature.properties.place + "<br> Magnitude: " + feature.properties.mag + "<br> Depth: " + feature.geometry.coordinates[2]);
}

// Function to determine the color based on depth
function getColour(depth) {
  if (depth >= 90) {
    return "#A52A2A";
  } else if (depth >= 70) {
    return "#800080";
  } else if (depth >= 50) {
    return "#FF0000";
  } else if (depth >= 30) {
    return "#A52A2A";
  } else if (depth >= 10) {
    return "#FFA068";
  } else {
    return "#FFFF00";
  }
}

// Perform an API call to get the earthquake information.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (response) {

  // Pull the "features" property from response.
  const features = response.features;

  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(features, {
      pointToLayer: drawCircle,
      onEachFeature: bindPopUp
  }).addTo(earthquakeslayer);
});
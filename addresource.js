/* global L, carto */

var map = L.map('formmap', {
  center: [38.9072, -77.0369],
  zoom: 11.8
});

// Add base layer
L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);


/*
 * Add event listener to the map that updates the latitude and longitude on the form
 */

var latitudeField = document.querySelector('.latitude-field');
var longitudeField = document.querySelector('.longitude-field');

var markerLayer = L.featureGroup().addTo(map);

map.on('click', function (event) {
  // Clear the existing marker
  markerLayer.clearLayers();
  
  // Log out the latlng so we can see that it's correct
  console.log(event.latlng);
  
  // Add a marker to the map
  var marker = L.marker(event.latlng);
  markerLayer.addLayer(marker);
  
  // Update the form fields
  latitudeField.value = event.latlng.lat;
  longitudeField.value = event.latlng.lng;
});
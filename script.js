/* global L, carto */
/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

var map = L.map('map', {
  doubleClickZoom: false 
}).setView([38.9, -77], 11.5);

// Add base layer
L.tileLayer('https://api.mapbox.com/styles/v1/abbyzan/cjt6eub2f1ccn1fmb5c2z9qmp/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYWJieXphbiIsImEiOiJjamVteWRzdXgwZTFjMzNxeWtscTZ0OTQyIn0.P10A1XxKYhBZBX-I_XGuUw', {
  maxZoom: 18
}).addTo(map);

// Initialize Carto
var client = new carto.Client({
  apiKey: 'default_public',
  username: 'schwa464'
});

// Initialze source data
var syncdatasource = new carto.source.SQL('SELECT * FROM climateofchange_data2');

// Create style for the data
var syncdatastyle = new carto.style.CartoCSS(`
 #layer {
  marker-width: 7;
  marker-fill: ramp([type], (#7F3C8D, #11A579, #11A579, #F2B701, #E73F74, #A5AA99), ("Food ", "Health", "health", "Food", "Shelter"), "=");
  marker-fill-opacity: 1;
  marker-allow-overlap: true;
  marker-line-width: 0;
  marker-line-color: #FFFFFF;
  marker-line-opacity: 1;
}
`);

// Add style to the data
var syncdatalayer = new carto.layer.Layer(syncdatasource, syncdatastyle);




// Initialze source data
var formSource = new carto.source.Dataset('climate_of_change_resource_googleform');

// Create style for the data
var formStyle = new carto.style.CartoCSS(`
#layer {
  marker-width: 7;
  marker-fill: ramp([which_category_is_the_best_fit_for_this_resource], (#7F3C8D, #11A579, #3969AC, #F2B701, #E73F74, #80BA5A, #A5AA99), ("FOOD", "HEALTH", "ENERGY", "OTHER", "WORK", "SHELTER"), "=");
  marker-fill-opacity: 1;
  marker-allow-overlap: true;
  marker-line-width: 0;
  marker-line-color: #FFFFFF;
  marker-line-opacity: 1;
}
`);

// Add style to the data
var formLayer = new carto.layer.Layer(formSource, formStyle);


// Initialze source data
var povertySource = new carto.source.Dataset('dctracts_hunger');

// Create style for the data
var povertyStyle = new carto.style.CartoCSS(`
#layer{
  polygon-fill: ramp([poverty_ra], (#f2f0f7, #cbc9e2, #9e9ac8, #756bb1, #54278f), jenks);
  polygon-opacity: .8;
}
`);

// Add style to the data
var povertyLayer = new carto.layer.Layer(povertySource, povertyStyle);



// Initialze source data
var employmentSource = new carto.source.Dataset('dctracts_hunger');

// Create style for the data
var employmentStyle = new carto.style.CartoCSS(`
#layer {
  polygon-fill: ramp([unemployme], (#ecda9a, #f1b973, #f7945d, #f86f56, #ee4d5a), jenks);
  polygon-opacity: .8;
}
`);

// Add style to the data
var employmentLayer = new carto.layer.Layer(employmentSource, employmentStyle);




// Initialze source data
var homeSource = new carto.source.Dataset('dctracts_hunger');

// Create style for the data
var homeStyle = new carto.style.CartoCSS(`
#layer {
  polygon-fill: ramp([home_own], (#f7feae, #9bd8a4, #46aea0, #058092, #045275), jenks);
  polygon-opacity: .8;
}
`);

// Add style to the data
var homeLayer = new carto.layer.Layer(homeSource, homeStyle);


// Add the data to the map as two layers. Order matters here--first one goes on the bottom
client.addLayers([homeLayer, employmentLayer, povertyLayer, formLayer, syncdatalayer]);
client.getLeafletLayer().addTo(map);



/*
 * Listen for changes on the layer picker
 */

// Step 1: Find the dropdown by class. If you are using a different class, change this.
var layerPicker = document.querySelector('.layer-picker');

// Step 2: Add an event listener to the dropdown. We will run some code whenever the dropdown changes.
layerPicker.addEventListener('change', function (e) {
  // The value of the dropdown is in e.target.value when it changes
  var type = e.target.value;
  
  // Step 3: Decide on the SQL query to use and set it on the datasource
  if (type === 'all') {
    // If the value is "all" then we show all of the features, unfiltered
    // EB: changed "source" to "dumpingsource"
    syncdatasource.setQuery("SELECT * FROM climateofchange_data2");
  }
  else {
    // Else the value must be set to a life stage. Use it in an SQL query that will filter to that life stage.
    // EB: changed "source" to "dumpingsource" again
    syncdatasource.setQuery("SELECT * FROM climateofchange_data2 WHERE type  = '" +type+ "'");
  }
  
  // Sometimes it helps to log messages, here we log the lifestage. You can see this if you open developer tools and look at the console.
  console.log('Dropdown changed to "' + type + '"');
});

// Note: any column you want to show up in the popup needs to be in the list of
// featureClickColumns below
var layer = new carto.layer.Layer(syncdatasource, syncdatastyle, {
  featureClickColumns: ['resource_name', 'type', 'website_link']
});

layer.on('featureClicked', function (event) {
  // Create the HTML that will go in the popup. event.data has all the data for 
  // the clicked feature.
  //
  // I will add the content line-by-line here to make it a little easier to read.
  var content = '<div class = popuptitle>' + event.data['resource_name'] + '</div>';
  content += '<div>Type:' + event.data['type'] + '</div>';
   content += '<div>Link:' + event.data['website_link'] + '</div>';
  
  // If you're not sure what data is available, log it out:
  console.log(event.data);
  
  var popup = L.popup();
  popup.setContent(content);
  
  // Place the popup and open it
  popup.setLatLng(event.latLng);
  popup.openOn(map);
});



// Add the data to the map as a layer
client.addLayer(layer);
client.getLeafletLayer().addTo(map);
  


// Keep track of whether the boroughs layer is currently visible
var povertyVisible = true;

// When the boroughs button is clicked, show or hide the layer
var povertyButton = document.querySelector('.toggle-poverty');
povertyButton.addEventListener('click', function () {
  if (povertyVisible) {
    // Boroughs are visible, so remove that layer
    client.removeLayer(povertyLayer);
    
    // Then update the variable tracking whether the layer is shown
    povertyVisible = false;
  }
  
    else {
    // Do the reverse if boroughs are not visible
    client.addLayer(povertyLayer);
    
    // Hide the other layers so our employment layer is the only census layer
    client.removeLayer(employmentLayer);
    client.removeLayer(homeLayer);
    
    // Send the employment layer to the back so it shows up under any other layer
   povertyLayer.bringToBack();
   povertyVisible = true;
  }
  
});


// Keep track of whether the boroughs layer is currently visible
var employmentVisible = true;

// When the boroughs button is clicked, show or hide the layer
var employmentButton = document.querySelector('.toggle-employment');
employmentButton.addEventListener('click', function () {
  if (employmentVisible) {
    // Boroughs are visible, so remove that layer
    client.removeLayer(employmentLayer);
    
    // Then update the variable tracking whether the layer is shown
    employmentVisible = false;
  }
  // Keep track of whether the boroughs layer is currently visible
var employmentVisible = false;

// When the boroughs button is clicked, show or hide the layer
var employmentButton = document.querySelector('.toggle-employment');
employmentButton.addEventListener('click', function () {
  if (employmentVisible) {
    // Boroughs are visible, so remove that layer
    client.removeLayer(employmentLayer);
    
    // Then update the variable tracking whether the layer is shown
    employmentVisible = false;
  }
  
  else {
    // Do the reverse if boroughs are not visible
    client.addLayer(employmentLayer);
    
    // Hide the other layers so our employment layer is the only census layer
    client.removeLayer(povertyLayer);
    client.removeLayer(homeLayer);
    
    // Send the employment layer to the back so it shows up under any other layer
    employmentLayer.bringToBack();
   employmentVisible = true;
  }
   
});

// Keep track of whether the boroughs layer is currently visible
var homeVisible = true;

// When the boroughs button is clicked show or hide the layer
var homeButton = document.querySelector('.toggle-home');
homeButton.addEventListener('click', function () {
  if (homeVisible) {
    // Boroughs are visible, so remove that layer
    client.removeLayer(homeLayer);
    
    // Then update the variable tracking whether the layer is shown
    homeVisible = false;
  }
   else {
    // Do the reverse if boroughs are not visible
    client.addLayer(homeLayer);
    
    // Hide the other layers so our employment layer is the only census layer
    client.removeLayer(povertyLayer);
    client.removeLayer(employmentLayer);
    
    // Send the employment layer to the back so it shows up under any other layer
  homeLayer.bringToBack();
  homeVisible = true;
  } 
});
  
  
  
  
  // When the boroughs button is clicked show or hide the layer
var hideButton = document.querySelector('.toggle-hide');
hideButton.addEventListener('click', function () {
  if (homeVisible) {
    // Boroughs are visible, so remove that layer
    client.removeLayer(homeLayer);
    
    // Then update the variable tracking whether the layer is shown
    homeVisible = false;
  }
   else {
    // Do the reverse if boroughs are not visible
    client.addLayer(homeLayer);
    
    // Hide the other layers so our employment layer is the only census layer
    client.removeLayer(povertyLayer);
    client.removeLayer(employmentLayer);
    
    // Send the employment layer to the back so it shows up under any other layer
  homeLayer.bringToBack();
  homeVisible = true;
  } 
});
  
  
  });

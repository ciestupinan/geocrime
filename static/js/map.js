"use strict"

// GLOBAL VARIABLES
let MARKERS = [];
let MAP;
let INCIDENTS = {};

// Initialize map
function initMap() {
  const sfCoords = {lat: 37.7749, lng: -122.4194};  

  // Create map
  MAP = new google.maps.Map(document.getElementById('map'), {
    center: sfCoords,
    zoom: 12
  });

  // Get crime data from API
  $.ajax({

    url: "https://data.sfgov.org/resource/nwbb-fxkq.json",
    type: "GET",
    data: {
      "$limit" : 5000,
      "$$app_token" : "Y6mTFPFpnPQzYXxLv0LVidpom"
    }

  }).done(function(data) {

    const crimeData = extractRelevantData(data);

    for (let i = 0; i < crimeData.length; i++) {
      let incident = crimeData[i];

      let lat = incident['latitude']
      let lng = incident['longitude']

      // Don't use data that doesn't have lat,lng
      if (!isNaN(lat) && !isNaN(lng)){
        
        // Add incident lat,lng to Object with value of incident data
        // If incident lat,lng in Object, append incident data to value list
        if (`${lat}, ${lng}` in INCIDENTS){ 
          INCIDENTS[`${lat}, ${lng}`].push(incident);
        }
        else {
          INCIDENTS[`${lat}, ${lng}`] = [incident];
        }

      }

    }

    createMarkers(INCIDENTS);

  });

}


// Return relevant data at given marker (passed in through data)
function extractRelevantData(data){

  const relevantData = [];

  for (let i = 0; i < data.length; i++) {
    let col = data[i];

    relevantData.push({
      'incident_datetime': col['incident_datetime'],
      'incident_category': col['incident_category'],
      'incident_subcategory': col['incident_subcategory'],
      'incident_description': col['incident_description'],
      'resolution': col['resolution'],
      'latitude': parseFloat(col['latitude']),
      'longitude': parseFloat(col['longitude'])
    });

  }

  return relevantData;

}


// Creates list of marker objects
function createMarkers(incidentsAtSamePoint){

  let entries = Object.entries(incidentsAtSamePoint);
     
  for (let [location,incidents] of entries){
    let point = location.split(",");
    let lat = parseFloat(point[0]);
    let lng = parseFloat(point[1]);

    const marker = createMarkerObject(lat, lng);
    MARKERS.push(marker);
    marker.setMap(MAP);
    makeInfoWindow(lat, lng, incidents, marker);
  }

}


// Helper to createMarkers()
// Creates each marker object
function createMarkerObject(latitude, longitude) {
  
  const marker = new google.maps.Marker({
    position: {lat: latitude, lng: longitude},
    title: `${latitude}, ${longitude}`   
  }); 

  return marker;

}


// Make info window with all of the data at that lat, lng
function makeInfoWindow(latitude, longitude, data, marker){
  
  let contentString = `<div id="content">
    <div id="siteNotice"></div>
    <p id="firstHeading" class="firstHeading">
    <b>Crimes at (${latitude},${longitude})</b></p>
    <div id="bodyContent">`;
    
  for (let i = 0; i < data.length; i++){
    let incident = data[i];
    contentString = contentString + `<p>datetime: ${incident['incident_datetime']}</p>
      <p id="category">category: ${incident['incident_category']}</p>
      <p id="subcategory">subcategory: ${incident['incident_subcategory']}</p>
      <p>description: ${incident['incident_description']}</p>
      <p id="resolution">resolution: ${incident['resolution']}</p><hr>`;
  }

  contentString = contentString + '</div></div>';

  const infowindow = new google.maps.InfoWindow({
    content: contentString
  });
  marker.addListener('click', function() {
    infowindow.open(MAP, marker);
  });

}


// Each time form is changed, filter Markers to set on map
document.querySelector('form').addEventListener("submit", function(evt) {

  const filterCategory = document.getElementById("category").value;
  const filterSubcategory = document.getElementById("subcategory").value;
  const filterResolution = document.getElementById("resolution").value;

  const filters = [filterCategory, filterSubcategory, filterResolution];
  const noFilter = '---';

  // If no filters are set, we just return all the markers
  if ((filterCategory == noFilter) && (filterSubcategory == noFilter) && (filterResolution == noFilter)) {
      setMarkers(MARKERS);
      return;
  }

  // If filters are set, create a list of Markers to display that fit filter criteria
  const markersToDisplay = compareFilterToMarkerValue(filters, noFilter);

  // Tell user if there are no markers that meet their filter search criteria
  if (markersToDisplay.length == 0){
    alert("There are no markers to display for your search.")
  }

  setMarkers(markersToDisplay);

});

/*
// Helper to form submit change
// Given a list of filter values, select Markers that meet that criteria
function compareFilterToMarkerValue(filters, noFilter) {

  const [filterCategory, filterSubcategory, filterResolution] = filters;
  let markersToDisplay = [];

  for (let i = 0; i < MARKERS.length; i++) {
    let marker = MARKERS[i];
    let infowindow = marker['infowindow'];
    let markerCategory = infowindow['content'].getElementById('category');
    let markerSubcategory = infowindow['content'].getElementById('subcategory');
    let markerResolution = infowindow['content'].getElementById('resolution');

    // Check for when all filters are selected

    // Only category has filter
    if ( (filterCategory == markerCategory)
      && (filterSubcategory == noFilter)
      && (filterResolution == noFilter) ) {
        
        markersToDisplay.append(marker);
        continue;
    }

    // Only subcategory has filter 
    else if ( (filterCategory == noFilter)
      && (filterSubcategory == markerSubcategory)
      && (filterResolution == noFilter) ) {

        markersToDisplay.append(marker);
        continue;
    }

    // Only resolution has filter 
    else if ( (filterCategory == noFilter)
      && (filterSubcategory == noFilter) 
      && (filterResolution == markerResolution) ) {

        markersToDisplay.append(marker);
        continue;
    }

    // Category and subcategory have filter
    else if ( (filterCategory == markerCategory)
      && (filterSubcategory == markerSubcategory) 
      && (filterResolution == noFilter) ){

        markersToDisplay.append(marker);
        continue;
    }

    // Category and resolution have filter
    else if ( (filterCategory == markerCategory)
      && (filterSubcategory == noFilter) 
      && (filterResolution == markerResolution) ) {

        markersToDisplay.append(marker);
        continue;
    }

    // Subcategory and resolution have filter
    else if ( (filterCategory == noFilter) 
      && (filterSubcategory == markerSubcategory)
      && (filterResolution == markerResolution) ){

        markersToDisplay.append(marker);
        continue;
    }

    // Category, subcategory, and resolution have filter
    else if ((filterCategory == markerCategory) 
      && (filterSubcategory == markerSubcategory) 
      && (filterResolution == markerResolution)) {

        markersToDisplay.append(marker);
        continue;
    }

  }

  return markersToDisplay;
}

// Helper to form submit change
// Display list of Markers on map
function setMarkers(markersToDisplay){

  for (let i = 0; i < markersToDisplay.length; i++) {
    marker.setMap(MAP);
  }

}



*/




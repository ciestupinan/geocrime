"use strict"

// GLOBAL VARIABLES
let MARKERS = [];
const INCIDENTS = {};
let MAP;


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

    MARKERS = createMarkers(INCIDENTS);
    setMarkers(MARKERS);

  });

}


// Return relevant data at given marker (passed in through data)
// This should only be done once, to create INCIDENTS in initMap()
function extractRelevantData(crimeData){

  const relevantData = [];

  for (let i = 0; i < crimeData.length; i++) {
    let col = crimeData[i];

    relevantData.push({
      'datetime': col['incident_datetime'],
      'category': col['incident_category'],
      'subcategory': col['incident_subcategory'],
      'description': col['incident_description'],
      'resolution': col['resolution'],
      'latitude': parseFloat(col['latitude']),
      'longitude': parseFloat(col['longitude'])
    });

  }

  return relevantData;

}


// Creates list of marker objects
function createMarkers(listOfIncidents){

  const listOfMarkers = [];
  const entries = Object.entries(listOfIncidents);
     
  for (let [location,incidents] of entries){
    let point = location.split(',');
    let lat = parseFloat(point[0]);
    let lng = parseFloat(point[1]);

    const marker = createMarkerObject(lat, lng);
    listOfMarkers.push(marker);
    makeInfoWindow(lat, lng, incidents, marker);
  }

  return listOfMarkers;
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


// Make info window with all of the data for the marker at lat,lng
function makeInfoWindow(latitude, longitude, listOfIncidentsAtLocation, marker){
  
  let contentString = `<div id="content">
    <div id="siteNotice"></div>
    <p id="firstHeading" class="firstHeading">
    <b>Crimes at (${latitude},${longitude})</b></p>
    <div id="bodyContent">`;
    
  for (let i = 0; i < listOfIncidentsAtLocation.length; i++){
    let incident = listOfIncidentsAtLocation[i];
    contentString = contentString + `<p>datetime: ${incident['datetime']}</p>
      <p id="category">category: ${incident['category']}</p>
      <p id="subcategory">subcategory: ${incident['subcategory']}</p>
      <p>description: ${incident['description']}</p>
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
document.getElementById('form').addEventListener('submit', function(evt) {

  const filterCategory = document.getElementById('category').value;
  const filterSubcategory = document.getElementById('subcategory').value;
  const filterResolution = document.getElementById('resolution').value;

  const filters = [filterCategory, filterSubcategory, filterResolution];
  const noFilter = '---';

  // If no filters are set, return all the markers
  if ((filterCategory == noFilter) && (filterSubcategory == noFilter) && (filterResolution == noFilter)) {
      setMarkers(MARKERS);
      return;
  }

  // Otherwise filters are set, create a list of Markers to display that fit filter criteria
  const listOfIncidents = compareFilterToMarkerValue(filters, noFilter);
  const markersToDisplay = createMarkers(listOfIncidents);

  // Tell user if there are no markers that meet their filter search criteria, return nothing
  if (markersToDisplay.length == 0) {
    alert('There are no markers to display for your search.');
    return;
  }

  // Display markers on map
  setMarkers(markersToDisplay);

});


// Helper to form submit change
// Given a list of filter values, select Markers that meet that criteria
function compareFilterToMarkerValue(filters, noFilter) {

  const [filterCategory, filterSubcategory, filterResolution] = filters;
  
  // List of incidents that meet filter criteria
  const incidentsToDisplay = [];

  const entries = Object.entries(INCIDENTS);

  // go through INCIDENTS to see if any meet filter criteria. If yes, add to incidentsToDisplay
  for (let [location,listOfIncidentsAtLocation] of entries){

    let point = location.split(',');
    let lat = parseFloat(point[0]);
    let lng = parseFloat(point[1]);

    for (let i = 0; i < listOfIncidentsAtLocation.length; i++) {
      
      let incident = listOfIncidentsAtLocation[i];

      let incidentDatetime = incident['datetime'];
      let incidentCategory = incident['category'];
      let incidentSubcategory = incident['subcategory'];
      let incidentResolution = incident['resolution'];

      // Only category has filter
      if ( (filterCategory == incidentCategory)
        && (filterSubcategory == noFilter)
        && (filterResolution == noFilter) ) {
          
          incidentsToDisplay.append(incident);
          continue;
      }

      // Only subcategory has filter 
      else if ( (filterCategory == noFilter)
        && (filterSubcategory == incidentSubcategory)
        && (filterResolution == noFilter) ) {

          incidentsToDisplay.append(incident);
          continue;
      }

      // Only resolution has filter 
      else if ( (filterCategory == noFilter)
        && (filterSubcategory == noFilter) 
        && (filterResolution == incidentResolution) ) {

          incidentsToDisplay.append(incident);
          continue;
      }

      // Category and subcategory have filter
      else if ( (filterCategory == incidentCategory)
        && (filterSubcategory == incidentSubcategory) 
        && (filterResolution == noFilter) ){

          incidentsToDisplay.append(incident);
          continue;
      }

      // Category and resolution have filter
      else if ( (filterCategory == incidentCategory)
        && (filterSubcategory == noFilter) 
        && (filterResolution == incidentResolution) ) {

          incidentsToDisplay.append(incident);
          continue;
      }

      // Subcategory and resolution have filter
      else if ( (filterCategory == noFilter) 
        && (filterSubcategory == incidentSubcategory)
        && (filterResolution == incidentResolution) ){

          incidentsToDisplay.append(incident);
          continue;
      }

      // Category, subcategory, and resolution have filter
      else if ((filterCategory == incidentCategory) 
        && (filterSubcategory == incidentSubcategory) 
        && (filterResolution == incidentResolution)) {

          incidentsToDisplay.append(incident);
          continue;
      }

    }

  }

  return incidentsToDisplay;
}


// Helper to form submit change
// Display list of Markers on map
function setMarkers(markersToDisplay){

  for (let i = 0; i < markersToDisplay.length; i++) {
    let marker = markersToDisplay[i];
    marker.setMap(MAP);
  }

}




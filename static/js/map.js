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
    setMarkers(MAP);

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
    title: `${latitude}, ${longitude}`,
    map: MAP
  }); 
  //console.log(marker);

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
    contentString = contentString + `<p>datetime: ${incident['datetime']}
      <br>category: ${incident['category']}
      <br>subcategory: ${incident['subcategory']}
      <br>description: ${incident['description']}
      <br>resolution: ${incident['resolution']}</p><hr>`;
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
  evt.preventDefault();
  
  // clear the markers currently on the map
  deleteMarkers();

  const elements = document.getElementById('form').elements;
  //console.log(elements);
  // console.log(typeof(elements));
  const noFilterSet = '---';

  // contains form_ids of form elements with filter submission
  const filterSet = {};
  for (let i=0;i<elements.length-1;i++){
    if (elements[i].value != noFilterSet) {
      filterSet[elements[i].id] = elements[i].value;
    }
  }

  // console.log(filterSet);

  // If no filters are set, return all the markers
  if (Object.keys(filterSet).length === 0) {
      setMarkers(MAP);
      return;
  }
  
  else {


    // Otherwise filters are set, create a list of Markers to display that fit filter criteria
    const listOfIncidents = compareFilterToDataValue(filterSet);
    const markersToDisplay = createMarkers(listOfIncidents);
    //MARKERS = createMarkers(listOfIncidents);
    // Tell user if there are no markers that meet their filter search criteria, return nothing
    if (markersToDisplay.length === 0) {
    // if (MARKERS.length == 0){
      alert('There are no markers to display for your search.');
      return;
    }

    // Display markers on map
    setMarkers(MAP);
  }
});


// Helper to form submit change
// Given a list of filter values, select Markers that meet that criteria
function compareFilterToDataValue(elementsWithFilters) {

  //{'id': 'value', 'id': value}

  // List of incidents that meet filter criteria
  const incidentsToDisplay = [];


  // go through INCIDENTS to see if any meet filter criteria. If yes, add to incidentsToDisplay
  for (let [location,listOfIncidentsAtLocation] of (Object.entries(INCIDENTS)) ){

    for (let i = 0; i < listOfIncidentsAtLocation.length; i++) {
      let flag = true;
      let incident = listOfIncidentsAtLocation[i];

      for (let form_id in elementsWithFilters) {
        if (incident[form_id] != elementsWithFilters[form_id]) {
          flag = false;
          break;
        }
      }
     
     if (flag == true) {
      incidentsToDisplay.push(incident);
     }

    }

  }

  return incidentsToDisplay;
}


// Helper to form submit change
// Display list of Markers on map
// Sets the map on all markers in the array.
function setMarkers(map) {
  for (var i = 0; i < MARKERS.length; i++) {
    MARKERS[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMarkers(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  MARKERS = [];
}

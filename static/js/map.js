"use strict"


function startApp() {
  const map = initMap();
  var myIncidentData = 0;
  /* incidentData is called this because it assumes once AJAX request is finished, 
  *     it will start the function that takes in the data it receieved from the AJAX request
  */
  getIncidentData(function(incidentData) {
    const markerList = setInitialMarkers(map, incidentData);

    setUpFormSubmitHandler(map, incidentData, markerList);
    /* can't return incidentData but it won't have the incidentData expected right away because 
     * we're still waiting for AJAX request to finish
     * */
    
  });
}

// Initialize map
function initMap() {
  const sfCoords = {lat: 37.7749, lng: -122.4194};  

  // Create map
  return new google.maps.Map(document.getElementById('map'), {
    center: sfCoords,
    zoom: 12
  });
}


function getIncidentData(callback) {
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
    // const listOfIncidents = [];
    const incidentData = {};

    for (let i = 0; i < crimeData.length; i++) {
      let incident = crimeData[i];

      let lat = incident['latitude']
      let lng = incident['longitude']

      // Don't use data that doesn't have lat,lng
      if (!isNaN(lat) && !isNaN(lng)){
        
        // Add incident lat,lng to Object with value of incident data
        // If incident lat,lng in Object, append incident data to value list
        if (`${lat}, ${lng}` in incidentData) {
          incidentData[`${lat}, ${lng}`].push(incident);
        } else {
          incidentData[`${lat}, ${lng}`] = [incident];
        }

      }

    }

    callback(incidentData);
  });
}


// Return relevant data at given marker (passed in through data)
// This should only be done once, to create INCIDENTS in initMap()
function extractRelevantData(crimeData){

  const relevantData = [];

  for (let i = 0; i < crimeData.length; i++) {
    let col = crimeData[i];
    const datetimeStr = col['incident_datetime']
    const date = datetimeStr.slice(0,10);
    const time = datetimeStr.slice(11);

    relevantData.push({
      'date': date,
      'time': time,
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


function setInitialMarkers(map, incidentData) {
  const markerList = [];
  createMarkerList(map, incidentData, markerList);
  putMarkersOnMap(markerList, map);
  return markerList;
}


// Creates list of marker objects
function createMarkerList(map, incidentData, markerList) {

  const entries = Object.entries(incidentData);
     
  for (let [location,listOfIncidentsAtLocation] of entries) {
    let point = location.split(',');
    let latitude = parseFloat(point[0]);
    let longitude = parseFloat(point[1]);

    const marker = createMarkerObject(map, latitude, longitude);
    markerList.push(marker);
    makeMarkerInfoWindow(latitude, longitude, listOfIncidentsAtLocation, marker, map);
  }

  return markerList;
}


// Helper to createMarkers()
// Creates each marker object
function createMarkerObject(map, latitude, longitude) {
  
  const marker = new google.maps.Marker({
    position: {lat: latitude, lng: longitude},
    title: `${latitude}, ${longitude}`,
    map: map
  }); 

  return marker;
}


// Make info window with all of the data for the marker at lat,lng
function makeMarkerInfoWindow(latitude, longitude, listOfIncidentsAtLocation, marker, map){
  
  let contentString = `<div id="content">
    <div id="siteNotice"></div>
    <p id="firstHeading" class="firstHeading">
    <b>Crimes at (${latitude},${longitude})</b></p>
    <div id="bodyContent">`;
  
  for (let i = 0; i < listOfIncidentsAtLocation.length; i++) {
    let incident = listOfIncidentsAtLocation[i];

    contentString = contentString + `<p>date: ${incident['date']}
      <br>time: ${incident['time']}
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
    infowindow.open(map, marker);
  });

}


function setUpFormSubmitHandler(map, incidentData, markerList) {

  const filterForm = document.querySelector('#filterForm');

  filterForm.addEventListener('submit',function(evt){
    
    evt.preventDefault();
    deleteAllMarkers(markerList);

    const category = document.getElementById('category').value;
    const subcategory = document.getElementById('subcategory').value;
    const resolution = document.getElementById('resolution').value;


    const formFilters = {'category':category, 'subcategory':subcategory, 'resolution':resolution};

    const filteredIncidentData = filterIncidentData(map, incidentData, markerList, formFilters);
    if (Object.keys(filteredIncidentData).length === 0){
      alert("There aren't any incidents that meet that criteria!");
    }
    createMarkerList(map, filteredIncidentData, markerList);
    putMarkersOnMap(markerList, map);
    
  });

}



function filterIncidentData(map, incidentData, markerList, formFilters) {
  const noFilterSelected = "---";

  // No filters are selected, create all markers
  if (formFilters['category'] === noFilterSelected
      && formFilters['subcategory'] === noFilterSelected 
      && formFilters['resolution'] === noFilterSelected) {

      return createMarkerList(map, incidentData, markerList);

  } else {

    const filteredIncidentData = {};

    for (const [location, listOfIncidentsAtLocation] of Object.entries(incidentData)) {

      for (const incident of listOfIncidentsAtLocation) {

        // Only resolution filter is selected
        if (formFilters['category'] === noFilterSelected
          && formFilters['subcategory'] === noFilterSelected
          && incident['resolution'] === formFilters['resolution']) {

          addToFilteredDataSet(incident, filteredIncidentData);

        } // Only subcategory filter is selected
        else if (formFilters['category'] === noFilterSelected
          && incident['subcategory'] === formFilters['subcategory']
          && formFilters['resolution'] === noFilterSelected) {

          addToFilteredDataSet(incident, filteredIncidentData);

        } // Only category filter is selected
        else if (incident['category'] === formFilters['category']
          && formFilters['subcategory'] === noFilterSelected
          && formFilters['resolution'] === noFilterSelected) {

          addToFilteredDataSet(incident, filteredIncidentData);

        } // Subcategory and Resolution filters are selected
        else if (formFilters['category'] === noFilterSelected
          && incident['subcategory'] === formFilters['subcategory']
          && incident['resolution'] === formFilters['resolution']) {

          addToFilteredDataSet(incident, filteredIncidentData);

        } // Category and Resolution filters are selected 
        else if (incident['category'] === formFilters['category']
          && formFilters['subcategory'] === noFilterSelected
          && incident['resolution'] === formFilters['resolution']) {
          
          addToFilteredDataSet(incident, filteredIncidentData);

        } // Category and Subcateory filters are selected 
        else if (incident['category'] === formFilters['category']
          && incident['subcategory'] === formFilters['subcategory']
          && formFilters['resolution'] === noFilterSelected) {

          addToFilteredDataSet(incident, filteredIncidentData);
        }

      }

    }
    
    return filteredIncidentData;
  }
}


function addToFilteredDataSet(incident, filteredIncidentData){

  let lat = incident['latitude'];
  let lng = incident['longitude'];

  if (`${lat}, ${lng}` in filteredIncidentData) {
    filteredIncidentData[`${lat}, ${lng}`].push(incident);
  } else {
    filteredIncidentData[`${lat}, ${lng}`] = [incident];
  }

}



// Sets the map on all markers in the array.
function putMarkersOnMap(markerList, map) {
  for (var i = 0; i < markerList.length; i++) {
    markerList[i].setMap(map);
  }
}


// Deletes all markers in the array by removing references to them.
function deleteAllMarkers(markerList) {

  // Set original markerList map to null. This is the only way to remove markers from Map
  putMarkersOnMap(markerList, null);
  
  while (markerList.length > 0){
    markerList.pop();
  }
  
  return markerList;

}





"use strict"


function startApp() {
  const map = initMap();
  var myIncidentData = 0;
  /* incidentData is called this because it assumes once AJAX request is finished, 
  *     it will start the function that takes in the data it receieved from the AJAX request
  */
  getIncidentData(function(incidentData) {
    console.log(incidentData);
    const markerList = setInitialMarkers(map, incidentData);
    setUpFormSubmitHandler(map, incidentData, markerList);
    /* can't return incidentData but it won't have the incidentData expected right away because 
     * we're still waiting for AJAX request to finish
     * */
    
  });
}


function initMap() {
  const sfCoords = {lat: 37.7749, lng: -122.4194};  

  // Create map
  return new google.maps.Map(document.getElementById('map'), {
    center: sfCoords,
    zoom: 12
  });
}


// Initialize map
// function applyFunctionToIncidentData(callback) {
function getIncidentData(callback) {
  // Get crime data from API
  $.ajax({

    url: "https://data.sfgov.org/resource/nwbb-fxkq.json",
    type: "GET",
    data: {
      "$limit" : 5000,
      // If this is an API key we don't want this in a repo ...
      "$$app_token" : "Y6mTFPFpnPQzYXxLv0LVidpom"
    }

  }).done(function(data) {
    const crimeData = extractRelevantData(data);
    const listOfIncidents = [];

    for (let i = 0; i < crimeData.length; i++) {
      let incident = crimeData[i];

      let lat = incident['latitude']
      let lng = incident['longitude']

      // Don't use data that doesn't have lat,lng
      if (!isNaN(lat) && !isNaN(lng)){
        
        // Add incident lat,lng to Object with value of incident data
        // If incident lat,lng in Object, append incident data to value list
        if (`${lat}, ${lng}` in listOfIncidents) {
          listOfIncidents[`${lat}, ${lng}`].push(incident);
        }
        else {
          listOfIncidents[`${lat}, ${lng}`] = [incident];
        }

      }

    }
    // this is returning 
    callback(listOfIncidents);
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

function setInitialMarkers(map, incidentData) {
  const markerList = [];
  createMarkerList(map, incidentData, markerList);
  putMarkersOnMap(markerList, map);
  return markerList;
}


// Creates list of marker objects
function createMarkerList(map, incidentData, markerList){

  const entries = Object.entries(incidentData);
     
  for (let [location,listOfIncidentsAtLocation] of entries) {
    let point = location.split(',');
    let latitude = parseFloat(point[0]);
    let longitude = parseFloat(point[1]);

    const marker = createMarkerObject(map, latitude, longitude);
    markerList.push(marker);
    makeMarkerInfoWindow(latitude, longitude, listOfIncidentsAtLocation, marker);
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
function makeMarkerInfoWindow(latitude, longitude, listOfIncidentsAtLocation, marker){
  
  let contentString = `<div id="content">
    <div id="siteNotice"></div>
    <p id="firstHeading" class="firstHeading">
    <b>Crimes at (${latitude},${longitude})</b></p>
    <div id="bodyContent">`;
  
  for (let i = 0; i < listOfIncidentsAtLocation.length; i++) {
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


function setUpFormSubmitHandler(map, incidentData, markerList) {
  deleteAllMarkers(map,incidentData,markerList);

  // const filterForm = document.querySelector('#filterForm');
  // filterForm.addEventListener('submit',function(evt){
  //   evt.preventDefault();
  //   filterMarkers(map, incidentData, markerList, );
  // });
  console.log(incidentData);
  $( "filterForm" ).submit(function( evt ) {
    formValues =  $( this ).serializeArray();
    console.log(formValues);
    evt.preventDefault();
  });



}
  // Each time form is changed, filter Markers to set on map
//   document.getElementById('form').addEventListener('submit', function(evt) {
//     evt.preventDefault();

//     const elements = document.getElementById('form').elements;
//     //console.log(elements);
//     // console.log(typeof(elements));
//     const noFilterSet = '---';

//     // contains form_ids of form elements with filter submission
//     const filterSet = {};
//     for (let i=0;i<elements.length-1;i++){
//       if (elements[i].value != noFilterSet) {
//         filterSet[elements[i].id] = elements[i].value;
//       }
//     }

//     // console.log(filterSet);

//     // If no filters are set, return all the markers
//     if (Object.keys(filterSet).length === 0) {
//         // refill markerlist with the full set of incidents
//         putMarkersOnMap(markerList, map);
//         return;
//     } else {


//       // Otherwise filters are set, create a list of Markers to display that fit filter criteria
//       const listOfIncidents = compareFilterToDataValue(filterSet);
//       const markersToDisplay = createMarkers(listOfIncidents);
//       //MARKERS = createMarkers(listOfIncidents);
//       // Tell user if there are no markers that meet their filter search criteria, return nothing
//       if (markersToDisplay.length === 0) {
//       // if (MARKERS.length == 0){
//         alert('There are no markers to display for your search.');
//         return;
//       }

//       // Display markers on map
//       setMarkers(MAP);
//     }
//   });
// }



// Helper to form submit change
// Given a list of filter values, select Markers that meet that criteria
function compareFilterToDataValue(elementsWithFilters) {

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



// Sets the map on all markers in the array.
function putMarkersOnMap(markerList, map) {
  for (var i = 0; i < markerList.length; i++) {
    markerList[i].setMap(map);
  }
}


// Deletes all markers in the array by removing references to them.
function deleteAllMarkers(markerList) {
  putMarkersOnMap(markerList, null);
  
  while (markerList.length > 0){
    markerList.pop();
  }

}





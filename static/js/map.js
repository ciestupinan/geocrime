"use strict"

// Initialize map
function initMap() {
  const sfCoords = {lat: 37.7749, lng: -122.4194};
  
  // array of Marker objects
  let incidentsAtSamePoint = {};
  let markers = [];

  // Create map
  const map = new google.maps.Map(document.getElementById('map'), {
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
        if (`${lat}, ${lng}` in incidentsAtSamePoint){ 
          incidentsAtSamePoint[`${lat}, ${lng}`].push(incident);
        }
        else {
          incidentsAtSamePoint[`${lat}, ${lng}`] = [incident];
        }
      }
    }

    createMarker(incidentsAtSamePoint, markers, map);
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


function addMarker(latitude, longitude) {
  
  const marker = new google.maps.Marker({
    position: {lat: latitude, lng: longitude},
    title: `${latitude}, ${longitude}`   
  }); 

  return marker;
}



// Create markers
function createMarker(incidentsAtSamePoint, markers, map){

  let entries = Object.entries(incidentsAtSamePoint);
     
  for (let [location,incidents] of entries){
    let point = location.split(",");
    let lat = parseFloat(point[0]);
    let lng = parseFloat(point[1]);

    const marker = addMarker(lat, lng);
    marker.setMap(map);
    markers.push(marker);
    
    makeInfoWindow(lat, lng, incidents, marker);
  }

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
    contentString = contentString + `<p>datetime: ${incident['incident_datetime']}
      <br>category: ${incident['incident_category']}
      <br>subcategory: ${incident['incident_subcategory']}
      <br>description: ${incident['incident_description']}
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













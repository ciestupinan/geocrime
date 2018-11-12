// ***************************************************
// ***************** THIS CODE WORKS *****************
// ***************************************************

"use strict"

// Initialize map
function initMap() {
  const sfCoords = {lat: 37.7749, lng: -122.4194};
  
  // array of Marker objects
  const markers = [];

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
    const crimeData = data;

    for (let i = 0; i < crimeData.length; i++) {
      const markerData = getMarkerData(crimeData[i])
      
      const lat = markerData['latitude']
      const lng = markerData['longitude']

      const marker = addMarker(lat, lng, map);
      addInfoWindow(marker, markerData, map);
      markers.push(marker);

    }
  });
}

// Return relevant data at given marker (passed in through data)
function getMarkerData(data){
  const markerData = {};

  markerData['incident_datetime'] = data['incident_datetime'];
  markerData['incident_category'] = data['incident_category'];
  markerData['incident_subcategory'] = data['incident_subcategory'];
  markerData['incident_description'] = data['incident_description'];
  markerData['resolution'] = data['resolution'];
  markerData['latitude'] = parseFloat(data['latitude']);
  markerData['longitude'] = parseFloat(data['longitude']);
  
  return markerData;
}


// Create marker at lat long
function addMarker(latitude, longitude, map) {
  
  const marker = new google.maps.Marker({
    position: {lat: latitude, lng: longitude},
    map: map,
    title: `${latitude}, ${longitude}`   
  }); 

  return marker;
}


// Create tooltip for marker
function addInfoWindow(marker, data, map){
  const contentString = `<div id="content">
    <div id="siteNotice"></div>
    <p id="firstHeading" class="firstHeading"><b> ${data['incident_datetime']} </b></p>
    <div id="bodyContent">
    <p> category: ${data['incident_category']}
    <br> subcategory: ${data['incident_subcategory']}
    <br> description: ${data['incident_description']}
    <br> resolution: ${data['resolution']} </p>
    </div>
    </div>`;
  
  // Add content to tooltip
  const infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  // On click, show tooltip
  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
}
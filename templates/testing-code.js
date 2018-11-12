function initMap() {
  const sfCoords = {lat: 37.7749, lng: -122.4194};
  const markers = [];

  // Create map
  const map = new google.maps.Map(document.getElementById('map'), {
    center: sfCoords,
    zoom: 12
  });

  // Get crime data
  $.ajax({
    url: "https://data.sfgov.org/resource/nwbb-fxkq.json",
    type: "GET",
    data: {
      "$limit" : 5000,
      "$$app_token" : "Y6mTFPFpnPQzYXxLv0LVidpom"
    }
  }).done(function(data) {
    let crimeData = data;
    for (let i = 0; i < crimeData.length; i++) {
      markerData = getMarkerData(crimeData[i])
      lat = markerData['latitude']
      lng = markerData['longitude']

      markers.push(addMarker(lat, lng, map));
    }

  });
}

function getMarkerData(data){
  markerData = {};

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
function addInfoWindow(marker, map){
  
  
  // Add content to tooltip
  let infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  // On click, show tooltip
  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
}
  

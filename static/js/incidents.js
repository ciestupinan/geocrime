"use strict"


function startApp() {
  const map = initMap();
  /* incidentData is called this because it assumes once AJAX request is finished, 
  *     it will start the function that takes in the data it receieved from the AJAX request
  */
  getIncidentData(function(incidentData) {

    const oms = new OverlappingMarkerSpiderfier(map, {
      markersWontMove: true,
      markersWontHide: true,
      basicFormatEvents: true,
      legWeight: 2,
      keepSpiderfied: true
    });

    let markersInSpider = google.maps.event.addListenerOnce(map, 'idle', function(){
      return oms.markersNearAnyOtherMarker();
    });

    oms.addListener('format', function(marker, markersInSpider, status) {
      let iconURL;

      if (!markersInSpider.includes(marker)) {
        iconURL = getIcon(marker['incident']);
      } else if (status === OverlappingMarkerSpiderfier.markerStatus.SPIDERFIED) {
        iconURL = getIcon(marker['incident']);
      } else {
        iconURL = 'static/js/marker-plus.svg';
      }

      marker.setIcon({
        url: iconURL,
        scaledSize: new google.maps.Size(18, 18)  // makes SVG icons work in IE
      });
    });

    const markerList = setInitialMarkers(map, incidentData, oms);
    const markerCluster = createMarkerCluster(map, markerList);

    setUpFormSubmitHandler(map, incidentData, markerList, markerCluster, oms);

  });
}






// Initialize map
function initMap() {
  const sfCoords = {lat: 37.7749, lng: -122.4194};  

  // Create map
  var map =  new google.maps.Map(document.getElementById('map'), {
    center: sfCoords,
    zoom: 12
  });

  return map
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
    const incidentData = extractRelevantData(data);
    callback(incidentData);
  });
}



// Return relevant data at given marker (passed in through data)
// This should only be done once, to create INCIDENTS in initMap()
function extractRelevantData(crimeData){

  const relevantData = [];

  for (let i = 0; i < crimeData.length; i++) {
    let col = crimeData[i];

    const lat = parseFloat(col['latitude']);
    const lng = parseFloat(col['longitude']);

    if (lat != NaN && lng !=NaN) {
      
      const datetimeStr = col['incident_datetime'];
      const date = datetimeStr.slice(0,10);
      const time = formatTime(datetimeStr);

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

  }

  return relevantData;
}



function formatTime(datetimeStr){
  const datetime = new Date(datetimeStr);
  const hourDigit = datetime.getHours() % 12;
  const hours = (hourDigit === 0) ? 12 : hourDigit;
  const minutes = addZero(datetime.getMinutes());
  const ampm = (datetime.getHours() >= 12) ? 'PM' : 'AM';
  
  return `${hours}:${minutes} ${ampm}`
}



function addZero(time) {
    if (time < 10) {
        time = "0" + time;
    }
    return time;
}



function setInitialMarkers(map, incidentData, oms) {
  const markerList = [];
  createMarkerList(map, incidentData, markerList, oms);
  putMarkersOnMap(markerList, map);
  return markerList;
}



// Creates list of marker objects
function createMarkerList(map, incidentData, markerList, oms) {
     
  for (let i = 0; i < incidentData.length; i++) {
    let incident = incidentData[i];

    let marker = createMarkerObject(map, incident, oms);
    markerList.push(marker);
    makeMarkerInfoWindow(incident, marker, map);
  }


  return markerList;
}


// Creates each marker object
function createMarkerObject(map, incident, oms) {
  
  const latitude = incident['latitude'];
  const longitude = incident['longitude'];

  const marker = new google.maps.Marker({
    position: {lat: latitude, lng: longitude},
    title: `${latitude}, ${longitude}`,
    incident: incident
  }); 

  const infowindow = new google.maps.InfoWindow();

  google.maps.event.addListener(marker, 'spider_click', function(e) {
    infowindow.setContent(makeMarkerInfoWindow(incident, marker, map));
    infowindow.open(map, marker);
  });

  // google.maps.event.addListener(marker, 'spider_format', function(marker, status) {
  //   console.log(status);
  //   infowindow.setContent(makeMarkerInfoWindow(incident, marker, map));
  //   infowindow.open(map, marker);

  //   if (status === OverlappingMarkerSpiderfier.markerStatus.SPIDERFIED ||
  //     status === OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIABLE) {

  //     marker.setIcon(getIcon(marker['incident'])); 

  //   } else {

  //     marker.setIcon('static/js/marker-plus.svg');
  //   }


  // });

  oms.addMarker(marker);

  return marker;
}

function getIcon(incident){

  let category = incident['category'];

  const icons = {
    'Arson': 'static/images/aqua.png',
    'Assault': 'static/images/aqua_black_outline.png',
    'Burglary': 'static/images/aqua_outline.png',
    'Case Closure': 'static/images/black.png',
    'Civil Sidewalks': 'static/images/black_outline.png',
    'Courtesy Report': 'static/images/blue.png',
    'Disorderly Conduct': 'static/images/blue_outline.png',
    'Drug Offense': 'static/images/brown.png',
    'Drug Violation': 'static/images/brown.png',
    'Embezzlement': 'static/images/brown_outline.png',
    'Fire Report': 'static/images/darkgreen.png',
    'Forgery And Counterfeiting': 'static/images/darkgreen_outline.png',
    'Fraud': 'static/images/fuscia.png',
    'Larceny Theft': 'static/images/fuscia_black_outline.png',
    'Lost Property': 'static/images/fuscia_outline.png',
    'Malicious Mischief': 'static/images/green.png',
    'Miscellaneous Investigation': 'static/images/green_black_outline.png',
    'Missing Person': 'static/images/green_outline.png',
    'Motor Vehicle Theft': 'static/images/grey.png',
    'Non-Criminal': 'static/images/grey_outline.png',
    'Offences Against The Family And Children': 'static/images/lightblue.png',
    'Other': 'static/images/lightblue_outline.png',
    'Other Miscellaneous': 'static/images/lightgreen.png',
    'Other Offenses': 'static/images/lightgreen_outline.png',
    'Rape': 'static/images/orange.png',
    'Recovered Vehicle': 'static/images/orange_outline.png',
    'Robbery': 'static/images/pink.png',
    'Sex Offense': 'static/images/pink_black_outline.png',
    'Stolen Property': 'static/images/pink_outline.png',
    'Suspicious Occ': 'static/images/purple.png',
    'Traffic Collision': 'static/images/purple_outline.png',
    'Traffic Violation Arrest': 'static/images/red.png',
    'Vandalism': 'static/images/red_outline.png',
    'Warrant': 'static/images/yellow.png',
    'Weapons Carrying Etc': 'static/images/yellow_black_outline.png',
    'Weapons Offense': 'static/images/yellow_outline.png'
  };

  return icons[category]
}

function makeMarkerInfoWindow(incident, marker, map){
  const contentString = `<div id="content">
      <div id="siteNotice"></div>
      <p id="firstHeading" class="firstHeading">
      <b>Crimes at (${incident['latitude']},${incident['longitude']})</b></p>
      <div id="bodyContent">
      <p>date: ${incident['date']}
      <br>time: ${incident['time']}
      <br>category: ${incident['category']}
      <br>subcategory: ${incident['subcategory']}
      <br>description: ${incident['description']}
      <br>resolution: ${incident['resolution']}</p><hr>
      </div></div>`;

  return contentString
}


function setUpFormSubmitHandler(map, incidentData, markerList, markerCluster, oms) {
// function setUpFormSubmitHandler(map, incidentData, markerList, oms) {
  const filterForm = document.querySelector('#filterForm');




  filterForm.addEventListener('submit',function(evt){
    
    evt.preventDefault();
    deleteAllMarkers(markerList);
    removeMarkerClusters(markerCluster);
    // resetMap(map);


    const category = document.getElementById('category').value;
    const subcategory = document.getElementById('subcategory').value;
    const resolution = document.getElementById('resolution').value;
    const time = document.getElementById('time').value;
    const date = document.getElementById('date').value;

    const formFilters = {'category':category,
        'subcategory':subcategory,
        'resolution':resolution,
        'time':time,
        'date':(date === "") ? '---' : date
      };

    const filteredIncidentData = filterIncidentData(incidentData, formFilters);
    
    if (filteredIncidentData.length === 0){
      alert("There aren't any incidents that meet that criteria!");

    } else {
      createMarkerList(map, filteredIncidentData, markerList, oms);
      markerCluster = createMarkerCluster(map, markerList);
      putMarkersOnMap(markerList, map);
    }
  });
}


function removeMarkerClusters(markerCluster){
  markerCluster.clearMarkers();
}


function resetMap(map){
  const sfCoords = {lat: 37.7749, lng: -122.4194};  
  map.setZoom(12);
  map.setCenter(sfCoords);
}


function filterIncidentData(incidentData, formFilters) {
  const noFilterSelected = "---";
  let filteredIncidentData = [];
  let incidentDataToFilterThrough = incidentData; 


  for (let [filter, filterValue] of Object.entries(formFilters)) {
    
    if (filterValue != "---") {
      
      for (let i = 0; i < incidentDataToFilterThrough.length; i++) {

        let incident = incidentDataToFilterThrough[i];
        if (filterValue === incident[filter]){

          filteredIncidentData.push(incident);
        } 
        // If time filter is picked, filter by time
        else if ( (filterValue === "AM" || filterValue === "PM") && filterValue === incident[filter].slice(-2)){

          filteredIncidentData.push(incident);
        }
        
      }

      incidentDataToFilterThrough = filteredIncidentData;
      filteredIncidentData = [];
    }
    
  }

  return incidentDataToFilterThrough;
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
  
  while (markerList.length > 0) {
    markerList.pop();
  }
}



function createMarkerCluster(map, markerList){
  
  const markerCluster = new MarkerClusterer(map,
        markerList, 
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        });

  const minClusterZoom = 15;

  markerCluster.setMaxZoom(minClusterZoom);
  
  google.maps.event.addListener(markerCluster, 'clusterclick', function(cluster) {
    
    map.fitBounds(cluster.getBounds()); // Fit the bounds of the cluster clicked on
    if( map.getZoom() > minClusterZoom+1 ) // If zoomed in past 15 (first level without clustering), zoom out to 15
      map.setZoom(minClusterZoom+1);
  });

  return markerCluster;
}

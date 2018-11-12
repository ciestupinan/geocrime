// Create map
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          // Focus on San Francisco
          center: new google.maps.LatLng(37.7749,-122.4194)
        });

        // Load GeoJson
        // map.data.loadGeoJson('https://data.sfgov.org/resource/nwbb-fxkq.geojson');

        $.ajax({
          url: "https://data.sfgov.org/resource/nwbb-fxkq.json",
          type: "GET",
          data: {
            "$limit" : 5000,
            "$$app_token" : "Y6mTFPFpnPQzYXxLv0LVidpom"
          }
        }).done(function(data) {
          
          for (var i = 0; i < data.length; i++) {
            incident_datetime = data[i]['incident_datetime'];
            incident_category = data[i]['incident_category'];
            incident_subcategory = data[i]['incident_subcategory'];
            incident_description = data[i]['incident_description'];
            resolution = data[i]['resolution'];
            latitude = parseFloat(data[i]['latitude']);
            longitude = parseFloat(data[i]['longitude']);

            var contentString = '<div id="content">'+
              '<div id="siteNotice">'+
              '</div>'+
              '<h2 id="firstHeading" class="firstHeading">'+incident_datetime+'</h2>'+
              '<div id="bodyContent">'+
              '<p> category: ' + incident_category +
              '<br> subcategory: ' + incident_subcategory +
              '<br> description: ' + incident_description +
              '<br> resolution: ' + resolution + '</p>' +
              '</div>'+
              '</div>';

            var infowindow = new google.maps.InfoWindow({
              content: contentString
            });

            var marker = new google.maps.Marker({
              position: {lat: latitude, lng: longitude},
              map: map,
              title: incident_datetime
            });

            // markerList.push(marker);
            if (i >1000){
              marker.addListener('click', function() {
                infowindow.open(map, marker);
              });

            }
          // end for 
          }
          
        // end done()  
        });

      // end initMap() 
      }
# GeoCrime ([Demo](http://geo-crime.com/))

GeoCrime displays up-to-date police report data from the San Francisco Police Department using the Google Maps API. Reports included are "those for incidents that occurred starting January 1, 2018 onward and have been approved by a supervising officer". Features include color coded incidents, tool tips displaying incident information, ability to clearly display multiple incidents at the same location, and dynamic filtering.

This project was worked on as part of the [Hackbright Academy's Full-Time Software Engineering program](https://hackbrightacademy.com/software-engineering-program/).

#### Tech Stack
Python, JavaScript, HTML, CSS

Google Maps API, Overlapping Marker Spiderfier Library, DataSF, Bootstrap

## Features

### Marker Clustering
Initially, I had all the incidents displayed on the map, but this was very overwhelming and created a marker forest. I found that switching to marker clustering was an easy way to visualize exactly how much activity happens in the city. By clicking on the marker cluster, you zoom further into the city and get a more detailed view of where the dense locations are. At the closest zoom, color markers appear. Each color represents a different police report category. 

![marker cluster zoom](https://media.giphy.com/media/d9ao2BHozmDylflfSR/giphy.gif)

### Spiderfying
Many incidents occur at the same point, so to display these, I used the Overlapping Marker Spiderfier Library. Using the Google marker clustering library helps deal with markers that are close together, but doesn't allow you to access all the markers at one point. This library allows markers at the same point to spiderfy into a circle. Without this, only the top marker would be visible and usable.

![spider](https://media.giphy.com/media/4bjFSGmf6txtrKd02d/giphy.gif)

### Filtering

After getting the data from DataSF via AJAX, I had to extract the relevant data needed for this project. I saved the relevant data as an object to use it throughout my program. This also allowed my app to filter dynamically, rather than call AJAX each time the filters changed. 

I include a key showing the color markers and their corresponding categories. Using Bootstrap, a tooltip appears to show what types of incidents are labeled as that category when you hover over the marker icon. On the map, when you click on a marker, a Google Maps tooltip will appear describing the incident. I’ve built this app so that you can filter dynamically by date, time, category, or resolution. 

![filter by date](https://media.giphy.com/media/8hYMJPtZ3cU8YfVMEu/giphy.gif)


## Resources Used

### Dataset: Police Department Incident Reports: 2018 to PresentPublic Safety
This [dataset](https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783) includes "police incident reports filed by officers and by individuals through self-service online reporting for non-emergency cases. Reports included are those for incidents that occurred starting January 1, 2018 onward and have been approved by a supervising officer."


### Overlapping Marker Spiderfier Library

Using the Google marker clustering library helps deal with markers that are close together, but doesn't allow you to access all the markers at one point.  This [library](https://github.com/jawj/OverlappingMarkerSpiderfier) allows markers at the same point to spiderfy into a circle. Without this, only the top marker would be visable and usable. 

### Google Maps API
https://cloud.google.com/maps-platform/

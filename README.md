# GeoCrime ([Demo](http://geo-crime.com/))

## Project Overview (TLDR)
GeoCrime displays up-to-date police report data from the San Francisco Police Department using the Google Maps API. Reports included are "those for incidents that occurred starting January 1, 2018 onward and have been approved by a supervising officer". Features include color coded incidents, tool tips displaying incident information, ability to clearly display multiple incidents at the same location, and dynamic filtering.

This project was worked on as part of the [Hackbright Academy's Full-Time Software Engineering program](https://hackbrightacademy.com/software-engineering-program/).

#### Tech Stack
Python, JavaScript, HTML, CSS

Google Maps API, Overlapping Marker Spiderfier Library, DataSF, Bootstrap

#### Links
[Live Demo](http://geo-crime.com/) | 
[Demo with Voiceover](https://youtu.be/aICKVKetfkE) | 
[LinkedIn](https://www.linkedin.com/in/ciestupinan/)

## About GeoCrime

Using data from the San Francisco Police Department from DataSF, I display up-to-date police reports on the map. The reports included are for incidents that occurred starting January 1 of this year. Police reports can be submitted by police officer or by the public, but all reports have been approved by a supervising officer.

After getting the data from DataSF via AJAX, I had to extract the relevant data needed for this project. I saved the relevant data as an object to use it throughout my program. This also allowed my app to filter dynamically, rather than call AJAX each time the filters changed.

## Features

### Marker Clustering
Initially, I had all the incidents displayed on the map, but this was very overwhelming and created a marker forest. I found that switching to marker clustering was an easy way to visualize exactly how much activity happens in the city. To make the marker clusters, I used Google Maps MarkerClusterer library.  The blue clusters represent less than 10 incidents, yellow under 100, red under 1000, and pink represents 1000+ incidents. By clicking on the marker cluster, you zoom further into the city and get a more detailed view of where the dense locations are. At the closest zoom, color markers appear. Each color represents a different police report category.


![marker cluster zoom](https://media.giphy.com/media/d9ao2BHozmDylflfSR/giphy.gif)

### Category Key

At the closest zoom, color markers appear. Each color represents a different police report category. I included a category key, showing the color markers and their corresponding categories. Using Bootstrap, a tooltip appears when you click on the color icon or category title. This tooltip describes what types of incidents are labeled as that category. For example, the category “Larceny Theft” includes shoplifting, bicycle theft, and license plate theft.

I include a key showing the color markers and their corresponding categories. Using Bootstrap, a tooltip appears to show what types of incidents are labeled as that category when you hover over the marker icon. On the map, when a marker is clicked on, a Google Maps InfoWindow will appear describing the incident. I’ve built this app so that you can filter dynamically by date, time, category, or resolution. 

![category key](https://media.giphy.com/media/psljhyFcFDlV31no8W/giphy.gif)

### Spiderfying
Many incidents occur at the same point, so to display these, I used the Overlapping Marker Spiderfier Library. Using the Google marker clustering library helps deal with markers that are close together, but doesn't allow you to access all the markers at one point. This library allows markers at the same point to spiderfy into a circle. Without this, only the top marker would be visible and usable.

![spider](https://media.giphy.com/media/4bjFSGmf6txtrKd02d/giphy.gif)

### Filtering

After getting the data from DataSF via AJAX, I had to extract the relevant data needed for this project. I saved the relevant data as an object to use it throughout my program. This also allowed my app to filter dynamically, rather than call AJAX each time the filters changed. You can filter dynamically by date, time, category, or resolution.

![filter by date](https://media.giphy.com/media/8hYMJPtZ3cU8YfVMEu/giphy.gif)

### Deployment
At the end of my second sprint, I deployed my project using AWS Lightsail! You can visit my demo live at ![geo-crime.com](http://geo-crime.com/).
  
## Challenges
Right now, you can’t tell by look at the map which points have only one marker and which have multiple markers. I wanted to have a number, similar to a marker cluster, on points where there are multiple incidents at the same lat, long. When you click on this number, it would spider the incidents so that you could see them individually. The library would only allow me to display one type of marker - either all colored markers or all numbered markers. I plan on filing a bug with the library to get some clarification on how I could complete this or if it’s something they could implement in the next version. 

## Future Plans/Hopes/Dreams
This project is a baby step in the direction of my dream project, which is to create a safe walking route app. My next step will be to create a route from A to B showing all of the crime incidents along that path. 


## Resources Used

### DataSF "Police Department Incident Reports: 2018 to PresentPublic Safety" Dataset
This [dataset](https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783) includes "police incident reports filed by officers and by individuals through self-service online reporting for non-emergency cases. Reports included are those for incidents that occurred starting January 1, 2018 onward and have been approved by a supervising officer."


### Overlapping Marker Spiderfier Library

Using the Google marker clustering library helps deal with markers that are close together, but doesn't allow you to access all the markers at one point.  This [library](https://github.com/jawj/OverlappingMarkerSpiderfier) allows markers at the same point to spiderfy into a circle. Without this, only the top marker would be visable and usable. 

### Google Maps API
https://cloud.google.com/maps-platform/

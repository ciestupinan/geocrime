# GeoCrime

GeoCrime displays up-to-date police report data from the San Francisco Police Department using the Google Maps API. Reports included are "those for incidents that occurred starting January 1, 2018 onward and have been approved by a supervising officer". Features include color coded incidents, tool tips displaying incident information, ability to clearly display multiple incidents at the same location, and dynamic filtering.

This project was worked on as part of the [Hackbright Academy's Full-Time Software Engineering program](https://hackbrightacademy.com/software-engineering-program/).

#### Tech Stack
Python, JavaScript, HTML, CSS

Google Maps API, Overlapping Marker Spiderfier Library, DataSF, Bootstrap

## Features

### Marker Clustering
![marker cluster zoom](https://media.giphy.com/media/XJpK6gaONtlpZLx0pa/giphy.gif)

### Filtering

After getting the data from DataSF via AJAX, I had to extract the relevant data needed for this project. I saved the relevant data as an object to use it throughout my program. This also allowed my app to filter dynamically, rather than call AJAX each time the filters changed. 

![using all filters to show change in markers](https://media.giphy.com/media/5ZYvQjtsJZAY0bV6u1/giphy.gif)

Each category has a circle associated with it as either a solid color or a color with border. 

### Spiderfying


## Resources Used

### Dataset: Police Department Incident Reports: 2018 to PresentPublic Safety
This [dataset](https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783) includes "police incident reports filed by officers and by individuals through self-service online reporting for non-emergency cases. Reports included are those for incidents that occurred starting January 1, 2018 onward and have been approved by a supervising officer."


### Overlapping Marker Spiderfier Library

Using the Google marker clustering library helps deal with markers that are close together, but doesn't allow you to access all the markers at one point.  This [library](https://github.com/jawj/OverlappingMarkerSpiderfier) allows markers at the same point to spiderfy into a circle. Without this, only the top marker would be visable and usable. 

### Google Maps API
https://cloud.google.com/maps-platform/

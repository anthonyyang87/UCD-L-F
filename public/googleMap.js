"use strict";

var google;  // using var google here makes the Glitch editor happy and does not hurt anything
// using "let" makes the map not work. I need to think about why. 
// google.maps is actually set by the google script which was included in index.html,
// which calls initMap.

let map;  // this will be global

// This gets called when the Google maps librarys are fully downloaded
function initMap() {
      // stick a Google map onto the page
      exports.map = new google.maps.Map(document.getElementById("map"), {
            center: {
              lat: 38.537 ,
            lng:  -121.754
          },
          zoom: 16
          });
  
      // we plan to use the places service on this map
      let service = new google.maps.places.PlacesService(map);

      // get clicks on the map
      map.addListener('click', function(mapsMouseEvent) {
        let clickPt = mapsMouseEvent.latLng;
        // longitude and latitude
        console.log("Click at",clickPt.lat(), clickPt.lng())
        
        // set up CORS request to places API
        // gets everything within the radius
        let request = {
          location: clickPt,
          radius: 30 // meters
        };
        
        // do API CORS request to Google to return places near click
        service.nearbySearch(request, placesCallback);   
      }); // end of initMap
  
    // called when places are returned
    function placesCallback(results, status){
        console.log("placesCallback", status);
        for (let i=0; i<results.length; i++) {
          console.log(results[i].name, results[i].types);
        }
        alert(results);
    }
}
                    

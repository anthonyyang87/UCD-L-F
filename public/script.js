function next(){

	/*
	if (typeof(Storage) != "undefined") {
		sessionStorage.setItem("LostOrFound", )
	}
	*/

	//reading user input
	var LostOrFound = document.getElementById('LostOrFound').value; 
	var title = document.getElementById('title').value; 
	var description = document.getElementById('description').value; 
	var category = document.getElementById('category').value; 
	var photoURL = document.getElementById('photoURL').value; 
	var location = document.getElementById('location').value; 
	var date = document.getElementById('date').value; 
	var time = document.getElementById('time').value; 

	
	console.log("Input value from user input:", LostOrFound, title, description, category, photoURL, location, date, time); 
	
	//constructing json object
	var jsonObj = {
		"LostOrFound": LostOrFound, 
		"title": title, 
		"description": description, 
		"category": category,
		"photoURL": photoURL, 
		"location": location, 
		"date": date, 
		"time": time

	}

	console.log("Json object: ", jsonObj); 


}

function sendToServer(jsonObj){
	
}
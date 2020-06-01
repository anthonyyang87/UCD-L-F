
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


function finderNext(){
  
  //read from user input
  var LostOrFound = document.getElementById('LostOrFound').value; 
	var title = document.getElementById('title').value; 
	var description = document.getElementById('description').value; 
	var category = document.getElementById('category').value; 
	var photoURL = document.getElementById('imageUpload').value; 
  
  //store in session storage
  sessionStorage.setItem('LostOrFound', LostOrFound); 
  sessionStorage.setItem('title', title); 
  sessionStorage.setItem('description', description); 
  sessionStorage.setItem('category', category); 
  sessionStorage.setItem('photoURL', photoURL); 
  
  window.location.href = "screen04.html";
  
}

function finderSubmit(){
  var location = document.getElementById('location').value; 
	var date = document.getElementById('date').value; 
	var time = document.getElementById('time').value; 
  

  //grab saved values in previous page
  var LostOrFound = sessionStorage.getItem('LostOrFound'); 
  var title = sessionStorage.getItem('title'); 
  var description = sessionStorage.getItem('description'); 
  var category = sessionStorage.getItem('category'); 
  var photoURL = sessionStorage.getItem('photoURL'); 
  
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
  
  //for testing if user input is collected properly
  console.log("Json object: ", jsonObj); 
  
  //now send user data to server
  sendToServer(jsonObj); 
}

function sendToServer(data){
  
  // new HttpRequest instance 
  var xmlhttp = new XMLHttpRequest();   
  xmlhttp.open("POST", '/newItem');
  // important to set this for body-parser
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // setup callback function
  xmlhttp.onloadend = function(e) {
    let response = xmlhttp.responseText; 
    console.log("Response from server: ", response); 
    // immediately switch to display view
    //window.open("display.html");
  }
  
  // all set up!  Send off the HTTP request
  xmlhttp.send(JSON.stringify(data));
}
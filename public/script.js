
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
	var photoURL = document.getElementById('imgUpload').files[0].name; 
  var photoData = document.getElementById('imgUpload').files[0]; 
  
  //store in session storage
  sessionStorage.setItem('LostOrFound', LostOrFound); 
  sessionStorage.setItem('title', title); 
  sessionStorage.setItem('description', description); 
  sessionStorage.setItem('category', category); 
  sessionStorage.setItem('photoURL', photoURL); 
  sessionStorage.setItem('photoData', photoData); 
  
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
  var photoData = sessionStorage.getItem('photoData'); 
  
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
  
  //uploading image to server
  uploadImage(photoData); 
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


function uploadImage(selectedFile){
  //store in formData
  const formData = new FormData(); 
  var new
  formData.append('newImage', selectedFile, selectedFile.name); 
  //formData.append('newImage', selectedFile); 
  
  //build http request data structure
  const xhr = new XMLHttpRequest(); 
  xhr.open("POST", "/upload", true); 
  xhr.onloadend = function(e) {
        // Get the server's response to the upload
        console.log(xhr.responseText);
        let newImage = document.querySelector("#cardImg");
        newImage.src = "../images/"+selectedFile.name;
        //console.log("Filename: ", selectedFile.name); 
        newImage.style.display = 'block';
        document.querySelector('.image').classList.remove('upload');
      
        //Here trigger upload to media storage
        sendGetRequest(); 
    }
  
    // actually send the request
    xhr.send(formData);
}

// sends an AJAX request asking the server 
function sendGetRequest() {
  let xhr = new XMLHttpRequest;
  // it's a GET request, it goes to URL /seneUploadToAPI
  xhr.open("GET","sendUploadToAPI");
  
  // Add an event listener for when the HTTP response is loaded
  xhr.addEventListener("load", function() {
      if (xhr.status == 200) {  // success
        console.log("Image uploaded to media storage.");
      } else { // failure
        console.log("Upload to media storage failed!"); 
      }
  });
  
  // Actually send request to server
  xhr.send();
}

//THE FOLLOWING TWO FUNCTIONS ARE USED FOR MEDIA STORAGE
/*
function showMsg(elmtId, returnedText, otherOne) {
        let msg = document.getElementById(elmtId);
        msg.textContent = msg.textContent.trim()+returnedText;
        msg.className = "visible";
        
        // you can only push the button once
        let uploadButton = document.getElementById("sendRequest");
        uploadButton.removeEventListener("click", sendGetRequest);
}
*/

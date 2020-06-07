
function finderNext(){
  
  //read from user input
  var LostOrFound = "Found"; 
	var title = document.getElementById('title').value; 
	var description = document.getElementById('description').value; 
	var category = document.getElementById('category').value; 
  var photoURL = ""; 
  if(title == "" || description == "" || category == ""){
    alert("PLease fill all required fields."); 
    return false; 
  }
  
  //optional photo upload
  try{
    photoURL = document.getElementById('imgUpload').files[0].name; 
  } catch(err){
    photoURL = ""; 
  }

  //store in session storage
  
  sessionStorage.setItem('LostOrFound', LostOrFound); 
  sessionStorage.setItem('title', title); 
  sessionStorage.setItem('description', description); 
  sessionStorage.setItem('category', category); 
  sessionStorage.setItem('photoURL', photoURL); 
  
  //experiment handle upload photo here
  if(photoURL != ""){
    var selectedFile = document.getElementById('imgUpload').files[0];
    const formData = new FormData(); 
    formData.append('newImage', selectedFile, selectedFile.name); 
    //formData.append('newImage', selectedFile); 

    //build http request data structure
    const xhr = new XMLHttpRequest(); 
    xhr.open("POST", "/upload", true); 
    xhr.onloadend = function(e) {
          // Get the server's response to the upload
          console.log(xhr.responseText);

          //Here trigger upload to media storage
          sendGetRequest(); 

          //redirect to next page
          window.location.href = "screen04.html";
      }

      // actually send the request
      xhr.send(formData);
    } else {
        //redirect to next page
        window.location.href = "screen04.html";
    }  
}

function finderSubmit(){
  
  //reading inputs
  //var location = document.getElementById('location').value; 
  //var location = "Somewhere on the planet"; 
  var location; 
  
  //this is just for letting it work before google API works
  try{
    location = document.getElementById('location').value; 
  }catch(err){
    location = ""; 
  }
  
	var date = document.getElementById('date').value; 
	var time = document.getElementById('time').value; 
  
  //catching if there are empty fields FIX LOCATION LATER
  if(date == "" || time == ""){
    alert("Please Fill All Required Field."); 
    return false; 
  }
  
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
  
  //redirect to homw page
  //window.location.href="screen02.html"; 
}

function seekerNext(){
  //read from user input
  var LostOrFound = "Lost"; 
	var title = document.getElementById('title').value; 
	var description = document.getElementById('description').value; 
	var category = document.getElementById('category').value; 
  var photoURL = ""; 
  if(title == "" || description == "" || category == ""){
    alert("PLease fill all required fields."); 
    return false; 
  }
  
  //optional photo upload
  try{
    photoURL = document.getElementById('imgUpload').files[0].name; 
  } catch(err){
    photoURL = ""; 
  }

  //store in session storage
  
  sessionStorage.setItem('LostOrFound', LostOrFound); 
  sessionStorage.setItem('title', title); 
  sessionStorage.setItem('description', description); 
  sessionStorage.setItem('category', category); 
  sessionStorage.setItem('photoURL', photoURL); 
  
  //experiment handle upload photo here
  if(photoURL != ""){
    var selectedFile = document.getElementById('imgUpload').files[0];
    const formData = new FormData(); 
    formData.append('newImage', selectedFile, selectedFile.name); 
    //formData.append('newImage', selectedFile); 

    //build http request data structure
    const xhr = new XMLHttpRequest(); 
    xhr.open("POST", "/upload", true); 
    xhr.onloadend = function(e) {
          // Get the server's response to the upload
          console.log(xhr.responseText);

          //Here trigger upload to media storage
          sendGetRequest(); 

          //redirect to next page
          window.location.href = "screen07.html";
      }

      // actually send the request
      xhr.send(formData);
    } else {
        //redirect to next page
        window.location.href = "screen07.html";
    }  
}

//following two functions for seeker
function seekerSubmit(){
  
  //reading inputs
  //var location = document.getElementById('location').value; 
  //var location = "Somewhere on the planet"; 
  var location; 
  
  //this is just for letting it work before google API works
  try{
    location = document.getElementById('location').value; 
  }catch(err){
    location = ""; 
  }
  
	var date = document.getElementById('date').value; 
	var time = document.getElementById('time').value; 
  
  //catching if there are empty fields FIX LOCATION LATER
  if(date == "" || time == ""){
    alert("Please Fill All Required Field."); 
    return false; 
  }
  
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
  
  //redirect back to home page
  //window.location.href="screen02.html"; 
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
    
    if(confirm("Item Saved. Redirect to homepage?")){
      window.location.href="screen02.html"; 
    }
    
    // if(response) {
    //   if(origin = "finder") {
    //     window.location.href = "/screen09.html?action=showAll";
    //   }
    //   else {
    //     window.location.href = "/screen10.html?action=showAll";
    //   }
    // }
    
    // immediately switch to display view
    //window.open("display.html");
  }
  
  // all set up!  Send off the HTTP request
  xmlhttp.send(JSON.stringify(data));
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

function finderSearch(){
  
  //reading from user input
  
  var category = document.getElementById('category').value; 
  var location = document.getElementById('location').value; 
	//var date = document.getElementById('date').value; 
	//var time = document.getElementById('time').value; 
  
  var startDate = document.getElementById('startDate').value; 
  var endDate = document.getElementById('endDate').value; 
  var startTime = document.getElementById('startTime').value; 
  var endTime = document.getElementById('endTime').value; 
  var searchText = document.getElementById('searchTxt').value; 
  //get textbox information from seesion storage
  
  //this checks if at least one field is filled
  if(category == "" && location == "" && startDate == "" && endDate == "" && startTime == "" && endTime == ""){
    alert("Please Fill In At Least One Field."); 
    return false; 
  }
  sessionStorage.setItem("category", category); 
  sessionStorage.setItem('location', location); 
  //sessionStorage.setItem('date', date); 
  //sessionStorage.setItem('time', time);
  
  sessionStorage.setItem('startDate', startDate); 
  sessionStorage.setItem('endDate', endDate); 
  sessionStorage.setItem('startTime', startTime); 
  sessionStorage.setItem('endTime', endTime); 
  sessionStorage.setItem('searchText', searchText); 
  
  console.log("Search Input: ", category, location, startDate, endDate, startTime, endTime, searchText); 
  window.location.href = "/screen09.html?action=showSearch";
  
}

function seekerSearch(){
  
  //reading from user input
  
  var category = document.getElementById('category').value; 
  var location = document.getElementById('location').value; 
  var searchText = document.getElementById('searchTxt').value; 
  var startDate = document.getElementById('startDate').value; 
  var endDate = document.getElementById('endDate').value; 
  var startTime = document.getElementById('startTime').value; 
  var endTime = document.getElementById('endTime').value; 
  
  //this checks if at least one field is filled
  if(category == "" && location == "" && startDate == "" && endDate == "" && startTime == "" && endTime == ""){
    alert("Please Fill In At Least One Field."); 
    return false; 
  }
  
  sessionStorage.setItem("category", category); 
  sessionStorage.setItem('location', location); 
  //sessionStorage.setItem('date', date); 
  //sessionStorage.setItem('time', time);
  
  sessionStorage.setItem('startDate', startDate); 
  sessionStorage.setItem('endDate', endDate); 
  sessionStorage.setItem('startTime', startTime); 
  sessionStorage.setItem('endTime', endTime); 
  sessionStorage.setItem('searchText', searchText); 
  
  window.location.href = "screen10.html?action=showSearch";
  
}

//loads search result in result page
function loadResult(type){
  
  //retrieve search input from session storage
  var searchText = sessionStorage.getItem('searchText'); 
  var category = sessionStorage.getItem('category'); 
  var location = sessionStorage.getItem('location'); 
  //var date  = sessionStorage.getItem('date'); 
  //var time = sessionStorage.getItem('time'); 
  
  var startDate = sessionStorage.getItem('startDate'); 
  var endDate = sessionStorage.getItem('endDate'); 
  var startTime = sessionStorage.getItem('startTime'); 
  var endTime = sessionStorage.getItem('endTime'); 
  
  // Display search query
  let searchQuery = document.querySelector('#searchQuery');
  let str = '';
  if(startDate != '' && endDate != '') {
    str = str + startDate + ' to ' + endDate + ',';
  }
  else {
    str = str + startDate + endDate + ',';
    if(str.endsWith(","))
      str = str.slice(0,-1);
  }
  if(searchText != '') {
    str = str + ' ' + searchText + ',';
  }
  else if (category != '') {
    str = str + ' ' + category + ',';
  }
  if(location != '') {
    str = str + ' ' + location;
  }
  
  if(str.endsWith(","))
    str = str.slice(0,-1);
  
  console.log(str.length);
  searchQuery.innerHTML = str;
  
  //construct json object
  var jsonObj = {
    searchText: searchText, 
    category: category, 
    location: location, 
    startDate: startDate, 
    endDate: endDate, 
    startTime: startTime, 
    endTime: endTime
  }; 
  
  //send request to server
  let xhr = new XMLHttpRequest; 
  var url = "cool-ant-eth.glitch.me/screen10.html?id=" + JSON.stringify(jsonObj); 
  //console.log(url); 
  xhr.open("GET", url);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  
  xhr.onloadend = function(e){
    var res = xhr.responseText; 
    
    //  Call show results function
    let items = JSON.parse(res);
    items.forEach(item => {
      console.log(item);
      // Add item to list
      if(item["lostOrFound"] == type) {
        
        var div_item = document.createElement("DIV");
        div_item.classList.add('item');
        var btn = document.createElement('button');
        btn.classList.add('collapsible');
        btn.innerHTML = item["title"];
        div_item.appendChild(btn);
        var div_content = document.createElement("DIV");
        div_content.classList.add('content');
        div_item.appendChild(div_content);
        var img = document.createElement("img");
        img.src = item["photoURL"];
        div_content.appendChild(img);
        var div_info = document.createElement("DIV");
        div_info.classList.add('info');
        div_content.appendChild(div_info);
        
        var div_infoItem = document.createElement("DIV");
        div_infoItem.classList.add('infoItem');
        var h2 = document.createElement("h2");
        h2.innerHTML = "Category";
        div_infoItem.appendChild(h2);
        var p = document.createElement("p");
        p.innerHTML = item["category"];
        div_infoItem.appendChild(p);
        div_info.appendChild(div_infoItem);
        
        var div_infoItem = document.createElement("DIV");
        div_infoItem.classList.add('infoItem');
        var h2 = document.createElement("h2");
        h2.innerHTML = "Location";
        div_infoItem.appendChild(h2);
        var p = document.createElement("p");
        p.innerHTML = item["location"];
        div_infoItem.appendChild(p);
        div_info.appendChild(div_infoItem);
        
        var div_infoItem = document.createElement("DIV");
        div_infoItem.classList.add('infoItem');
        var h2 = document.createElement("h2");
        h2.innerHTML = "Date";
        div_infoItem.appendChild(h2);
        var p = document.createElement("p");
        p.innerHTML = item["date"];
        div_infoItem.appendChild(p);
        div_info.appendChild(div_infoItem);
        
        var p_infoItem = document.createElement("p");
        p_infoItem.classList.add('infoItem');
        p_infoItem.innerHTML = item['description'];
        div_info.appendChild(p_infoItem);
        
        document.getElementById("results").appendChild(div_item); 
      }
    });
    setCollapsible();
    // console.log(res); 
  }
  
  //sending request to server
  xhr.send(null); 
}

//this function shows all the data stored in the DB
function showAllDataStored(type){
  let xhr = new XMLHttpRequest; 
  xhr.open("GET", "getDataFromDB"); 
  
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  
  xhr.onloadend = function(e){
    var res = xhr.responseText; 
    console.log(res); 
    
  }
  
  //sending request to server
  xhr.send(); 
}

// Search button
function searchBtnClick() {
  sessionStorage.setItem('searchText', document.getElementById('searchTxt').value);
  console.log(document.getElementById('searchTxt').value);
  window.location = "/screen05.html";
}

//for seeker
function searchBtnClick2() {
  sessionStorage.setItem('searchText', document.getElementById('searchTxt').value);
  console.log(document.getElementById('searchTxt').value);
  window.location = "/screen08.html";
}

function setCollapsible() {
  var coll = document.getElementsByClassName("collapsible");

  for (var i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  }
}
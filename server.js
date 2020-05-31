// server.js
// where your node app starts

// include modules
const express = require('express');

const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const sql = require("sqlite3").verbose();
const FormData = require("form-data");

let filename = ""; 
let filename2 = ""; 
//creating database if not exist
const lostDB = new sql.Database("LostAndFoundTable.db"); 

let cmd = " SELECT name FROM sqlite_master WHERE type='table' AND name='LostAndFoundTable' "; 
lostDB.get(cmd, function(err, val){
  console.log("Error here:", err, val); 
  if (val == undefined) {
    console.log("Database not found -- Creating one now..."); 
    createDB(); 
  }
  else {
    console.log("Database found"); 
  }
}); 

//the function that creates database
function createDB() {
	const cmd = " CREATE TABLE LostAndFoundTable ()"; 
}

// begin constructing the server pipeline
const app = express();

// Serve static files out of public directory
app.use(express.static('public'));
// The body-parser is used on requests with application/json in header
// parses the JSON in the HTTP request body, and puts the resulting object 
// into request.body
app.use(bodyParser.json()); 


//here handles GET requests from client
function handlePostcard(req, res, next){
  //let url = "g"; 
  let key = req.query.id; 
  let cmd = "SELECT randomString, jsonString FROM PostCardTable WHERE randomString=?";
  lostDB.all(cmd, key, function (err, data){
    if (err){
      console.log("Database reading error:", err.message); 
    } else {
      res.json(data[0]["jsonString"]); 
      console.log(data[0]["jsonString"]); 
    }
  })
}

// Now construct the server pipeline
// Special case for request with just the base URL
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/public/index.html");
});




// Handle a POST request containing JSON
app.use(bodyParser.json());
// gets JSON data into req.body
app.post('/newItem', function (req, res) {
  console.log("Server received: ", req.body);
  // save the JSON string into database
  let randomString = makeRandStr(8); 
  let userData = JSON.stringify(req.body); 
  
  //put new item into database
  cmd = "INSERT INTO PostcardTable ( randomString, jsonString) VALUES (?,?)"; 
  lostDB.run(cmd, randomString, userData, function(err){
    if(err) {
      console.log("Database Insert Error!"); 
    } else {
      let newId = this.lastID; //rowid of last inserted item
      
      res.send(randomString); 
    }
  }); 
  
});

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/images')    
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
// let upload = multer({dest: __dirname+"/assets"});
let upload = multer({storage: storage});


// Also serve static files out of /images
app.use("/images",express.static('images'));

// Handle GET request to base URL with no other route specified
// by sending creator.html, the main page of the app
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
});


// Handle a post request to upload an image. 
app.post('/upload', upload.single('newImage'), function (request, response) {
  console.log("Recieved",request.file.originalname,request.file.size,"bytes")
  filename = "/images/" + request.file.originalname; 
  filename2 = "images/" + request.file.originalname; 
  if(request.file) {
    // file is automatically stored in /images, 
    // even though we can't see it. 
    // We set this up when configuring multer
    response.end("recieved "+request.file.originalname);
  }
  else throw 'error';
});

//Here we integrate media storage
// Send a fixed file for now
//const filename = '/images/LJ.jpg';

// fire off the file upload if we get this "GET"
app.get("/sendUploadToAPI", function(request, response){
        sendMediaStore(filename, request, response);
});

// function called when the button is pushed
// handles the upload to the media storage API
function sendMediaStore(filename, serverRequest, serverResponse) {
  let apiKey = process.env.ECS162KEY;
  if (apiKey === undefined) {
    serverResponse.status(400);
    serverResponse.send("No API key provided");
  } else {
    // we'll send the image from the server in a FormData object
    let form = new FormData();
    
    // we can stick other stuff in there too, like the apiKey
    form.append("apiKey", apiKey);
    // stick the image into the formdata object
    form.append("storeImage", fs.createReadStream(__dirname + filename));
    // and send it off to this URL
    form.submit("http://ecs162.org:3000/fileUploadToAPI", function(err, APIres) {
      // did we get a response from the API server at all?
      if (APIres) {
        // OK we did
        console.log("API response status", APIres.statusCode);
        // the body arrives in chunks - how gruesome!
        // this is the kind stream handling that the body-parser 
        // module handles for us in Express.  
        let body = "";
        APIres.on("data", chunk => {
          body += chunk;
        });
        APIres.on("end", () => {
          // now we have the whole body
          if (APIres.statusCode != 200) {
            serverResponse.status(400); // bad request
            serverResponse.send(" Media server says: " + body);
          } else {
            serverResponse.status(200);
            serverResponse.send(body);
            
            
            try {
              //let filepath = "https://ant-better-post.glitch.me" + filename; 
              fs.unlink(filename2); 
            } catch(err) {
              console.error(err); 
            }
            
          }
        });
      } else { // didn't get APIres at all
        serverResponse.status(500); // internal server error
        serverResponse.send("Media server seems to be down.");
      }
    });
  }
}

//generating random string
function makeRandStr(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

// The GET AJAX query is handled by the static server, since the 
// file postcardData.json is stored in /public

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});



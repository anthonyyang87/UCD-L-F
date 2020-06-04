// We need many modules  

// some of the ones we have used before
const express = require('express');
const bodyParser = require('body-parser');
// const assets = require('./assets');
const sqlite3 = require('sqlite3');  // we'll need this later
const multer = require('multer');
const fs = require('fs');
const FormData = require("form-data");
// and some new ones related to doing the login process
const passport = require('passport');
// There are other strategies, including Facebook and Spotify
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Some modules related to cookies, which indicate that the user
// is logged in
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');

const sql = require("sqlite3").verbose();

const request = require('request')

// let dbRowId = 1;

// Setup passport, passing it information about what we want to do
passport.use(new GoogleStrategy(
  // object containing data to be sent to Google to kick off the login process
  // the process.env values come from the key.env file of your app
  // They won't be found unless you have put in a client ID and secret for 
  // the project you set up at Google
  {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  // CHANGE THE FOLLOWING LINE TO USE THE NAME OF YOUR APP
  callbackURL: 'https://cool-ant-eth.glitch.me/auth/accepted',  
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo', // where to go for info
  scope: ['profile', 'email']  // the information we will ask for from Google
},
  // function to call to once login is accomplished, to get info about user from Google;
  // it is defined down below.
  gotProfile));


// Start setting up the Server pipeline
const app = express();
console.log("setting up pipeline")

// take HTTP message body and put it as a string into req.body
app.use(bodyParser.urlencoded({extended: true}));

// puts cookies into req.cookies
app.use(cookieParser());

// pipeline stage that echos the url and shows the cookies, for debugging.
app.use("/", printIncomingRequest);

// Now some stages that decrypt and use cookies

// express handles decryption of cooikes, storage of data about the session, 
// and deletes cookies when they expire
app.use(expressSession(
  { 
    secret:'bananaBread',  // a random string used for encryption of cookies
    maxAge: 6 * 60 * 60 * 1000, // Cookie time out - six hours in milliseconds
    // setting these to default values to prevent warning messages
    resave: true,
    saveUninitialized: false,
    // make a named session cookie; makes one called "connect.sid" as well
    name: "ecs162-session-cookie"
  }));

// Initializes request object for further handling by passport
app.use(passport.initialize()); 

// If there is a valid cookie, will call passport.deserializeUser()
// which is defined below.  We can use this to get user data out of
// a user database table, if we make one.
// Does nothing if there is no cookie
app.use(passport.session()); 



// The usual pipeline stages

// Public files are still serverd as usual out of /public
app.get('/*',express.static('public'));

// special case for base URL, goes to index.html
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// Glitch assests directory 
// app.use("/assets", assets);

// stage to serve files from /user, only works if user in logged in

// If user data is populated (by deserializeUser) and the
// session cookie is present, get files out 
// of /user using a static server. 
// Otherwise, user is redirected to public splash page (/index) by
// requireLogin (defined below)
app.get('/user/*', requireUser, requireLogin, express.static('.'));




// Now the pipeline stages that handle the login process itself

// Handler for url that starts off login with Google.
// The app (in public/index.html) links to here (note not an AJAX request!)
// Kicks off login process by telling Browser to redirect to Google.
app.get('/auth/google', passport.authenticate('google'));
// The first time its called, passport.authenticate sends 302 
// response (redirect) to the Browser
// with fancy redirect URL that Browser will send to Google,
// containing request for profile, and
// using this app's client ID string to identify the app trying to log in.
// The Browser passes this on to Google, which brings up the login screen. 


// Google redirects here after user successfully logs in. 
// This second call to "passport.authenticate" will issue Server's own HTTPS 
// request to Google to access the user's profile information with the  	
// temporary key we got from Google.
// After that, it calls gotProfile, so we can, for instance, store the profile in 
// a user database table. 
// Then it will call passport.serializeUser, also defined below.
// Then it either sends a response to Google redirecting to the 
// /setcookie endpoint, below
// or, if failure, it goes back to the public splash page. 
// NOTE:  Apparently, this ends up at the failureRedirect if we
// do the revoke in gotProfile.  So, if you want to redirect somewhere
// else for a non-UCDavis ID, do it there. 
app.get('/auth/accepted', 
  passport.authenticate('google', 
    { successRedirect: '/setcookie', failureRedirect: '/' }
  )
);

// One more time! a cookie is set before redirecting
// to the protected homepage
// this route uses two middleware functions.
// requireUser is defined below; it makes sure req.user is defined
// the second one makes a public cookie called
// google-passport-example
app.get('/setcookie', requireUser,
  function(req, res) {
    // if(req.get('Referrer') && req.get('Referrer').indexOf("google.com")!=-1){
      // mark the birth of this cookie
  
      // set a public cookie; the session cookie was already set by Passport
      res.cookie('google-passport-example', new Date());
      // res.redirect('/user/hello.html');
    //} else {
    //   res.redirect('/');
    //}
  }
);


// currently not used
// using this route, we can clear the cookie and close the session
app.get('/user/logoff',
  function(req, res) {
    // clear both the public and the named session cookie
    res.clearCookie('google-passport-example');
    res.clearCookie('ecs162-session-cookie');
    res.redirect('/');
  }
);




// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});


// Some functions called by the handlers in the pipeline above


// Function for debugging. Just prints the incoming URL, and calls next.
// Never sends response back. 
function printIncomingRequest (req, res, next) {
    // console.log("Serving",req.url);
    if (req.cookies) {
      // console.log("cookies",req.cookies)
    }
    next();
}

// function that handles response from Google containint the profiles information. 
// It is called by Passport after the second time passport.authenticate
// is called (in /auth/accepted/)
function gotProfile(accessToken, refreshToken, profile, done) {
    console.log("Google profile",profile);
    // here is a good place to check if user is in DB,
    // and to store him in DB if not already there. 
    // Second arg to "done" will be passed into serializeUser,
    // should be key to get user out of database.
  
    // Check if email is a UCD email
    var emailAddress = profile['emails'][0]['value'];
    console.log('user email: ', emailAddress);

    let dbRowID = 1;  // temporary! Should be the real unique
    // key for db Row for this user in DB table.
    // Note: cannot be zero, has to be something that evaluates to
    // True.  
  
    if (!emailAddress.includes('ucdavis.edu')) {
      // Indicate user did NOT login with a UCD email
      dbRowID = -1;
      console.log("Non UCD email!");
      request.get('https://accounts.google.com/o/oauth2/revoke', {
        qs:{token: accessToken }},  function (err, res, body) {
        console.log("revoked token");
      }) 
    }

    done(null, dbRowID); 
}


// Part of Server's sesssion set-up.  
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie. 
// For instance, if there was some specific profile information, or
// some user history with this Website we pull out of the user table
// using dbRowID.  But for now we'll just pass out the dbRowID itself.
passport.serializeUser((dbRowID, done) => {
    console.log("SerializeUser. Input is",dbRowID);
    done(null, dbRowID);
});

// Called by passport.session pipeline stage on every HTTP request with
// a current session cookie (so, while user is logged in)
// This time, 
// whatever we pass in the "done" callback goes into the req.user property
// and can be grabbed from there by other middleware functions
passport.deserializeUser((dbRowID, done) => {
    console.log("deserializeUser. Input is:", dbRowID);
    // here is a good place to look up user data in database using
    // dbRowID. Put whatever you want into an object. It ends up
    // as the property "user" of the "req" object. 
    let userData = dbRowID;
    done(null, userData);
});

function requireUser (req, res, next) {
  console.log("require user",req.user)
  if (!req.user) {
    res.redirect('/');
  } else {
    if(req.user == -1) {
      res.redirect('/screen01.html?email=notUCD');
    } else {
      res.redirect('/screen02.html');
    }
    // next();
  }
};

function requireLogin (req, res, next) {
  console.log("checking:",req.cookies);
  if (!req.cookies['ecs162-session-cookie']) {
    res.redirect('/');
  } else {
    next();
  }
};

// server.js
// where your node app starts



const OAuthID = "971930675546-864jqnkaernfs9fks10bfrfmtorstjju.apps.googleusercontent.com";
const OAuthsecret = "0VN1aalDI_jB99X_MCY7s-8s";

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
	const cmd = " CREATE TABLE LostAndFoundTable (id INTEGER PRIMARY KEY, lostOrFound TEXT, title TEXT, category, \
  description TEXT, photoURL TEXT, date TEXT, time TEXT, location TEXT )"; 
  
  lostDB.run(cmd, function(err, val){
    if(err){
      console.log("Database Creation Error: ", err); 
    } else{
      console.log("Database created!"); 
    }
  }); 
  
}


// Serve static files out of public directory
app.use(express.static('public'));
// The body-parser is used on requests with application/json in header
// parses the JSON in the HTTP request body, and puts the resulting object 
// into request.body
app.use(bodyParser.json()); 


//here handles GET requests from client

// Now construct the server pipeline
// Special case for request with just the base URL
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/public/index.html");
});

//Handle a get request from browser getting data
app.get('/getDataFromDB', function (req, res){
  cmd = "SELECT * FROM LostAndFoundTable";  
  lostDB.all(cmd, function (err, data){
    if(err){
      console.log("Database reading error..."); 
    } else{
      res.json(data); 
      console.log(data); 
    }
  }); 
}); 


//Hondle a get request for search result
app.get('/cool-ant-eth.glitch.me/screen10.html', function(req, res){
  //read and parse request packet
  var search = JSON.parse(req.query.id); 
  var category = search.category; 
  var location = search.location; 
  //var date = search.date; 
  //var time = search.time;
  var startDate = search.startDate; 
  var endDate = search.endDate; 
  var startTime = search.startTime; 
  var endTime = search.endTime; 
  
  //for testing
  console.log("Search input: ", search); 
  //construct command
  cmd = "SELECT * FROM LostAndFoundTable WHERE (date>=? AND date<=? AND time>=? AND time<=? ) AND (category=? OR location=?) ";
  //cmd = "SELECT * FROM LostAndFoundTable WHERE category='Electronics'"
  lostDB.all(cmd, startDate, endDate, startTime, endTime, category, location, function(err, data){
    if(err){
      console.log("Database read error"); 
    }else{
      res.json(data); 
      console.log(data); 
    }
  }); 
}); 

// Handle a POST request containing JSON
app.use(bodyParser.json());
// gets JSON data into req.body
app.post('/newItem', function (req, res) {
  console.log("Server received: ", req.body);
  // save the JSON string into database
  
  //res.send(userData); 
  
  //parse received data and store into database
  
  var data = req.body; 
  var title = data.title, 
      LostOrFound = data.LostOrFound, 
      category = data.category, 
      description = data.description, 
      time = data.time, 
      date = data.date, 
      location = data.location; 
  
  var photoURL = "http://ecs162.org:3000/images/antyang/" + data.photoURL; 
  
  //for testing
  console.log("Data to be inserted: ", title, description, photoURL); 
  //save to database
  cmd = "INSERT INTO LostAndFoundTable (LostOrFound, title, category, description, \
        photoURL, time, date, location) VALUES (?,?,?,?,?,?,?,?)"
  
  //run the insert command
  lostDB.run(cmd, LostOrFound, title, category, description, photoURL, time, date, location, function(err){
    if(err) {
      console.log("Database Insert Error!");
    } else {
      var newId = this.lastID; 
      console.log("Item inserted with rowID: ", newId); 
      
      res.sendStatus(200); 
    }
  })
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


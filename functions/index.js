'use strict';

// [START import]
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const faker = require('faker'); // Generates meaningful fake data - https://www.npmjs.com/package/faker
const express = require('express'); // See https://expressjs.com/en/guide/routing.html for reference
const app = express();
// [END import]

// The Firebase Admin SDK to access the Firebase Realtime Database.
admin.initializeApp();
// Since this code will be running in the Cloud Functions environment
// we call initialize Firestore without any arguments because it
// detects authentication from the environment.
const firestore = admin.firestore();

// [START middleware]
const cors = require('cors')({origin: true});
app.use(cors);
// [END middleware]


//
// Loads mock data in local variable for easy access
// -----------------------------------------------------
const mockUser = require('./mock-responses/user');
const mockPhotos = require('./mock-responses/photos');

//
// Mocking Data
// ----------------------------------------
// The server is essentially an Express JS framework.
// To mock data, we need to define 'routing' rules and mock responses.
// See https://expressjs.com/en/guide/routing.html for conventions used and best practices.
//  - Mock resource are saved in JSON file located at: `mock-responses/[resourceId].json`
//
// Here are some useful object available in each REQUEST ("req" variable), which can be used to provide dynamic response based on input value.
//  * Query Data Object:  req.query
//  * Post Data Object:   req.body
//  * Path parameter:     req.params
//  * Header Data Object: req.headers


/**
 * Say hello as response
 * ----------------------------------------
 * Try: https://mock-apis-server.firebaseapp.com/say/hello
 * or with name: https://mock-apis-server.firebaseapp.com/say/hello?name=Ryan
 */
app.get('/say/hello', (req, res) => {
   console.log('Request Query Params: ', req.query);

  // Response can be dynamic based on input
  if(req.query.hasOwnProperty('name') && req.query.name !== "") {
     return res.status(200)
            .json({"message":"Hello " + req.query.name + "! Welcome to mock server."});
  }

  // Success response
  return res.status(200)
            .json({"message":"Hello there... Welcome to mock server."});
});
/* [END `/say/hello` ] */



/**
 * Simple request with pre-populated mock response from `mock-responses/photos.json`
 * --------------------------------------------------------------------------------------
 * Try: https://mock-apis-server.firebaseapp.com/photos
 */
app.get('/photos', (req, res) => {
  return res.status(200).json(mockPhotos);
});
/* [END `/photos` ] */



/**
 * Re-uses `mock-responses/photos.json` data to respond with single image.
 * --------------------------------------------------------------------------------------
 * Try: https://mock-apis-server.firebaseapp.com/photos/2321
 */
app.get('/photos/:photoId', (req, res) => {
  // Returns the first item from the list, you could return random item too
  return res.status(200).json(mockPhotos.photos[0]);
});
/* [END `/photos/:photoId` ] */



/**
 * Provides user's information based on user ID
 * Captures dynamic params from URL (See https://expressjs.com/en/guide/routing.html)
 * ----------------------------------------
 * Try (refresh for new fake values): https://mock-apis-server.firebaseapp.com/users/myid
 */
app.get('/users/:userId', (req, res) => {
  console.log('Request Query Params: ', req.query);
  console.log('Request URL Params: ', req.params);

  if(!req.params.hasOwnProperty('userId')) {
    return res.status(400)
          .json({"message":"The `userId` is required."});
  }

  return res.status(200)
            .json({"userId": req.params.userId,
                    "name": faker.name.findName(),
                    "email": faker.internet.email()})
});
/* [END `/users/:userId` ] */



/**
 * Simple function that mocks register response using preloaded mock data. See [mockUser] above.
 *
 * Here is an example request with data:
 * ```
 * curl -X POST \
 *   https://mock-apis-server.firebaseapp.com/register \
 *   -H 'Content-Type: application/json' \
 *   -d '{"userId": "myusername", "email":"my@email.com", "name": "New User"}'
 * ```
 *
 * Another example where request can fail if username already exists:
 * ```
 * curl -X POST \
 *   https://mock-apis-server.firebaseapp.com/register \
 *   -H 'Content-Type: application/json' \
 *   -d '{"userId": "taken", "email":"existing@email.com", "name": "Existing User"}'
 * ```
 */
app.post('/register', (req, res) => {
  console.log('Request Body Params: ', req.body);

   // Simulates username taken, if username is `taken`
   if(req.body.hasOwnProperty('userId') && req.body.userId === "taken") { //
     return res.status(400)
            .json(mockUser.registerFailedUsernameExists);
   }

  // Attach the request data to response
  var response = mockUser.registerSuccess
  response.requestData = req.body

  // Success - falls though for any other request data
  return res.status(200)
            .json(response);
});
/* [END `/register` ] */



/**
 * Simple request that extracts data from firebase firestore (database)
 * --------------------------------------------------------------------------------------
 * Try: https://mock-apis-server.firebaseapp.com/userProfile/bob
 */
app.get('/userProfile/:userId', (req, res) => {
  var docRef = firestore.collection("userProfiles").doc(req.params.userId);

  // See https://firebase.google.com/docs/firestore/query-data/get-data#get_a_document
  docRef.get().then((doc) => {
      if (doc.exists) {
          return res.status(200).json(doc.data());
      } else {
          return res.status(400).json({"message":"User ID not found."});
      }
  }).catch((error) => {
      return res.status(400).json({"message":"Unable to connect to Firestore."});
  });
});
/* [END `/userProfile` ] */




// [START export]
// Export the express app as an HTTP Cloud Functions as `api` function
exports.api = functions.https.onRequest(app);
// [END export]

'use strict';

// [START import]
const functions = require('firebase-functions');
const faker = require('faker'); // Generates meaningful fake data - https://www.npmjs.com/package/faker
const express = require('express');
const app = express();
// [END import]

// [START middleware]
const cors = require('cors')({origin: true});
app.use(cors);
// [END middleware]


//
// Loads mock data in local variable for easy access
// -----------------------------------------------------
const mockUser = require('./mock-responses/user');


/**
 * Say hello as response
 * ----------------------------------------
 * Try (refresh for new values): https://mock-apis-server.firebaseapp.com/say/hello
 */
app.get('/say/hello', (req, res) => {
   console.log('Request Query Params: ', req.query);

  // Success for any other query
  return res.status(200)
            .json({"message":"Hello there... Welcome to mock server."});
});
/* [END `/say/hello` ] */


/**
 * Provides user's information based on user ID
 * Captures dynamic params from URL (See https://expressjs.com/en/guide/routing.html)
 * ----------------------------------------
 * Try: https://mock-apis-server.firebaseapp.com/users/myid
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


// [START export]
// Export the express app as an HTTP Cloud Functions as `api` function
exports.api = functions.https.onRequest(app);
// [END export]
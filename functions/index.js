'use strict';

// [START import]
const functions = require('firebase-functions');
const express = require('express');
const app = express();
// [END import]

// [START middleware]
const cors = require('cors')({origin: true});
app.use(cors);
// [END middleware]


/**
 * Say hello as response
 * ----------------------------------------
 */
app.get('/say/hello', function(req, res) {
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
 */
app.get('/users/:userId', function (req, res) {
  console.log('Request Query Params: ', req.query);
  console.log('Request URL Params: ', req.params);

  if(!req.params.hasOwnProperty('userId')) {
    return res.status(400)
          .json({"message":"The `userId` is required."});
  }

  return res.status(200)
            .json({"userId": req.params.userId, "name": "Demo User"})
});
/* [END `/users/:userId` ] */


// [START export]
// Export the express app as an HTTP Cloud Functions as `api` function
exports.api = functions.https.onRequest(app);
// [END export]
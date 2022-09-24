const {google} = require('googleapis');
const {OAuth2} = google.auth;
require('dotenv').config()

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

// // const spreadsheets = google.sheets({
// //   //version: 'v3',
// //   auth: oauth2Client
// // });

// exports.spreadsheets = spreadsheets;
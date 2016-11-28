var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/coverLover.json
var SCOPES = ['https://www.googleapis.com/auth/documents',
              'https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'coverLover.json';

readSecrets()
  .then(authorize)
  .then(getDoc)
  .then(createDoc)
  .then(callAppsScript)
  .then(downloadLetter);
//TODO Add error handler

/**
 * Retriev client_secret.json file for use with OAuth client.
 */
function readSecrets(){
  return new Promise(function(resolve, reject){
    fs.readFile('client_secret.json', function (err, content) {
      if (err) {
        reject(Error("It broke readSecrets()"));
      }
      else {
        resolve(JSON.parse(content));
      }
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 */
function authorize(credentials) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  return new Promise(function(resolve, reject){
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        getNewToken(oauth2Client, callback);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        resolve(oauth2Client);
      }
    });
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Retrieve the document ID of the 'Generic Cover Letter' in Google Drive.
 * TODO: Make this more dynamic.
 * @param {Object} auth An authorized OAuth2 client.
 */
function getDoc(auth) {
  var service = google.drive('v3');
  return new Promise(function(resolve, reject){
    service.files.list({
      auth: auth,
      pageSize: 1,
      q: "name='Generic Cover Letter'",
      fields: 'files(id)'
    }, function(err, response) {
      if (err) {
        reject(Error("It broke in getDoc()"));
      }
      else{
        var files = response.files;
        if (files.length == 0) {
          console.log('No files found.');
        } else {
          resolve([auth, response.files[0].id]);
        }
      }
    });
  });
}

/**
 * Create a copy of the 'Generic Cover Letter' and return this
 * new document's ID.
 *
 * @param {Object} auth An authorized OAuth2 client.
 */
function createDoc(args){
  var service = google.drive('v3');
  return new Promise(function(resolve, reject){
    service.files.copy({
      auth: args[0],
      fileId: args[1]
    }, function(err, response) {
      if (err) {
        console.log(err);
        reject(Error("It broke in createDoc()"));
      }
      else{
        resolve([args[0], response.id]);
      }
    });
  });
}

/**
 * Call an Apps Script function to replace company name and position in cover letter.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function callAppsScript(args) {
  var scriptId = process.env.GOOGLE_SCRIPT_ID;
  var script = google.script('v1');

  return new Promise(function(resolve, reject){
    script.scripts.run({
      auth: args[0],
      resource: {
        function: 'findAndReplace',
        parameters: [
          documentID=args[1],
          companyName="TestCompany",
          companyPosition="TestPosition"
        ],
        devMode: true //TODO: Set to false after deploying newest version of App Script
      },
      scriptId: scriptId
    }, function(err, resp) {
      if (err) {
        // The API encountered a problem before the script started executing.
        console.log('The API returned an error: ' + err);
        reject(Error("It broke in callAppsScript()"));
      }
      if (resp.error) {
        // The API executed, but the script returned an error.

        // Extract the first (and only) set of error details. The values of this
        // object are the script's 'errorMessage' and 'errorType', and an array
        // of stack trace elements.
        var error = resp.error.details[0];
        console.log('Script error message: ' + error.errorMessage);
        
        if (error.scriptStackTraceElements) {
          console.log('Script error stacktrace:');
          // There may not be a stacktrace if the script didn't start executing.
          for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
            var trace = error.scriptStackTraceElements[i];
            console.log('\t%s: %s', trace.function, trace.lineNumber);
          }
        }
        reject(Error("It broke in callAppsScript()"));
      } else {
        resolve([args[0], args[1]])
      }
    });
  });
}

/**
 * Download the modified cover letter to local machine.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function downloadLetter(args){
  var dest = fs.createWriteStream('coverLetter.pdf'); //TODO: Dynamic PDF name. 
  var service = google.drive('v3');
  service.files.export({
    auth: args[0],
    fileId: args[1],
    mimeType: 'application/pdf'
  })
  .on('end', function() {
    console.log('Download Successful.');
  })
  .on('error', function(err) {
    console.log('Error during download', err);
  })
  .pipe(dest);
}
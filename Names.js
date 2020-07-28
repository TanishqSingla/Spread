const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const TOKEN_PATH = "token.json";

fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client file", err);

  authorize(JSON.parse(content), authorizedCallback);
});

//Credentials authorization
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  //checking for previous tokens
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorizing by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here:", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.log("Error while trying to retrieve access token", err);
      oAuth2Client.setCredentials(token);
      //store token to disk
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

let names = [];

//Function for getting data from spreadsheet
function authorizedCallback(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  const sheetId = "1HsKMv8JdOUUs_DkwqgAZgrg75fCf4vukmtVZrKNI7a4";
  const options = {
    spreadsheetId: sheetId,
    range: "A2:B",
  };
  sheets.spreadsheets.values.get(options, (err, res) => {
    if (err) return console.log("The API returned an error: " + err);
    const rows = res.data.values;
    names = rows.map((row) => {
      return row[1];
    });
  });
}

module.exports = {
  names,
};

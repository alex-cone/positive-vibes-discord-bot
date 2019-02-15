const { google } = require("googleapis");
const readline = require("readline");
const fs = require("fs");
// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";
let oAuth2Client;

// // Load client secrets from a local file.
// fs.readFile('credentials.json', (err, content) => {
//     if (err) return console.log('Error loading client secret file:', err);
//     // Authorize a client with credentials, then call the Google Sheets API.
//     creds = JSON.parse(content)
//     authorize(JSON.parse(content), listMacros);
// });

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(client_secret, client_id, redirect_uris, callback) {
  if (client_id && client_secret && redirect_uris) {
    oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client, function blah() {});
    });
  } else {
    console.log("Could not get Google Sheets secrets");
  }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function listMacros(auth, callback) {
  if (!auth) {
    auth = oAuth2Client;
  }
  const sheets = google.sheets({ version: "v4", auth });
  console.log("I am running through the spreadsheet");
  sheets.spreadsheets.values.get(
    {
      spreadsheetId: "1_R_0aujAdrKGl8NGwdG-3EORBRLwJuRmP5sVEy_whTU",
      range: "A2:C16"
    },
    (err, res) => {
      let macro = "";
      if (err) return console.log("The API returned an error: " + err);
      const rows = res.data.values;
      let jsonResult = {};
      let count = 1;
      if (rows.length) {
        rows.map(row => {
          let firstPerson = `${row[1]}`;
          let secondPerson = `${row[2]}`;
          let group = {
            one: firstPerson,
            two: secondPerson
          };
          if (`${row[0]}` == "L") {
            jsonResult["Left " + count] = group;
          } else if (`${row[0]}` == "R") {
            jsonResult["Right " + count] = group;
            count++;
          }
        });
      } else {
        console.log("No data found.");
      }
      for (let i = 1; i <= 5; i++) {
        //set up and slice string letiables
        let mainNameLeft = jsonResult["Left " + i]["two"];
        let mainNameRight = jsonResult["Right " + i]["two"];
        if (mainNameLeft.indexOf("(") > -1) {
          mainNameLeft = mainNameLeft.slice(
            0,
            mainNameLeft.indexOf(" ")
          );
        }
        if (mainNameRight.indexOf("(") > -1) {
          mainNameRight = mainNameRight.slice(
            0,
            mainNameRight.indexOf(" ")
          );
        }
        let next = i + 1;
        if (next == 6) {
          next = 1;
        }
        let turnNameLeft1 = jsonResult["Left " + next]["one"];
        if (turnNameLeft1.indexOf("(") > -1) {
          turnNameLeft1 = turnNameLeft1.slice( 
            0,
            turnNameLeft1.indexOf(" ")
          );
        }
        let turnNameLeft2 = jsonResult["Left " + next]["two"];
        if (turnNameLeft2.indexOf("(") > -1) {
          turnNameLeft2 = turnNameLeft2.slice(
            0,
            turnNameLeft2.indexOf(" ")
          );
        }
        let turnNameRight1 = jsonResult["Right " + next]["one"];
        if (turnNameRight1.indexOf("(") > -1) {
          turnNameRight1 = turnNameRight1.slice(
            0,
            turnNameRight1.indexOf(" ")
          );
        }
        let turnNameRight2 = jsonResult["Right " + next]["two"];
        if (turnNameRight2.indexOf("(") > -1) {
          turnNameRight2 = turnNameRight2.slice(
            0,
            turnNameRight2.indexOf(" ")
          );
        }

        //generate Left person macro
        macro = macro + mainNameLeft + "\n";
        if (turnNameLeft1.length > 1) {
          macro = macro + "/w " + turnNameLeft1 + " **YOUR TURN**\n";
        }
        if (turnNameLeft2.length > 1) {
          macro = macro + "/w " + turnNameLeft2 + " **YOUR TURN**\n";
        }
        macro = macro + "/w " + mainNameRight + " **PLACE ORB**\n\n";

        //generate Right person macro
        macro = macro + mainNameRight + "\n";
        if (turnNameRight1.length > 1) {
          macro = macro + "/w " + turnNameRight1 + " **YOUR TURN**\n";
        }
        if (turnNameRight2.length > 1) {
          macro = macro + "/w " + turnNameRight2 + " **YOUR TURN**\n";
        }
        macro = macro + "/w " + mainNameLeft + " **PLACE ORB**\n\n";
      }
      if (callback) {
        callback(macro);
      }
    }
  );
}

module.exports.authorize = authorize;
module.exports.listMacros = listMacros;

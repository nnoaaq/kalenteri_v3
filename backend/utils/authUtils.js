require("dotenv").config();
const { google } = require("googleapis");
function createAuthClient() {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
  );
  return oauth2Client;
}
async function getTokensFromSesion() {
  const tokensRes = await fetch("http://localhost:3000/authenticate/getTokens");
  if (!tokensRes) return;
  const tokens = await tokensRes.json();
  return tokens;
}
module.exports = { createAuthClient, getTokensFromSesion };

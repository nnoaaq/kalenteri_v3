require("dotenv").config();
const express = require("express");
const Router = express.Router();
const { createAuthClient } = require("../utils/authUtils");
Router.get("/createUrl", async (req, res) => {
  const authCLient = await createAuthClient();
  const authUrl = authCLient.generateAuthUrl({
    scope: "https://www.googleapis.com/auth/calendar.events",
  });
  res.send(authUrl);
});
Router.get("/success", async (req, res) => {
  const authorizationCode = req.query.code;
  if (!authorizationCode) return res.sendStatus(400); // Koodia ei löytynyt ???
  const authCLient = await createAuthClient();
  try {
    const { tokens } = await authCLient.getToken(authorizationCode);
    if (!tokens) return res.sendStatus(400); // Tokeneita ei tullut ???
    req.session.tokens = tokens; // Tokenit tallessa sessionissa
    res.redirect("/"); // Takaisin etusivulle
  } catch (err) {
    res.redirect(`/?error=tokens`);
  }
});
Router.get("/verifyTokensExists", (req, res) => {
  // Jos on, palautetaan. Jos ei, error.
  if (!req.session.tokens) return res.sendStatus(404);
  return res.sendStatus(200);
});
Router.get("/getTokens", (req, res) => {
  if (!req.session.tokens)
    return res.status(404).json({ errMessage: "Tokeneita ei löytynyt" });
  res.send(req.session.tokens);
});

module.exports = Router;

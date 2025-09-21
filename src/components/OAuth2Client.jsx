import express from "express";
import { google } from "googleapis";
import open from "open";
import dotenv from "dotenv";

dotenv.config();

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/oauth2callback";

export async function getOAuth2Client() {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  const app = express();

  // Promise resolves when OAuth code is received
  const codePromise = new Promise(resolve => {
    const server = app.listen(3000, () => console.log("Waiting for OAuth callback on http://localhost:3000"));

    app.get("/oauth2callback", (req, res) => {
      const code = req.query.code;
      res.send("Authorization successful! You can close this window.");

      resolve(code);     
      server.close();     
      console.log("OAuth server closed, port 3000 freed.");
    });
  });

  // Open Google consent page in browser
  await open(authUrl);

  // Wait for user to authorize and return code
  const code = await codePromise;

  // Exchange code for tokens
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  console.log("Access token obtained!");
  return oAuth2Client;
}




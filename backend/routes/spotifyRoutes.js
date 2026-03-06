import express from "express";
import axios from "axios";
import querystring from "querystring";

const router = express.Router();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

// STEP 1 — Redirect user to Spotify login
router.get("/login", (req, res) => {
  const scope =
    "user-read-private user-read-email user-top-read user-read-recently-played playlist-modify-public playlist-modify-private";

  const authURL =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id,
      scope,
      redirect_uri,
    });

  res.redirect(authURL);
});

// STEP 2 — Spotify sends code here
router.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code,
        redirect_uri,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(client_id + ":" + client_secret).toString("base64"),
        },
      }
    );

    const access_token = response.data.access_token;

    res.json({
      message: "Spotify login successful",
      access_token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

export default router;
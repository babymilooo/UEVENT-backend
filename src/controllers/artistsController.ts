
import express from "express";
import { errorMessageObj } from "../helpers/errorMessageObj";
import { handleSpotifyClientCredentials } from "../services/artistService";
import { spotifyApi } from "../config/spotifyConfig";

const artistRouter = express.Router();


artistRouter.get("/get-artist", async (req, res) => {
  try {
    const artistName = typeof req.query.artistName === 'string' ? req.query.artistName : null;
    if (!artistName) {
      return res.status(400).json(errorMessageObj("Artist name is not provided"));
    }

    const access_token = await handleSpotifyClientCredentials(spotifyApi);
    if (!access_token) 
      return res.status(500).json(errorMessageObj("Failed to retrieve access token"));

    const result = await spotifyApi.searchArtists(artistName as string);
    if (result.body && result.body.artists && result.body.artists.items) 
      res.json(result.body.artists.items);
    else res.status(404).json(errorMessageObj("Artists not found"));
  } catch (error) {
    console.error("Error searching for artist:", error);
    res.status(500).json(errorMessageObj("Error searching for artist"));
  }
});




export { artistRouter };

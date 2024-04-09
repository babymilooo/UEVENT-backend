import { errorMessageObj } from "../helpers/errorMessageObj";
import { Request, Response } from "express";
import { handleSpotifyClientCredentials, getAllFollowedArtists } from "../services/artistService";
import { spotifyApi } from "../config/spotifyConfig";

import { 
  updateAccessTokenForUser
} from "../services/tokenService";

export async function getAllArtists(req: Request, res: Response) {
  try {
    const artistName = typeof req.query.artistName === 'string' ? req.query.artistName : null;
    if (!artistName)
      return res.status(400).json(errorMessageObj("Artist name is not provided"));

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
};


export async function getAllFollowedArtistsSpotify(req: Request, res: Response) {
  try {
    let { access_token_spotify } = req.cookies;
    spotifyApi.setAccessToken(access_token_spotify);
    const artists = await getAllFollowedArtists(spotifyApi);
    res.status(200).json(artists);
  } catch (error) {
    const err = error as any;
    if (err.body && err.body.error && err.body.error.status === 401) {
      const userId = (req as any).userId as string; 
      try {
        await updateAccessTokenForUser(userId, spotifyApi, res);
        const artists = await getAllFollowedArtists(spotifyApi);
        res.status(200).json(artists);
      } catch (refreshError) {
        res.status(500).json(errorMessageObj("Failed to refresh access token"));
      }
    } else {
      res.status(500).json(errorMessageObj("Failed to fetch followed artists"));
    }
  }
};

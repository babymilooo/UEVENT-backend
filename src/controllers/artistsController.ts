import { errorMessageObj } from "../helpers/errorMessageObj";
import { Request, Response } from "express";
import {
  handleSpotifyClientCredentials,
  getAllFollowedArtists,
  isUserRegisteredThroughSpotify,
  addArtistToUser,
  checkIfUserFollowingArtist,
  handleFollowUnfollow,
  fetchArtistById,
  getFollowedArtistNotSpotify
} from "../services/artistService";
import { spotifyApi } from "../config/spotifyConfig";
import { updateAccessTokenForUser } from "../services/tokenService";

export async function getAllArtists(req: Request, res: Response) {
  try {
    const artistName =
      typeof req.query.artistName === "string" ? req.query.artistName : null;
    if (!artistName)
      return res
        .status(400)
        .json(errorMessageObj("Artist name is not provided"));

    const access_token = await handleSpotifyClientCredentials(spotifyApi);
    if (!access_token)
      return res
        .status(500)
        .json(errorMessageObj("Failed to retrieve access token"));

    const result = await spotifyApi.searchArtists(artistName as string);
    if (result.body && result.body.artists && result.body.artists.items)
      res.json(result.body.artists.items);
    else res.status(404).json(errorMessageObj("Artists not found"));
  } catch (error) {
    console.error("Error searching for artist:", error);
    res.status(500).json(errorMessageObj("Error searching for artist"));
  }
}

export async function getArtistById(req: Request, res: Response) {
  try {
    const artistId = req.params.artistId;
    if (!artistId)
      return res.status(400).json(errorMessageObj("Artist ID is not provided"));

    const result = await fetchArtistById(artistId);
    res.status(200).json(result);
    // if (result.body) res.status(200).json(result.body);
    // else res.status(404).json(errorMessageObj("Artist not found"));
  } catch (error) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("Error fetching artist by ID"));
  }
}



export async function getArtistTopTracks(req: Request, res: Response) {
  try {
    const artistId = req.params.artistId;
    const countryCode = typeof req.query.countryCode === 'string' ? req.query.countryCode : 'UA';
    
    if (!artistId)
      return res.status(400).json(errorMessageObj("Artist ID is not provided"));

    const access_token = await handleSpotifyClientCredentials(spotifyApi);
    if (!access_token)
      return res.status(500).json(errorMessageObj("Failed to retrieve access token"));

    spotifyApi.setAccessToken(access_token);

    const result = await spotifyApi.getArtistTopTracks(artistId, countryCode);
    if (result.body && result.body.tracks) res.status(200).json(result.body.tracks);
    else 
      res.status(404).json(errorMessageObj("Top tracks not found"));
  } catch (error) {
    res.status(500).json(errorMessageObj("Error fetching artist's top tracks by ID"));
  }
}



export async function getArtistsByIds(req: Request, res: Response) {
  try {
    const artistIds = req.body.artistIds;
    if (!artistIds || artistIds.length === 0)
      return res
        .status(400)
        .json(errorMessageObj("Artist IDs are not provided"));

    const access_token = await handleSpotifyClientCredentials(spotifyApi);
    if (!access_token)
      return res
        .status(500)
        .json(errorMessageObj("Failed to retrieve access token"));

    spotifyApi.setAccessToken(access_token);

    const result = await spotifyApi.getArtists(artistIds);
    if (result.body && result.body.artists)
      res.status(200).json(result.body.artists);
    else res.status(404).json(errorMessageObj("Artists not found"));
  } catch (error) {
    res.status(500).json(errorMessageObj("Error fetching artists by IDs"));
  }
}

export async function getRelatedArtist(req: Request, res: Response) {
  try {
    const artistId = req.params.artistId;
    if (!artistId) {
      return res.status(400).json(errorMessageObj('Artist ID is not provided'));
    }

    const access_token = await handleSpotifyClientCredentials(spotifyApi);
    if (!access_token)
      return res
        .status(500)
        .json(errorMessageObj("Failed to retrieve access token"));

    spotifyApi.setAccessToken(access_token);
    const relatedArtists = await spotifyApi.getArtistRelatedArtists(artistId);
    res.status(200).json(relatedArtists.body.artists);
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json(errorMessageObj('Error fetching related artists'));
  }
}

export async function getAllFollowedArtistsSpotify(
  req: Request,
  res: Response
) {
  try {
    const userId = (req as any).userId as string;
    const registeredThroughSpotify = await isUserRegisteredThroughSpotify(userId);
    if (!registeredThroughSpotify) {
      const artists = await getFollowedArtistNotSpotify(userId);
      return res.status(200).json(artists);
    }

    const { access_token_spotify } = req.cookies;
    spotifyApi.setAccessToken(access_token_spotify);
    const artists = await getAllFollowedArtists(spotifyApi);
    res.status(200).json(artists);
  } catch (error) {
    const userId = (req as any).userId as string;
    try {
      await updateAccessTokenForUser(userId, spotifyApi, res);
      const artists = await getAllFollowedArtists(spotifyApi);
      res.status(200).json(artists);
    } catch (refreshError) {
      res.status(500).json(errorMessageObj("Failed to refresh access token"));
    }
  }
}

export async function followArtist(
  req: Request,
  res: Response
) {
  const userId = (req as any).userId as string;
  const artistId = req.params.artistId;
  try {
    const registeredThroughSpotify = await isUserRegisteredThroughSpotify(userId);
    if (!registeredThroughSpotify) {
      await addArtistToUser(userId, artistId); 
      res.sendStatus(200);
      return;
    }
    const { access_token_spotify } = req.cookies;
    spotifyApi.setAccessToken(access_token_spotify);
    await handleFollowUnfollow(userId, artistId, spotifyApi, res);
    return;
  } catch (error) {
    if (await isUserRegisteredThroughSpotify(userId)) {
      try {
        const refreshed = await updateAccessTokenForUser(userId, spotifyApi, res);
        if (refreshed) {
          const { access_token_spotify } = req.cookies;
          spotifyApi.setAccessToken(access_token_spotify);
          await handleFollowUnfollow(userId, artistId, spotifyApi, res);
          return;
        } else 
          throw new Error('Token refresh failed');
      } catch (refreshError) {
        res.status(500).json(errorMessageObj("Failed to refresh access token"));
        return;
      } 
    }else {
      return; 
    }
  }
}

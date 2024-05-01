import { findUserById } from "./userService";
import { User } from "../models/user";

export async function handleSpotifyClientCredentials(spotifyApi: any) {
  const data = await spotifyApi.clientCredentialsGrant();
  const accessToken = data.body.access_token
  spotifyApi.setAccessToken(accessToken);
  return accessToken;
}

export async function getAllFollowedArtists(spotifyApi: any) {
  try {
    const artists = [];
    let data = await spotifyApi.getFollowedArtists({ limit: 50 });
    artists.push(...data.body.artists.items);
    while (data.body.artists.next) {
      data = await spotifyApi.getFollowedArtists({ limit: 50, after: data.body.artists.cursors.after });
      artists.push(...data.body.artists.items);
    }
    return artists;
  } catch (error) {

    throw new Error("Failed to fetch followed artists");
  }
}

export async function isUserRegisteredThroughSpotify(userId: string) {
  try {
    const user = await findUserById(userId);
    return user.isRegisteredViaSpotify;
  } catch (error) {
    return false;
  }
}


export async function addArtistToUser (userId: string, artistId: string)  {
  const user = await findUserById(userId);
  if (user && !user.isRegisteredViaSpotify) {
    user.artists = user.artists || [];
    if (user.artists && user.artists.includes(artistId)) {
      user.artists = user.artists.filter(id => id !== artistId);
      await user.save();
    } else {
      user.artists.push(artistId);
      await user.save();
    }
  }
};

export async function checkIfUserFollowingArtist(artistId: string, spotifyApi: any): Promise<boolean> {
  try {
    const response = await spotifyApi.isFollowingArtists([artistId]);
    return response.body[0];
  } catch (error) {
    return false;
  }
}

export async function handleFollowUnfollow(userId: string, artistId: string, spotifyApi: any, res: any) {
  const userAlreadyFollowing = await checkIfUserFollowingArtist(artistId, spotifyApi);

  if (userAlreadyFollowing)
    await spotifyApi.unfollowArtists([artistId]);
  else
    await spotifyApi.followArtists([artistId]);
  res.sendStatus(200);
}
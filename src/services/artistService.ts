export async function handleSpotifyClientCredentials(spotifyApi: any) {
  const data = await spotifyApi.clientCredentialsGrant();
  const accessToken = data.body.access_token
  spotifyApi.setAccessToken(accessToken);
  return accessToken;
}

export async function getAllFollowedArtists(spotifyApi: any) {
  try {
    let artists = [];
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

import "dotenv/config";

export async function handleSpotifyClientCredentials(spotifyApi: any) {
  const data = await spotifyApi.clientCredentialsGrant();
  const accessToken = data.body.access_token
  spotifyApi.setAccessToken(accessToken);
  return accessToken;
}

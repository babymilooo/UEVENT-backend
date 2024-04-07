import * as process from 'process';
import 'dotenv/config';
import SpotifyWebApi from 'spotify-web-api-node';

export const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_USERID || '',
  clientSecret: process.env.SPOTIFY_USER_SECRET || '',
  redirectUri: `${process.env.FRONTEND_URL}/callback` || ''
});


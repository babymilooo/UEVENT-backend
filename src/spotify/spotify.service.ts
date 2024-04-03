import { Injectable } from '@nestjs/common';
import 'dotenv/config';

const SPOTIFY_USERID = process.env.SPOTIFY_USERID;
const SPOTIFY_USER_SECRET = process.env.SPOTIFY_USER_SECRET;

@Injectable()
export class SpotifyService {
  getAccessToken() {
    return 'aifhafhdshfsakjfaf';
  }
}

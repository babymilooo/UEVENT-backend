export interface IUserDto {
  userName?: string;
  spotifyId?: string;
  email: string;
  password?: string;
  spotifyRefreshToken?: string;
  isRegisteredViaSpotify?: boolean;
}

export interface IUserUpdateDto {
  userName: string;
}

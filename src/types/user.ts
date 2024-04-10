export interface IUserDto {
  userName?: string;
  email: string;
  password: string;
  // spotifyId?: string;
  isRegisteredViaSpotify?: boolean;
  spotifyRefreshToken?: string;
  emailVerified?: boolean;
  role?: string;
  profilePicture?: string;
}

export interface IUserUpdateDto {
  userName?: string;
  passwordHash?: string;
  profilePicture?: string;
  role?: string;
}


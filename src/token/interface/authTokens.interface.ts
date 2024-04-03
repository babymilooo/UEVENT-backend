export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export enum ETokenType {
  Access,
  Refresh,
}

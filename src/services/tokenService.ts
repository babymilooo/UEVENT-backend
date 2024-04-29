import jwt from "jsonwebtoken";
import {
  httponlyCookiesOption,
  jwtAccessConfig,
  jwtPDFTicketQRCodeConfig,
  jwtPasswordResetConfig,
  jwtRefreshConfig,
  jwtVerificationConfig,
} from "../config/auth";
import { ETokenType, IAuthTokens } from "../types/token";
import { Response } from "express";
import { getRefreshTokenForUser } from "./userService";

export const invalidatedRefreshTokenSet = new Set();

export function invalidateRefreshToken(token: string) {
  return invalidatedRefreshTokenSet.add(token);
}

export function getConfig(type: ETokenType) {
  switch (type) {
    case ETokenType.Access:
      return jwtAccessConfig;
    case ETokenType.Refresh:
      return jwtRefreshConfig;
    case ETokenType.Verification:
      return jwtVerificationConfig;
    case ETokenType.PasswordReset:
      return jwtPasswordResetConfig;
    case ETokenType.QRCode:
      return jwtPDFTicketQRCodeConfig;
    default:
      throw new Error(`Wrong token type`);
  }
}

export async function signToken(
  type: ETokenType,
  payload: any
): Promise<string> {
  const config = getConfig(type);
  if (!config.secret) throw new Error("Token Secret not set");
  if (config.expiresIn) {
    return jwt.sign(payload, config.secret, { expiresIn: config.expiresIn });
  } else return jwt.sign(payload, config.secret);
}

export async function verifyToken(type: ETokenType, token: string) {
  if (type == ETokenType.Refresh && invalidatedRefreshTokenSet.has(token))
    throw new Error("Token is invalidated");
  const config = getConfig(type);
  if (!config.secret) throw new Error("Token Secret not set");
  const decoded = jwt.verify(token, config.secret);
  if (typeof decoded === "string")
    throw new Error("Unexpected token structure");
  return decoded;
}

export async function signAuthTokens(payload: any): Promise<IAuthTokens> {
  return {
    accessToken: await signToken(ETokenType.Access, {
      ...payload,
      timestamp: new Date().getTime(),
    }),
    refreshToken: await signToken(ETokenType.Refresh, {
      ...payload,
      timestamp: new Date().getTime(),
    }),
  };
}

export async function setAuthTokensToCookies(
  res: Response,
  tokens: IAuthTokens
): Promise<boolean> {
  res.cookie("refreshToken", tokens.refreshToken, httponlyCookiesOption);
  res.cookie("accessToken", tokens.accessToken, httponlyCookiesOption);

  return true;
}

export async function deleteAuthTokensFromCookies(
  res: Response
): Promise<boolean> {
  res.clearCookie("refreshToken", httponlyCookiesOption);
  res.clearCookie("accessToken", httponlyCookiesOption);
  res.clearCookie("access_token_spotify", httponlyCookiesOption);
  return true;
}

export async function setAuthTokens(res: Response, user: any) {
  const tokenPayload = {
    id: user._id,
    timestamp: new Date().getTime(),
  };
  const tokens = await signAuthTokens(tokenPayload);
  await setAuthTokensToCookies(res, tokens);
}

export async function setAccessToken(
  userId: string,
  refreshToken: string
): Promise<IAuthTokens> {
  const payload = {
    id: userId,
    timestamp: new Date().getTime(),
  };
  return {
    accessToken: await signToken(ETokenType.Access, payload),
    refreshToken: refreshToken,
  };
}

export async function refreshSpotifyAccessToken(
  spotifyApi: any,
  refreshToken: string
) {
  try {
    spotifyApi.setRefreshToken(refreshToken);
    const data = await spotifyApi.refreshAccessToken();
    const { access_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    return access_token;
  } catch (error) {
    throw new Error("Failed to refresh Spotify access token");
  }
}

export async function setAccessTokenSpotify(
  res: Response,
  access_token: string
) {
  res.cookie("access_token_spotify", access_token, httponlyCookiesOption);
}

export async function updateAccessTokenForUser(
  userId: string,
  spotifyApi: any,
  res: Response
) {
  try {
    const refreshToken = await getRefreshTokenForUser(userId);
    if (!refreshToken) throw new Error("Refresh token not found");

    const newAccessToken = await refreshSpotifyAccessToken(
      spotifyApi,
      refreshToken
    );
    if (!newAccessToken) throw new Error("Failed to refresh access token");

    await setAccessTokenSpotify(res, newAccessToken);

    return newAccessToken;
  } catch (error) {
    throw new Error("Failed to refresh Spotify access token");
  }
}

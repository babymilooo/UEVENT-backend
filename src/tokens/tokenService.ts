import jwt from "jsonwebtoken";
import {
  httponlyCookiesOption,
  jwtAccessConfig,
  jwtRefreshConfig,
} from "../config/auth";
import { ETokenType, IAuthTokens } from "../types/token";
import { Response } from "express";

export function getConfig(type: ETokenType) {
  switch (type) {
    case ETokenType.Access:
      return jwtAccessConfig;
    case ETokenType.Refresh:
      return jwtRefreshConfig;
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
  return jwt.sign(payload, config.secret, { expiresIn: config.expiresIn });
}

export async function verifyToken(type: ETokenType, token: string) {
  const config = getConfig(type);
  if (!config.secret) throw new Error("Token Secret not set");
  const decoded = jwt.verify(token, config.secret);
  if (typeof decoded === "string")
    throw new Error("Unexpected token structure");
  return decoded;
}

export async function signAuthTokens(payload: any): Promise<IAuthTokens> {
  return {
    accessToken: await signToken(ETokenType.Access, payload),
    refreshToken: await signToken(ETokenType.Refresh, payload),
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

  return true;
}

export async function setAuthTokens(res: Response, user: any) {
  const tokenPayload = {
    id: user._id,
    timestamp: new Date().toISOString(),
  };
  const tokens = await signAuthTokens(tokenPayload);
  await setAuthTokensToCookies(res, tokens);
}

export async function setAccessToken(user: any, refreshToken: string): Promise<IAuthTokens> {
  const payload = {
    id: user._id,
    timestamp: new Date().toISOString(),
  };
  return {
    accessToken: await signToken(ETokenType.Access, payload),
    refreshToken: refreshToken,
  };
}
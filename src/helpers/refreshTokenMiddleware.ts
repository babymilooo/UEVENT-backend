import { Request, Response, NextFunction } from "express";
import { 
  setAccessToken, 
  setAuthTokensToCookies, 
  updateAccessTokenForUser 
} from "../services/tokenService";
import { errorMessageObj } from "./errorMessageObj";


export async function refreshTokenMiddleware(
  req: Request | any, 
  res: Response, 
  next: NextFunction
) {
  try {
    const userId = (req as any).userId as string; 
    const refreshToken = (req as any).tokens.refreshToken as string; 
    const tokens = await setAccessToken(userId, refreshToken);
    await setAuthTokensToCookies(res, tokens);

    //await updateAccessTokenForUser(userId, spotifyApi, res);

    req.userId = userId;
    next();
  } catch (error) {
    return res.status(500).json(errorMessageObj("Failed to generate new access token"));
  }
}

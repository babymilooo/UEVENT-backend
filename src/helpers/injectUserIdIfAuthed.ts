import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/tokenService";
import { ETokenType } from "../types/token";
import { extractTokens } from "./extractTokens";


export async function injectUserIdIfAuthed(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    const tokens = extractTokens(req, 2);
    if (!tokens) return next();
    const jwtData: any = await verifyToken(
      ETokenType.Access,
      tokens.accessToken
    );
    req.userId = jwtData.id;
    req.tokens = tokens;
    return next();
  } catch (error) {
    return next();
  }
}

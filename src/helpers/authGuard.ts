import { NextFunction, Request, Response } from "express";
import { extractTokens } from "./extractTokens";
import { errorMessageObj } from "./errorMessageObj";
import { verifyToken } from "../services/tokenService";
import { ETokenType } from "../types/token";


export async function authGuard(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    const tokens = extractTokens(req);
    if (!tokens) return res.status(401).json(errorMessageObj("Not Authorized"));
    const jwtData: any = await verifyToken(
      ETokenType.Access,
      tokens.accessToken
    );
    req.userId = jwtData.id;
    req.tokens = tokens;
    next();
  } catch (error) {
    return res.status(401).json(errorMessageObj("Not Authorized"));
  }
}

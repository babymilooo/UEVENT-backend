import { Request, Response, NextFunction } from "express";
import { extractTokens } from "./extractTokens";
import { verifyToken } from "../services/tokenService"; 
import { ETokenType } from "../types/token";
import { errorMessageObj } from "./errorMessageObj";
import { isUserAdmin } from "../services/userService";

export async function adminAuthGuard(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    const tokens = extractTokens(req, 2);
    if (!tokens) return res.status(401).json(errorMessageObj("Not Authorized"));

    const jwtData: any = await verifyToken(
      ETokenType.Access,
      tokens.accessToken
    );

    const userId = jwtData.id;
    const userData = await isUserAdmin(userId)
    if (!userData)
      return res.status(403).json(errorMessageObj("Access Denied: Admin only"));

    req.userId = userId;
    req.tokens = tokens;
    next();
  } catch (error) {
    return res.status(401).json(errorMessageObj("Not Authorized"));
  }
}

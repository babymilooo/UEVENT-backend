import { Request } from "express";
import { IAuthTokens } from "../types/token";

export const extractTokens = (request: Request): IAuthTokens | null => {
  // Extract the token from the request, you might need to adjust this based on your setup (e.g., from headers, cookies, etc.)
  const accessToken = request.cookies.accessToken;
  const refreshToken = request.cookies.refreshToken;
    
  if (!accessToken || !refreshToken)  
    return null;

  return { accessToken, refreshToken };
};

import { Request } from "express";
import { IAuthTokens } from "../types/token";

export const extractTokens = (request: Request, code: number): IAuthTokens | null => {
  // Extract the token from the request, you might need to adjust this based on your setup (e.g., from headers, cookies, etc.)
  const accessToken = request.cookies.accessToken;
  const refreshToken = request.cookies.refreshToken;
  
  if ((code === 1 && !refreshToken) ||
      code === 2 && (!accessToken || !refreshToken)) 
      return null;

  return { accessToken, refreshToken };
};

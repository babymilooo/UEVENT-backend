import express from "express";
import { 
  login, 
  loginViaSpotify, 
  register, 
  confirmOfAccessToSpotify,
  logout, 
  refreshAccessToken
 } from "../controllers/authController";
import { authGuard } from "../helpers/authGuard";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.get("/spotify-auth", loginViaSpotify);
authRouter.get("/callback", confirmOfAccessToSpotify);
authRouter.post("/logout", authGuard, logout);
authRouter.post("/register", register);
authRouter.post("/refreshToken", refreshAccessToken);

export { authRouter};

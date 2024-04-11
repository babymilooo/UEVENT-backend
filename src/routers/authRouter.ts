import express from "express";
import { 
  login, 
  loginViaSpotify, 
  register, 
  confirmOfAccessToSpotify,
  logout, 
  refreshAccessToken,
  verificateEmail,
  sendPasswordResetEmailController,
  resetPasswordController,
  sendVerificationEmailController
 } from "../controllers/authController";
import { authGuard } from "../helpers/authGuard";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.get("/spotify-auth", loginViaSpotify);
authRouter.get("/callback", confirmOfAccessToSpotify);
authRouter.post("/logout", authGuard, logout);
authRouter.post("/register", register);
authRouter.post("/refreshToken", refreshAccessToken);
authRouter.get("/verify-email/:token", verificateEmail);
authRouter.post("/verify-email/send-email", sendVerificationEmailController);
authRouter.post("/password-reset/send-email", sendPasswordResetEmailController);
authRouter.post("/password-reset/:token", resetPasswordController);

export { authRouter};

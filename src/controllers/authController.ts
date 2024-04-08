import * as bcrypt from "bcrypt";
import express from "express";
import { authGuard } from "../helpers/authGuard";
import { errorMessageObj } from "../helpers/errorMessageObj";
import {
  deleteAuthTokensFromCookies,
  setAuthTokensToCookies,
  signAuthTokens,
  setAuthTokens,
  verifyToken,
  setAccessToken
} from "../tokens/tokenService";
import { ILoginDto, IRegisterDto } from "../types/auth";
import { createUser, findUserByEmail, 
        handleSpotifyAuthorization, findOrCreateUser,
        findUserById } from "../services/userService";
import { spotifyApi } from "../config/spotifyConfig";
import { ETokenType } from "../types/token";

const authRouter = express.Router();


authRouter.post("/login", async (req, res) => {
  try {
    const loginInfo: ILoginDto = req.body;
    // console.log(loginInfo);

    const user = await findUserByEmail(loginInfo.email);

    if (!user) return res.status(404).json(errorMessageObj("User not found"));

    if (typeof user.passwordHash !== "string" || typeof loginInfo.password !== "string")
      return res.status(400).json(errorMessageObj("Email and password are required"));

    if (!bcrypt.compareSync(loginInfo.password, user.passwordHash))
      return res.status(403).json(errorMessageObj("Invalid password"));

    // const tokenPayload = {
    //   id: user._id,
    //   timestamp: new Date().toISOString(),
    // };

    // const tokens = await signAuthTokens(tokenPayload);
    // await setAuthTokensToCookies(res, tokens);
    await setAuthTokens(res, user);

    const returnObj: any = user.toObject();
    delete returnObj.passwordHash;
    return res.status(200).json(returnObj);
  } catch (error) {
    console.error(error);
    return res.status(400).json(errorMessageObj("Invalid data"));
  }
});



authRouter.get("/spotify-auth", (req, res) => {
  const scopes = ["user-read-private", "user-read-email"];
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  res.send(spotifyApi.createAuthorizeURL(scopes, state));
});

authRouter.get("/callback", async (req, res) => {
  try {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    if (!code) return res.status(400).json(errorMessageObj("Invalid request"));

    const { refresh_token, access_token } = await handleSpotifyAuthorization(spotifyApi, code);

    const me = await spotifyApi.getMe();
    const { email, id } = me.body;

    let user = await findOrCreateUser(spotifyApi, email, id, refresh_token);

    await setAuthTokens(res, user);

    const returnObj: any = user.toObject();
    delete returnObj.passwordHash || '';
    return res.status(200).json(returnObj);

  } catch (error) {
    console.error("Callback processing error:", error);
    return res.status(400).json(errorMessageObj("Invalid data"));
  }
});


authRouter.post("/logout", authGuard, async (req, res) => {
  await deleteAuthTokensFromCookies(res);
  return res.sendStatus(200);
});

authRouter.post("/register", async (req, res) => {
  try {
    const registerInfo: IRegisterDto = req.body;
    await createUser(registerInfo);
    return res.sendStatus(201);
  } catch (error) {
    return res
      .status(409)
      .json(errorMessageObj("User with this email already exists"));
  }
});

authRouter.post("/refreshToken", async (req, res) => {
  try {
    const { refreshToken } = req.cookies; 
    if (!refreshToken) return res.status(400).json(errorMessageObj("No refresh token providedt"));

    const decoded = await verifyToken(ETokenType.Refresh, refreshToken);
    if (!decoded) return res.status(400).json(errorMessageObj("Invalid refresh token"));

    const user = await findUserById(decoded.id);
    if (!user) return res.status(403).json(errorMessageObj("User not found"));

    const tokens = await setAccessToken(user, refreshToken);
    await setAuthTokensToCookies(res, tokens);
    res.status(200).send();
  } catch (error) {
    console.error("Refresh Token error:", error);
    return res.status(400).json(errorMessageObj("Invalid data"));
  }
});

export { authRouter };

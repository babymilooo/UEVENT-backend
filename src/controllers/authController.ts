import * as bcrypt from "bcrypt";
import express from "express";
import { authGuard } from "../helpers/authGuard";
import { errorMessageObj } from "../helpers/errorMessageObj";
import {
  deleteAuthTokensFromCookies,
  setAuthTokensToCookies,
  signAuthTokens,
} from "../tokens/tokenService";
import { ILoginDto, IRegisterDto } from "../types/auth";
import { createUser, findUserByEmail } from "../user/userService";
import { spotifyApi } from "../config/spotifyConfig";

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

    const tokenPayload = {
      id: user._id,
      timestamp: new Date().toISOString(),
    };

    const tokens = await signAuthTokens(tokenPayload);
    await setAuthTokensToCookies(res, tokens);
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
    console.log("1111111");
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const state = typeof req.query.state === "string" ? req.query.state : null;
    console.log(code);
    if (!code) return res.status(400).json(errorMessageObj("Invalid request"));

    const data: any = await spotifyApi.authorizationCodeGrant(code);
    console.log(data);
    const refreshToken = data.body.refresh_token;
    console.log(refreshToken);
    spotifyApi.setAccessToken(data.body.access_token);
    spotifyApi.setRefreshToken(refreshToken);

    const me = await spotifyApi.getMe();
    const { email, id } = me.body;

    let user = await findUserByEmail(email);

    if (!user) {
      console.log("===========");
      user = await createUser({ email, spotifyId: id, spotifyRefreshToken: refreshToken, isRegisteredViaSpotify: true });
    } else {
      const userRefreshToken = user.spotifyRefreshToken;
      if (userRefreshToken) {
        spotifyApi.setRefreshToken(userRefreshToken);
        const refreshedData: any = await spotifyApi.refreshAccessToken();
        const refreshedAccessToken = refreshedData.body.access_token;
        spotifyApi.setAccessToken(refreshedAccessToken);
      }
    }

    const tokenPayload = {
      id: user._id,
      timestamp: new Date().toISOString(),
    };

    const tokens = await signAuthTokens(tokenPayload);
    await setAuthTokensToCookies(res, tokens);
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

authRouter.post("/refreshToken", async (req, res) => { });

export { authRouter };

import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import { errorMessageObj } from "../helpers/errorMessageObj";
import { extractTokens } from "../helpers/extractTokens";
import {
  deleteAuthTokensFromCookies,
  setAuthTokensToCookies,
  setAuthTokens,
  verifyToken,
  setAccessToken,
  setAccessTokenSpotify,
  updateAccessTokenForUser
} from "../services/tokenService";
import { ILoginDto, IRegisterDto } from "../types/auth";
import { 
  createUser,
  findUserByEmail, 
  handleSpotifyAuthorization, 
  findOrCreateUser,
  findUserById, 
  removeSensitiveData 
} from "../services/userService";
import { spotifyApi } from "../config/spotifyConfig";
import { ETokenType } from "../types/token";


export async function login(req: Request, res: Response) {
  try {
    const loginInfo: ILoginDto = req.body;

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
    return res.status(200).json(await removeSensitiveData(user));
  } catch (error) {
    return res.status(400).json(errorMessageObj("Invalid data"));
  }
}



export async function loginViaSpotify(req: Request, res: Response) {
  const scopes = [
    "user-read-private", 
    "user-read-email",
    "user-follow-read", 
    "user-follow-modify"
  ];
  const state = typeof req.query.state === 'string' ? req.query.state : 'Queen of Tears';
  res.send(spotifyApi.createAuthorizeURL(scopes, state));
}

export async function confirmOfAccessToSpotify(req: Request, res: Response) {
  try {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    if (!code) return res.status(400).json(errorMessageObj("Invalid request"));

    const { refresh_token, access_token } = await handleSpotifyAuthorization(spotifyApi, code);
    const me = await spotifyApi.getMe();
    let user = await findOrCreateUser(spotifyApi, me.body, refresh_token);

    await setAuthTokens(res, user);
    await setAccessTokenSpotify(res, access_token);
    return res.status(200).json(await removeSensitiveData(user));
  } catch (error) {
    console.error(error);
    return res.status(400).json(errorMessageObj("Invalid data"));
  }
}


export async function logout(req: Request, res: Response) {
  await deleteAuthTokensFromCookies(res);
  return res.sendStatus(200);
}

export async function register(req: Request, res: Response) {
  try {
    const registerInfo: IRegisterDto = req.body;
    await createUser(registerInfo);
    return res.sendStatus(201);
  } catch (error) {
    return res
      .status(409)
      .json(errorMessageObj("User with this email already exists"));
  }
};

export async function refreshAccessToken(req: Request, res: Response){
  try {
    const inputTokens = extractTokens(req);
    if (!inputTokens) return res.status(401).json(errorMessageObj("Not Authorized"));

    const decoded = await verifyToken(ETokenType.Refresh, inputTokens.refreshToken);
    const user = await findUserById(decoded.id);

    await updateAccessTokenForUser(user.id, spotifyApi, res);

    const tokens = await setAccessToken(user.id, inputTokens.refreshToken);
    await setAuthTokensToCookies(res, tokens);
    return res.status(200).json(await removeSensitiveData(user));
  } catch (error) {
    return res.status(400).json(errorMessageObj("Invalid data"));
  }
}


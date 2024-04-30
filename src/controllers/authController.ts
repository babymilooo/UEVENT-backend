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
  updateAccessTokenForUser,
  invalidateRefreshToken,
  invalidatedRefreshTokenSet,
} from "../services/tokenService";
import { ILoginDto, IRegisterDto } from "../types/auth";
import {
  createUser,
  findUserByEmail,
  handleSpotifyAuthorization,
  findOrCreateUser,
  findUserById,
  removeSensitiveData,
  createHashPassword,
} from "../services/userService";
import { spotifyApi } from "../config/spotifyConfig";
import { ETokenType, IAuthTokens } from "../types/token";
import { User } from "../models/user";
import "dotenv/config";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../services/emailService";
import { JwtPayload } from "jsonwebtoken";
import { generateAvatarPath } from "../services/userService";

const FRONTEND_URL = process.env.FRONTEND_URL;

export async function login(req: Request, res: Response) {
  try {
    const loginInfo: ILoginDto = req.body;

    const user = await findUserByEmail(loginInfo.email);

    if (!user) return res.status(404).json(errorMessageObj("User not found"));

    if (
      typeof user.passwordHash !== "string" ||
      typeof loginInfo.password !== "string"
    )
      return res
        .status(400)
        .json(errorMessageObj("Email and password are required"));

    if (!bcrypt.compareSync(loginInfo.password, user.passwordHash))
      return res
        .status(403)
        .json(errorMessageObj("Email or password is invalid"));

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
}

export async function loginViaSpotify(req: Request, res: Response) {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-follow-read",
    "user-follow-modify",
  ];
  const state =
    typeof req.query.state === "string" ? req.query.state : "Queen of Tears";
  res.send(spotifyApi.createAuthorizeURL(scopes, state));
}

export async function confirmOfAccessToSpotify(req: Request, res: Response) {
  try {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    if (!code) return res.status(400).json(errorMessageObj("Invalid request"));

    const { refresh_token, access_token } = await handleSpotifyAuthorization(
      spotifyApi,
      code
    );
    const me = await spotifyApi.getMe();
    const user = await findOrCreateUser(spotifyApi, me.body, refresh_token);

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
  invalidateRefreshToken((req as Request & { tokens:IAuthTokens }).tokens.refreshToken);
  return res.sendStatus(200);
}

export async function refreshAccessToken(req: Request, res: Response) {
  try {
    // console.log(invalidatedRefreshTokenSet);
    
    const inputTokens = extractTokens(req, 1);
    if (!inputTokens) return res.status(401).json(errorMessageObj("Not Authorized"));
    // console.log(inputTokens);
    let decoded = null;
    try {
      decoded = await verifyToken(
        ETokenType.Refresh,
        inputTokens.refreshToken
      );
    } catch (error) {
      return res.status(401).json(errorMessageObj("Could not verify Token"));
    }
    
    const user = await findUserById(decoded.id);
    if (user.isRegisteredViaSpotify)
      await updateAccessTokenForUser(user.id, spotifyApi, res);

    const tokens = await setAccessToken(user.id, inputTokens.refreshToken);
    await setAuthTokensToCookies(res, tokens);
    // await setAuthTokens(res, user);
    return res.status(200).json(await removeSensitiveData(user));
    
  } catch (error) {
    return res.status(400).json(errorMessageObj("Invalid data"));
  }
}

export async function sendVerificationEmailController(
  req: Request,
  res: Response
) {
  try {
    const { email } = req.body;
    // console.log(req.body);

    if (!email)
      return res.status(400).json(errorMessageObj("Email is required"));

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json(errorMessageObj("User not found"));
    await sendVerificationEmail(user);
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.status(500).json(errorMessageObj("Error"));
  }
}

export async function verificateEmail(req: Request, res: Response) {
  try {
    const { token } = req.params;
    if (!token)
      return res.status(400).json(errorMessageObj("Token is required"));

    let data: JwtPayload = {};
    try {
      data = await verifyToken(ETokenType.Verification, token);
    } catch (error) {
      return res.status(403).json(errorMessageObj("Invalid token"));
    }

    const { _id } = data;
    const user = await User.findById(_id);
    if (!user) throw new Error("User not found");
    user.emailVerified = true;
    await user.save();
    return res.redirect(`${FRONTEND_URL}/verify-email`);
  } catch (error) {
    console.error(error);
    return res.status(404).json(errorMessageObj("User not found"));
  }
}

export async function sendPasswordResetEmailController(
  req: Request,
  res: Response
) {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json(errorMessageObj("Email is required"));
    sendPasswordResetEmail(email);
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.sendStatus(200);
  }
}

export async function resetPasswordController(req: Request, res: Response) {
  try {
    const { password } = req.body;
    const { token } = req.params;
    if (!token)
      return res.status(400).json(errorMessageObj("Token is required"));
    if (!password)
      return res.status(400).json(errorMessageObj("Password is required"));
    let data: JwtPayload = {};
    try {
      data = await verifyToken(ETokenType.PasswordReset, token);
    } catch (error) {
      return res.status(403).json(errorMessageObj("Invalid token"));
    }

    const { _id, passwordHash } = data;
    const user = await findUserById(_id);
    if (!user) return res.status(404).json(errorMessageObj("User not found"));
    if (user.passwordHash != passwordHash)
      return res.status(403).json(errorMessageObj("Token is already used"));

    user.passwordHash = await createHashPassword(password);
    await user.save();
    return res.sendStatus(200);
  } catch (error: any) {
    console.error(error);
    return res.status(403).json(errorMessageObj(error.message || "Forbidden"));
  }
}

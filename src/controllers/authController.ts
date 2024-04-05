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

const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  try {
    const loginInfo: ILoginDto = req.body;
    // console.log(loginInfo);

    const user = await findUserByEmail(loginInfo.email);

    if (!user) return res.status(404).json(errorMessageObj("User not found"));

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

authRouter.post("/logout", authGuard, async (req, res) => {
  await deleteAuthTokensFromCookies(res);
  return res.sendStatus(200);
});

authRouter.post("/register", async (req, res) => {
  const registerInfo: IRegisterDto = req.body;
  await createUser(registerInfo);
  return res.sendStatus(201);
});

authRouter.post("/refreshToken", async (req, res) => { });

export { authRouter };

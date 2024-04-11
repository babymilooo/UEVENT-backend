import { Options } from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  GMAIL_USERNAME,
  emailTransport,
  passwordChangeEmail,
  verificationEmail,
} from "../config/emailConfig";
import { IUser } from "../models/user";
import { signToken } from "./tokenService";
import { ETokenType } from "../types/token";
import { findUserByEmail } from "./userService";

export async function sendMail(
  mailOptions: Options
): Promise<SMTPTransport.SentMessageInfo> {
  return await emailTransport.sendMail(mailOptions);
}

export async function sendVerificationEmail(user: IUser) {
  const { _id, email, emailVerified } = user;
  if (emailVerified) return;
  const token = await signToken(ETokenType.Verification, { _id });
  const emailHtml = verificationEmail(
    `/auth/verify-email/${encodeURIComponent(token)}`
  );
  const opts: Options = {
    to: email,
    from: GMAIL_USERNAME,
    html: emailHtml,
    subject: "UEvent Music Email Verification",
  };
  return await sendMail(opts);
}

export async function sendPasswordResetEmail(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");
  const token = await signToken(ETokenType.PasswordReset, { _id: user._id, passwordHash: user.passwordHash });
  const emailHtml = passwordChangeEmail(`/password-reset/${encodeURIComponent(token)}`);
  const opts: Options = {
    to: user.email,
    from: GMAIL_USERNAME,
    html: emailHtml,
    subject: "UEvent Music Password Reset",
  };
  return await sendMail(opts);
}

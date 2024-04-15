import { Options } from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  GMAIL_USERNAME,
  emailTransport,
  organisationVerifiedEmail,
  passwordChangeEmail,
  requestOrganisationVerificationEmail,
  verificationEmail,
} from "../config/emailConfig";
import { IUser } from "../models/user";
import { signToken } from "./tokenService";
import { ETokenType } from "../types/token";
import { findAllAdmins, findUserByEmail, findUserById } from "./userService";
import { IOrganization } from "../models/organizations";

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

export async function sendRequestOrgVerificationEmail(org: IOrganization) {
  const admins = await findAllAdmins();
  const adminEmails = admins.map(admin => admin.email);
  if (adminEmails.length === 0) return;
  const emailHtml = requestOrganisationVerificationEmail(org);
  const opts: Options = {
    to: adminEmails,
    from: GMAIL_USERNAME,
    html: emailHtml,
    subject: `Org Verification ${org.name}`,
  };
  return await sendMail(opts);
}

export async function sendOrganisationVerifiedEmail(org: IOrganization) {
  let organiser: IUser | null = null;
  if (!org.populated('createdBy')) organiser = await findUserById(org.createdBy);
  // Typescript magic
  else organiser = org.createdBy as unknown as IUser;

  const emailHtml = organisationVerifiedEmail(org);
  const opts: Options = {
    to: organiser.email,
    from: GMAIL_USERNAME,
    html: emailHtml,
    subject: `Your Organisation ${org.name} has been verified`,
  };
  return await sendMail(opts);
  
}

import { createTransport } from "nodemailer";
import { IEvent } from "../models/events";
import { IOrganization } from "../models/organizations";
import { ITicket } from "../models/tickets";
import { findEventById } from "../services/eventsService";
import { signToken } from "../services/tokenService";
import { ETokenType } from "../types/token";

import path from "path";
import puppeteer from "puppeteer";
import * as QRCode from "qrcode";

export const GMAIL_USERNAME = process.env.GMAIL_USERNAME;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const BACKEND_URL = process.env.BACKEND_URL;

export const puppeteerBrowserPromise = puppeteer.launch();

export const emailTransport = createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USERNAME,
    pass: GMAIL_APP_PASSWORD,
  },
});

export function verificationEmail(backendRoute: string): string {
  return `
Thank you for choosing UEVENT Music! 
<br/>
To complete your registration you have to click on the following link:
<br/>
<a href="${BACKEND_URL + backendRoute}">${BACKEND_URL + backendRoute}</a>
<br/>
    `;
}

export function passwordChangeEmail(frontendRoute: string): string {
  return `
To restore access to your account click on the following link:
<br/>
<a href="${FRONTEND_URL + frontendRoute}">${FRONTEND_URL + frontendRoute}</a>
<br/>
This link is only usable for one hour.
<br/>
If you did not try to change your password - contact our support at support@uevent.music immediately!
    `;
}

export function requestOrganisationVerificationEmail(
  org: IOrganization
): string {
  return `
    Organisation ${org.name}(${org._id}) asks for verification.
    <br/>
    To verify this organisation click on the following link:
    <br/>
    <a href="${
      FRONTEND_URL +
      "/organisation/verify-organisation/" +
      encodeURIComponent(org._id)
    }">${
    FRONTEND_URL +
    "/organisation/verify-organisation/" +
    encodeURIComponent(org._id)
  }</a>
    <br/>
    Upon verification the organisation owner will receive a notification about it.
  `;
}

export function eventReminderEmail(event: IEvent):string {
  return `
  Hey! The Event ${event.name} starts tomorrow!
  <br/>
  Don't forget to come in time!
  <br/>
  Yours UCODE MUSIC
  `
}

export function organisationVerifiedEmail(org: IOrganization): string {
  return `
  Congratulations! Your organisation ${org.name} has been verified by one of our admins.
  <br/>
  Now you have the full access to your organisation actions.
  `;
}

export function ticketEmail(): string {
  return `
  Thank you for buying a ticket at UCODE MUSIC!
  <br/>
  Your ticket is attached to this email as PDF file.
  `;
}

export async function ticketHtml(ticket: ITicket): Promise<string> {
  let event: IEvent | null = null;
  if (ticket.populated("event")) event = ticket.event as unknown as IEvent;
  else event = await findEventById(ticket.event);
  const ticketToken = await signToken(ETokenType.QRCode, { _id: ticket._id });
  const qrSvg = await QRCode.toString(ticketToken, {
    type: "svg",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket</title>
</head>
<body>
  <h2 style="text-align: center;">Ticket to ${event?.name}</h2>
  <div style="display: block; width: 200px; height: 200px;">${qrSvg}</div>
  <p>
    Event Name: ${event?.name}
    <br/>
    Event Date: ${event?.date.toString()}
    <br/>
    Ticket Price: ${ticket.price / 100}$
    <br/>
    Owner Name: ${ticket.ownerName}
    <br/>
  </p>
</body>
</html>
  `;
}

export async function htmlToTicket(
  html: string,
  filename: string,
  callback: (absPath: string) => void
) {
  const browser = await puppeteerBrowserPromise;
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({
    path: "./ticketPDFs/" + filename,
    format: "A4",
  });
  const absPath = path.resolve("./ticketPDFs/" + filename);
  callback(absPath);
}

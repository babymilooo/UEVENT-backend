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
import { ITicketOption } from "../models/ticketOptions";
import { findTicketOption } from "../services/ticketOptionService";

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
      "/organizations/" +
      encodeURIComponent(org._id) + "/verify-organization"
    }">${
      FRONTEND_URL +
      "/organizations/" +
      encodeURIComponent(org._id) + "/verify-organization"
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
  let ticketOption: ITicketOption | null = null;
  if (ticket.populated("ticketOption")) ticketOption = ticket.ticketOption as unknown as ITicketOption;
  else ticketOption = await findTicketOption(ticket.ticketOption);
  const ticketToken = await signToken(ETokenType.QRCode, { _id: ticket._id });
  const qrSvg = await QRCode.toString(ticketToken, {
    type: "svg",
  });

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ticket</title>
    <style>
      * {
        font-family: Helvetica, sans-serif;
      }
      .container {
        display: flex;
        flex-direction: row;
        justify-content: baseline;
        gap: 10px;
        padding: 10px;
      }
      table {
        font-size: larger;
        width: 600px;
        border-radius: 20px;
        border: 2px greenyellow solid;
        padding: 5px;
      }
      td:last-child {
        border-bottom: 2px greenyellow solid;
      }
    </style>
  </head>
  <body>
    <!-- template for easier code writing -->
    <h1 style="text-align: center">UEVENT MUSIC</h2>
    <h2 style="text-align: center">Ticket to ${event?.name}</h2>
    <div class="container">
      <svg
        style="
          display: block;
          width: 200px;
          height: 200px;
          background-color: blue;
        "
      >
        ${qrSvg}
      </svg>
      <table>
        <tr>
          <td>Event Name: ${event?.name}</td>
        </tr>
        <tr>
          <td>Event Date: ${event?.date.toString()}</td>
        </tr>
        <tr>
          <td>Ticket Type: ${ticketOption?.name}</td>
        </tr>
        <tr>
          <td>Ticket Price: ${ticket.price / 100}$</td>
        </tr>
        <tr>
          <td style="border: none;">Owner Name: ${ticket.ownerName}</td>
        </tr>
      </table>
    </div>
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
  page.close();
  callback(absPath);
}

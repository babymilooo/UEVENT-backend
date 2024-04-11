import { createTransport } from "nodemailer";

export const GMAIL_USERNAME = process.env.GMAIL_USERNAME;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const BACKEND_URL = process.env.BACKEND_URL;

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

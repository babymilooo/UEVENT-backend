import mongoose from "mongoose";
import app from "./app";
// import "dotenv/config";
import dotenv from 'dotenv';
dotenv.config();

import { agenda, sendEventReminderJob } from "./config/agendaConfig";

const MONGODB_URI = process.env.MONGODB_URI || '';

export const mongooseInstancePromise = mongoose.connect(MONGODB_URI);

async function main() {

  if (!MONGODB_URI || MONGODB_URI.length == 0) {
    console.log("MongoDB URI is not set in the enviroment - ending server");
    return;
  }

  await mongooseInstancePromise;
  const port = process.env.PORT || 5000;
  await agenda.start();
  await agenda.schedule('every 5 minutes', 'send event reminder');
  sendEventReminderJob();

  app.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`);
    /* eslint-enable no-console */
  });
}

main();

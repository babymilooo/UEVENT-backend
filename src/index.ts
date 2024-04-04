import mongoose from "mongoose";
import app from "./app";
import "dotenv/config";

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.log("MongoDB URI is not set in the enviroment - ending server");
    return;
  }

  await mongoose.connect(MONGODB_URI);
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`);
    /* eslint-enable no-console */
  });
}

main();

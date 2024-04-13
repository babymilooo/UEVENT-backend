import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { authRouter } from "./routers/authRouter";
import { artistRouter } from "./routers/artistsRouter";
import { userRouter } from "./routers/userRouter";
import { organizationRouter } from "./routers/organizationsRouter";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/static/avatars', express.static('src/static/avatars'));

app.use('/auth', authRouter);
app.use('/artists', artistRouter);
app.use('/user', userRouter);
app.use('/organization', organizationRouter);

export default app;

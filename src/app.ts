import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { authRouter } from "./routers/authRouter";
import { artistRouter } from "./routers/artistsRouter";
import { userRouter } from "./routers/userRouter";
import { organizationRouter } from "./routers/organizationsRouter";
import { stripeRouter } from "./routers/stripeRouter";
import { eventsRouter } from "./routers/eventsRouter";
import { ticketRouter } from "./routers/ticketRouter";

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '10mb' })); // Установка максимального размера для JSON-данных
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

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

app.use('/static/avatars', express.static('static/avatars'));
app.use('/static/organizations', express.static('static/organizations'));

app.use('/auth', authRouter);
app.use('/artists', artistRouter);
app.use('/user', userRouter);
app.use('/organization', organizationRouter);
app.use('/stripe', stripeRouter);
app.use('/events', eventsRouter);
app.use('/tickets', ticketRouter);

export default app;

import express from "express";
import { 
  getAllArtists,
  getAllFollowedArtistsSpotify
} from "../controllers/artistsController";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";

const artistRouter = express.Router();

artistRouter.get("/get-artist", getAllArtists);
artistRouter.get("/user-following-artists", authGuard, refreshTokenMiddleware, getAllFollowedArtistsSpotify);

export { artistRouter};

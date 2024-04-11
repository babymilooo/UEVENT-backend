import express from "express";
import { 
  getAllArtists,
  getAllFollowedArtistsSpotify,
  getArtistById,
  getArtistsByIds,
  getArtistTopTracks
} from "../controllers/artistsController";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";

const artistRouter = express.Router();

artistRouter.get("/get-artist", getAllArtists);
artistRouter.get("/user-following-artists", authGuard, refreshTokenMiddleware, getAllFollowedArtistsSpotify);
artistRouter.get("/get-artist/:artistId", getArtistById);
artistRouter.get("/get-artist-songs/:artistId", getArtistTopTracks);
artistRouter.post("/get-artists", getArtistsByIds);

export { artistRouter};

import express from "express";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";
import { 
  updateProfile,
  getUserInfo,
  getUserInfoById,
  updateAvatar 
} from "../controllers/userController";
import { uploadAvatars } from "../config/configMulter";
const userRouter = express.Router();

userRouter.patch("/edit-profile", authGuard, refreshTokenMiddleware, updateProfile);
userRouter.patch("/edit-profile-avatar", authGuard, refreshTokenMiddleware, uploadAvatars.single("avatar"), updateAvatar);
userRouter.get("/user-info", authGuard, refreshTokenMiddleware, getUserInfo);
userRouter.get('/user-info/:userId', getUserInfoById);

export { userRouter};

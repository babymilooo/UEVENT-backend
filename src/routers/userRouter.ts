import express from "express";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";
import { 
  updateProfile,
  getUserInfo,
  getUserInfoById,
  updateAvatar,
  changePassword,
  verifyEmailWithAccount,
  deleteAccount
} from "../controllers/userController";
import { uploadAvatars } from "../config/configMulter";
const userRouter = express.Router();

userRouter.patch("/edit-profile", authGuard, refreshTokenMiddleware, updateProfile);
userRouter.patch("/edit-password", authGuard, refreshTokenMiddleware, changePassword);
userRouter.get("/verify-email", authGuard, refreshTokenMiddleware, verifyEmailWithAccount);
userRouter.patch("/edit-profile-avatar", authGuard, refreshTokenMiddleware, uploadAvatars.single("avatar"), updateAvatar);
userRouter.get("/user-info", authGuard, refreshTokenMiddleware, getUserInfo);
userRouter.get('/user-info/:userId', getUserInfoById);
userRouter.delete("/delete-account", authGuard, refreshTokenMiddleware, deleteAccount);

export { userRouter};

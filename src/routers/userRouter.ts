import express from "express";
import { authGuard } from "../helpers/authGuard";
import { refreshTokenMiddleware } from "../helpers/refreshTokenMiddleware";
import { 
  updateProfile,
  getUserInfo,
  getUserInfoById 
} from "../controllers/userController";
import { upload } from "../config/configMulter";
const userRouter = express.Router();

userRouter.patch("/edit-profile", authGuard, refreshTokenMiddleware, upload.single("avatar"), updateProfile);
userRouter.get("/user-info", authGuard, refreshTokenMiddleware, getUserInfo);
userRouter.get('/user-info/:userId', getUserInfoById);

//userRouter.patch("/edit-profile", authGuard, refreshTokenMiddleware, upload.single("avatar"), updateProfile);


export { userRouter};

import { Request, Response } from "express";
import {
  createHashPassword,
  updateUser,
  removeSensitiveData,
  findUserById,
  getPublicUserInfo,
  generateAvatarPath
} from "../services/userService";
import { errorMessageObj } from "../helpers/errorMessageObj";
import { updateFile, removeSingleFile } from "../helpers/updateAndDeleteImage";

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const currentUser = await findUserById(userId);
    if (currentUser && currentUser.isRegisteredViaSpotify)
      return res.status(403)
        .json(
          errorMessageObj(
            "Profile editing is not allowed for users registered via Spotify."
          )
        );

    const updateData: any = { ...req.body };
    if (req.body.password) {
      const passwordHash = await createHashPassword(req.body.password);
      updateData.passwordHash = passwordHash;
      delete updateData.password;
    }

    const updateInfoUser = await updateUser(userId, updateData);
    res.status(200).json(await removeSensitiveData(updateInfoUser));
  } catch (error) {
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("Failed to update profile"));
  }
}

export async function updateAvatar(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const file: Express.Multer.File = req.file as any;
  
    if (!file)
      return res.status(400).json(errorMessageObj("No image uploaded."));
    
    const currentUser = await findUserById(userId);
    if (currentUser && currentUser.isRegisteredViaSpotify)
      return res.status(403).json(
        errorMessageObj(
          "Profile editing is not allowed for users registered via Spotify."
        )
      );

    await updateFile(currentUser, "profile", "profilePicture", file);
    await currentUser.save();

    const avatarPath = currentUser.profilePicture ? await generateAvatarPath(currentUser.profilePicture) : null;
    res.status(200).json({ profilePicture: avatarPath });
  } catch (error: any) {
    if (req.file)
      await removeSingleFile(req.file);
    if (error instanceof Error) 
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("An error occurred while updating the image."));
  }
}

export async function getUserInfo(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    console.log(userId);
    const user = await findUserById(userId);
    res.status(200).json(await removeSensitiveData(user));
  } catch (error) {
    return res
      .status(500)
      .json(
        errorMessageObj("An error occurred while fetching user information")
      );
  }
}

export async function getUserInfoById(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    if (!userId)
      return res.status(400).json(errorMessageObj("Invalid data provided"));

    const user = await findUserById(userId);
    res.status(200).json(await getPublicUserInfo(user));
  } catch (error) {
    return res
      .status(500)
      .json(
        errorMessageObj("An error occurred while fetching user information")
      );
  }
}

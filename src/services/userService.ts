import * as bcrypt from "bcrypt";
import "dotenv/config";
import { emailRegex } from "../helpers/emailRegex";
import { User } from "../models/user";
import { IUserDto, IUserUpdateDto } from "../types/user";
import { refreshSpotifyAccessToken } from "../services/tokenService";
import fs from 'fs';

export async function createHashPassword(password: string): Promise<string> {
  if (new TextEncoder().encode(password).length > 72) {
    throw new Error("Password is too long");
  }

  const passwordHash = bcrypt.hashSync(
    password || '',
    Number(process.env.SALT_ROUNDS)
  )
  
  return passwordHash;
}

export async function createUser(userDto: IUserDto) {
  if (!emailRegex.test(userDto.email)) {
    throw new Error("Email must be valid");
  }

  const hashPassword = createHashPassword(userDto.password);

  const userObj: any = {
    ...userDto,
    emailVerified: userDto.isRegisteredViaSpotify || false,
    passwordHash: hashPassword
  };
  delete userObj.password;
  //TODO - send verification email
  try {
    const user = new User(userObj);
    await user.save();
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("User already exists");
  }
}

export async function findUserById(id: string) {
  const user = await User.findById(id).exec();
  if (!user) 
    throw new Error("User not found");
  return user;
}

export async function findAllUsers() {
  return await User.find().exec();
}

export async function findUserByEmail(email: string) {
  if (!emailRegex.test(email))
    throw new Error("Email must be valid");
  return await User.findOne({ email: email }).exec();
}

export async function updateUser(id: string, updateData: IUserUpdateDto) {
  return await User.findByIdAndUpdate(id, updateData, { new: true }).exec();
}

export async function deleteUser(id: string) {
  return await User.findByIdAndDelete(id).exec();
}

export async function removeSensitiveData(user: any) {
  const userObject = user.toObject ? user.toObject() : user._doc ? user._doc : user;
  
  delete userObject.passwordHash; 
  delete userObject.spotifyRefreshToken; 
  return userObject;
}

export async function getPublicUserInfo(user: any) {
  const userObject = user.toObject ? user.toObject() : user._doc ? user._doc : user;

  const publicUserInfo = {
    name: userObject.userName,
    email: userObject.email,
    profilePicture: userObject.profilePicture 
  };

  return publicUserInfo;
}


export async function handleSpotifyAuthorization(spotifyApi: any, code: string) {
  const data = await spotifyApi.authorizationCodeGrant(code);
  spotifyApi.setAccessToken(data.body.access_token);
  spotifyApi.setRefreshToken(data.body.refresh_token);
  return data.body;
}

export async function createSpotifyUser(me: any, refreshToken: string) {
  const profilePictureUrl = me.images.length > 0 ? me.images[0].url : "";
  return createUser({ 
    userName: me.display_name, 
    email: me.email,
    password: me.display_name, 
    spotifyRefreshToken: refreshToken, 
    isRegisteredViaSpotify: true,
    profilePicture: profilePictureUrl 
  });
}

export async function updateUserInformation(user: any, refreshToken: string, profilePictureUrl: string) {
  let updatesNeeded = false;

  if (user.spotifyRefreshToken !== refreshToken) {
    user.spotifyRefreshToken = refreshToken;
    updatesNeeded = true;
  }
  
  if (user.profilePicture !== profilePictureUrl) {
    user.profilePicture = profilePictureUrl;
    updatesNeeded = true;
  }
  
  if (updatesNeeded)
    await user.save();
}


export async function findOrCreateUser(spotifyApi: any, me: any, refreshToken: string) {
  let user = await findUserByEmail(me.email);
  const profilePictureUrl = me.images.length > 0 ? me.images[0].url : "";
  if (!user) {
    user = await createSpotifyUser(me, refreshToken);
  } else {
    await updateUserInformation(user, refreshToken, profilePictureUrl);
    await refreshSpotifyAccessToken(spotifyApi, user.spotifyRefreshToken || "");
  }
  return user
}


export async function getRefreshTokenForUser(userId: string) {
  const user = await findUserById(userId);
  const refreshToken = user.spotifyRefreshToken;
  if (!refreshToken)
    throw new Error("Refresh token not found"); 
  return refreshToken; 
}


export async function handleProfilePictureUpdate(currentUser: any, updateData: any, file?: Express.Multer.File) {
  if (currentUser.profilePicture) {
    const oldImagePath = currentUser.profilePicture.replace(`${process.env.BACKEND_URL}/static`, 'src/static');
    try {
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    } catch (error) {
      console.error("Error deleting old profile picture:", error);
    }
  }

  if (file && file.path) {
    const relativeFilePath = file.path.split('src/static')[1];
    updateData.profilePicture = `${process.env.BACKEND_URL}/static${relativeFilePath}`;
  }
}



// export async function findOrCreateUser(spotifyApi: any, me: any, refreshToken: string) {
//   let user = await findUserByEmail(me.email);
//   const profilePictureUrl = me.images.length > 0 ? me.images[0].url : "";
//   if (!user) {
//     user = await createUser({ 
//       userName: me.disply_name, email: me.emal,
//       password: refreshToken,
//       spotifyRefreshToken: refreshToken, 
//       isRegisteredViaSpotify: true,
//       profilePicture: profilePictureUrl });
//   } else {
//     let userRefreshToken = user.spotifyRefreshToken;
//     if(userRefreshToken !== refreshToken) {
//       userRefreshToken = refreshToken;
//       user.spotifyRefreshToken = userRefreshToken;
//       await user.save();
//     }
//     if (user.profilePicture !== profilePictureUrl) {
//       user.profilePicture = profilePictureUrl;
//       await user.save();
//     }
//     if (userRefreshToken)
//       await refreshSpotifyAccessToken(spotifyApi, userRefreshToken);
//   }
//   return user
// } 
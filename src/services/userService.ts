import * as bcrypt from "bcrypt";
import "dotenv/config";
import { emailRegex } from "../helpers/emailRegex";
import { User } from "../models/user";
import { IUserDto, IUserUpdateDto } from "../types/user";

export async function createUser(userDto: IUserDto) {
  if (!emailRegex.test(userDto.email)) {
    throw new Error("Email must be valid");
  }
  if (new TextEncoder().encode(userDto.password).length > 72) {
    throw new Error("Password is too long");
  }

  const userObj: any = {
    ...userDto,
    passwordHash: bcrypt.hashSync(
      userDto.password || '',
      Number(process.env.SALT_ROUNDS)
    ),
  };
  delete userObj.password;
  //TODO - send verification email
  try {
    const user = new User(userObj);
    user.emailVerified = false;
    await user.save();
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("User already exists");
  }
}

export async function findUserById(id: string) {
  return await User.findById(id).exec();
}

export async function findAllUsers() {
  return await User.find().exec();
}

export async function findUserByEmail(email: string) {
  if (!emailRegex.test(email)) {
    throw new Error("Email must be valid");
  }
  return await User.findOne({ email: email }).exec();
}

export async function updateUser(id: string, updateData: IUserUpdateDto) {
  return await User.findByIdAndUpdate(id, updateData).exec();
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


export async function handleSpotifyAuthorization(spotifyApi: any, code: string) {
  const data = await spotifyApi.authorizationCodeGrant(code);
  spotifyApi.setAccessToken(data.body.access_token);
  spotifyApi.setRefreshToken(data.body.refresh_token);
  return data.body;
}

export async function findOrCreateUser(spotifyApi: any, me: any, refreshToken: string) {
  let user = await findUserByEmail(me.email);
  const profilePictureUrl = me.images.length > 0 ? me.images[0].url : '';
  if (!user) {
    user = await createUser({ email: me.emal,  
                              spotifyRefreshToken: refreshToken, 
                              isRegisteredViaSpotify: true,
                              profilePicture: profilePictureUrl,
                              emailVerified: true });
  } else {
    let userRefreshToken = user.spotifyRefreshToken;
    if(userRefreshToken !== refreshToken) {
      userRefreshToken = refreshToken;
      user.spotifyRefreshToken = userRefreshToken;
      await user.save();
    }
    if (user.profilePicture !== profilePictureUrl) {
      user.profilePicture = profilePictureUrl;
      await user.save();
    }
    if (userRefreshToken) {
      spotifyApi.setRefreshToken(userRefreshToken);
      const refreshedData: any = await spotifyApi.refreshAccessToken();
      const refreshedAccessToken = refreshedData.body.access_token;
      spotifyApi.setAccessToken(refreshedAccessToken);
    }
  }
  return user
}

export async function getRefreshTokenForUser(userId: string) {
  const user = await User.findById(userId).exec();
  if (!user) {
    throw new Error('User not found');
  }
  return user.spotifyRefreshToken; 
}

import * as bcrypt from "bcrypt";
import { emailRegex } from "../helpers/emailRegex";
import { User } from "../models/user";
import { IUserDto, IUserUpdateDto } from "../types/user";
import 'dotenv/config';

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
      userDto.password,
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

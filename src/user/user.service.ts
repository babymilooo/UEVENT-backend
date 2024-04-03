import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { IUserDto, IUserUpdateDto } from './user.dto';
import { emailRegex } from 'src/helpers/emailRegex.helper';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(userDto: IUserDto) {
    if (!emailRegex.test(userDto.email)) {
      throw new BadRequestException('Email must be valid');
    }
    if (new TextEncoder().encode(userDto.password).length > 72) {
      throw new BadRequestException('Password is too long');
    }

    const userObj = {
      ...userDto,
      passwordHash: bcrypt.hashSync(
        userDto.password,
        Number(process.env.SALT_ROUNDS),
      ),
    };
    delete userObj.password;
    //TODO - send verification email
    try {
      const user = new this.userModel(userObj);
      user.emailVerified = false;
      await user.save();
      return user;
    } catch (error) {
      console.error(error);
      throw new ConflictException('User already exists');
    }
  }

  async findUserById(id: string) {
    return await this.userModel.findById(id).exec();
  }

  async findAll() {
    return await this.userModel.find().exec();
  }

  async findByEmail(email: string) {
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Email must be valid');
    }
    return await this.userModel.findOne({ email: email }).exec();
  }

  async update(id: string, updateData: IUserUpdateDto) {
    return await this.userModel.findByIdAndUpdate(id, updateData).exec();
  }

  async delete(id: string) {
    return await this.userModel.findByIdAndDelete(id).exec();
  }
}

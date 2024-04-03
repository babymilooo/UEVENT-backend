import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';

const MONGODB_URI = process.env.MONGODB_URI;
console.log(MONGODB_URI);

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot(MONGODB_URI),
    UserModule,
    TokenModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}

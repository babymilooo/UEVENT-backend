import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { SpotifyModule } from './spotify/spotify.module';

const MONGODB_URI = process.env.MONGODB_URI;
// console.log(MONGODB_URI);

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot(MONGODB_URI),
    UserModule,
    TokenModule,
    SpotifyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

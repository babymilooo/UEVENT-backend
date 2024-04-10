import * as process from 'process';
import 'dotenv/config';


export const jwtAccessConfig = {
  secret: process.env.JWT_ACCESS_TOKEN_SECRET,
  expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
};

export const jwtRefreshConfig = {
  secret: process.env.JWT_REFRESH_TOKEN_SECRET,
  expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
};

export const jwtVerificationConfig = {
  secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
  expiresIn: undefined,
};


export const jwtPasswordResetConfig = {
  secret: process.env.JWT_PASSWORD_RESET_TOKEN_SECRET,
  expiresIn: process.env.JWT_PASSWORD_RESET_TOKEN_EXPIRATION_TIME,
};


const year = 1000 * 60 * 60 * 24 * 365;

export const httponlyCookiesOption: {
  httpOnly: boolean;
  secure: boolean;
  expires: Date;
  sameSite: 'none' | 'strict' | 'lax';
} = {
  httpOnly: true,
  secure: true,
  expires: new Date(new Date().getTime() + year),
  // sameSite: 'strict',
  sameSite: `none`,
  // sameSite: 'none',
  // domain: process.env.FRONTEND_DOMAIN
};

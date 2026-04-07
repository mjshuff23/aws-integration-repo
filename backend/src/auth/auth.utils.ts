import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';

export function getAuthCookieName(configService: ConfigService) {
  return configService.get<string>('COOKIE_NAME', 'auth_token');
}

export function buildAuthCookieOptions(
  configService: ConfigService,
): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: configService.get<string>('NODE_ENV') === 'production',
    path: '/',
  };
}

export function setAuthCookie(
  response: Response,
  configService: ConfigService,
  token: string,
) {
  response.cookie(
    getAuthCookieName(configService),
    token,
    buildAuthCookieOptions(configService),
  );
}

export function clearAuthCookie(
  response: Response,
  configService: ConfigService,
) {
  response.clearCookie(
    getAuthCookieName(configService),
    buildAuthCookieOptions(configService),
  );
}

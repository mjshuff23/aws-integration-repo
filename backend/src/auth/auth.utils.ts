import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';

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

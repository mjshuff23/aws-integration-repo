import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { JwtPayload } from '../types/jwt-payload.type';
import type { JwtUser } from '../types/jwt-user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const cookieName = configService.get<string>('COOKIE_NAME', 'auth_token');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request | undefined) => {
          const cookies = request?.cookies as
            | Record<string, string | undefined>
            | undefined;

          return cookies?.[cookieName] ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): JwtUser {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}

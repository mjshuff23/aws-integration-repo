import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import type { Response } from 'express';
import { UsersService } from '../users/users.service';
import type { UserResponseDto } from '../users/dto/user-response.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import type { JwtUser } from './types/jwt-user.type';
import { buildAuthCookieOptions } from './auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<UserResponseDto> {
    const normalizedEmail = signupDto.email.toLowerCase();
    const existingUser = await this.usersService.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('A user with that email already exists.');
    }

    const passwordHash = await hash(signupDto.password, 12);

    const user = await this.usersService.create({
      email: normalizedEmail,
      name: signupDto.name,
      passwordHash,
    });

    return this.usersService.sanitizeUser(user);
  }

  async login(loginDto: LoginDto): Promise<UserResponseDto> {
    const normalizedEmail = loginDto.email.toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.usersService.sanitizeUser(user);
  }

  async getCurrentUser(jwtUser: JwtUser): Promise<UserResponseDto> {
    const user = await this.usersService.findById(jwtUser.userId);

    if (!user) {
      throw new UnauthorizedException('Your session is no longer valid.');
    }

    return this.usersService.sanitizeUser(user);
  }

  async attachAuthCookie(response: Response, jwtUser: JwtUser) {
    const cookieName = this.configService.get<string>(
      'COOKIE_NAME',
      'auth_token',
    );
    const token = await this.jwtService.signAsync({
      sub: jwtUser.userId,
      email: jwtUser.email,
    });

    response.cookie(
      cookieName,
      token,
      buildAuthCookieOptions(this.configService),
    );
  }

  clearAuthCookie(response: Response) {
    const cookieName = this.configService.get<string>(
      'COOKIE_NAME',
      'auth_token',
    );

    response.clearCookie(
      cookieName,
      buildAuthCookieOptions(this.configService),
    );
  }
}

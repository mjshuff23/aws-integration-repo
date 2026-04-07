import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type User } from '@prisma/client';
import { hash } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { normalizeEmail } from './users.utils';

type CreateUserInput = {
  email: string;
  name?: string;
  passwordHash: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(input: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        email: normalizeEmail(input.email),
        name: input.name,
        passwordHash: input.passwordHash,
      },
    });
  }

  sanitizeUser(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.sanitizeUser(user);
  }

  async updateCurrentUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.findById(userId);

    if (!existingUser) {
      throw new NotFoundException('User not found.');
    }

    if (updateUserDto.email) {
      const normalizedEmail = normalizeEmail(updateUserDto.email);
      const userWithEmail = await this.findByEmail(normalizedEmail);

      if (userWithEmail && userWithEmail.id !== userId) {
        throw new ConflictException('A user with that email already exists.');
      }
    }

    const data: Prisma.UserUpdateInput = {};

    if (typeof updateUserDto.email !== 'undefined') {
      data.email = normalizeEmail(updateUserDto.email);
    }

    if (typeof updateUserDto.name !== 'undefined') {
      data.name = updateUserDto.name;
    }

    if (updateUserDto.password) {
      data.passwordHash = await hash(updateUserDto.password, 12);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return this.sanitizeUser(updatedUser);
  }

  async deleteCurrentUser(userId: string): Promise<UserResponseDto> {
    const existingUser = await this.findById(userId);

    if (!existingUser) {
      throw new NotFoundException('User not found.');
    }

    const deletedUser = await this.prisma.user.delete({
      where: { id: userId },
    });

    return this.sanitizeUser(deletedUser);
  }
}

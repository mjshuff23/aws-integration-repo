import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { clearAuthCookie } from '../auth/auth.utils';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiUnauthorizedResponse({ description: 'Authentication required' })
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current user account' })
  @ApiOkResponse({ type: UserResponseDto })
  me(@CurrentUser() user: JwtUser) {
    return this.usersService.getCurrentUser(user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the current user account' })
  @ApiOkResponse({ type: UserResponseDto })
  updateMe(@CurrentUser() user: JwtUser, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateCurrentUser(user.userId, updateUserDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete the current user account' })
  @ApiOkResponse({ type: UserResponseDto })
  async deleteMe(
    @CurrentUser() user: JwtUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const deletedUser = await this.usersService.deleteCurrentUser(user.userId);
    clearAuthCookie(response, this.configService);
    return deletedUser;
  }
}

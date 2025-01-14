import { UpdateUserApi, UserDto } from '@/types';
import { userValidation } from '@/validations';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpCode,
  Inject,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/decorators/api-key.decorator';
import { GetCurrentUser } from 'src/decorators/get-current-user.decorator';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private service: UserService,
  ) {}

  @Get('me')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async me(@GetCurrentUser() user: User): Promise<UserDto> {
    return this.service.formatUser(user);
  }

  @Patch('me')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async update(
    @Body() body: UpdateUserApi,
    @GetCurrentUser() user: User,
  ): Promise<UserDto> {
    try {
      await userValidation.update.validate(body, {
        abortEarly: false,
      });
      const userUpdated = await this.service.updateUser(body, user.id);
      return this.service.formatUser(userUpdated);
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
  }

  @Delete('me')
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  deleteUser(@GetCurrentUser() user: User): void {
    this.service.deleteUser(user.id);
  }
}

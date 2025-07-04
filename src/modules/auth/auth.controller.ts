import { errorMessage } from '@/errors';
import { AuthLoginApi, RegisterApi } from '@/types';
import { userValidation } from '@/validations';
import {
  BadRequestException,
  Body,
  Controller,
  forwardRef,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiKeyGuard } from '../../decorators/api-key.decorator';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @UseGuards(ApiKeyGuard)
  @HttpCode(200)
  async login(@Body() body: AuthLoginApi) {
    try {
      await userValidation.login.validate(body, {
        abortEarly: false,
      });
      return await this.authService.login(body);
    } catch (e) {
      throw new BadRequestException({
        ...e,
        title: errorMessage.api('user').VALIDATION,
        errors: e.errors,
      });
    }
  }

  @Post('register')
  @UseGuards(ApiKeyGuard)
  @HttpCode(200)
  async register(@Body() body: RegisterApi) {
    try {
      await userValidation.create.validate(body, {
        abortEarly: false,
      });
      const { access_token } = await this.authService.register(body);
      return access_token;
    } catch (e) {
      console.log('[D] auth.controller', e);
      throw new BadRequestException({
        ...e,
        title: errorMessage.api('user').NOT_CREATED,
        errors: e.errors,
      });
    }
  }
}

import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { GetCurrentUser } from '@/decorators/get-current-user.decorator';
import { CreateDishApi, DishDto, UpdateDishApi } from '@/types';
import { dishValidation } from '@/validations';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../user/user.entity';
import { DishService } from './dish.service';

@Controller('dishes')
export class DishController {
  constructor(
    @Inject(forwardRef(() => DishService))
    private service: DishService,
  ) {}

  @Get()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async get(@GetCurrentUser() user: User): Promise<DishDto[]> {
    const dishes = await this.service.getDish(user);
    return dishes.map((dishe) => this.service.formatDish(dishe));
  }

  @Get('getTags')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getTags(@GetCurrentUser() user: User): Promise<string[]> {
    return await this.service.getTags(user);
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getOne(@Param('id') id: string): Promise<DishDto> {
    const dishe = await this.service.getOneById(id);
    return this.service.formatDish(dishe);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async create(@Body() body: CreateDishApi, @GetCurrentUser() user: User) {
    try {
      await dishValidation.add.validate(body, {
        abortEarly: false,
      });
      return this.service.formatDish(await this.service.createDish(body, user));
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async update(@Body() body: UpdateDishApi, @Param('id') id: string) {
    try {
      await dishValidation.update.validate(body, {
        abortEarly: false,
      });
      return this.service.formatDish(await this.service.updateDish(body, id));
    } catch (e) {
      throw new BadRequestException({
        ...e,
      });
    }
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.service.deleteDish(id);
  }
}

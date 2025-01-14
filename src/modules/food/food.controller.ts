import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { CreateFoodApi, UpdateFoodApi } from '@/types/api/Food';
import { FoodDto } from '@/types/dto/Food';
import { foodValidation } from '@/validations/Food';
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
import { GetCurrentUser } from 'src/decorators/get-current-user.decorator';
import { User } from '../user/user.entity';
import { FoodService } from './food.service';

@Controller('foods')
export class FoodController {
  constructor(
    @Inject(forwardRef(() => FoodService))
    private service: FoodService,
  ) {}

  @Get()
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async get(@GetCurrentUser() user: User): Promise<FoodDto[]> {
    const foods = await this.service.getFood(user);
    return foods.map((food) => this.service.formatFood(food));
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async getOne(@Param('id') id: string): Promise<FoodDto> {
    const food = await this.service.getOneById(id);
    return this.service.formatFood(food);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async create(@Body() body: CreateFoodApi, @GetCurrentUser() user: User) {
    try {
      await foodValidation.create.validate(body, {
        abortEarly: false,
      });
      return this.service.formatFood(await this.service.createFood(body, user));
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async update(
    @Body() body: UpdateFoodApi,
    @GetCurrentUser() user: User,
    @Param('id') id: string,
  ) {
    try {
      await foodValidation.update.validate(body, {
        abortEarly: false,
      });
      return this.service.formatFood(
        await this.service.updateFood(body, user, id),
      );
    } catch (e) {
      throw new BadRequestException(e.errors);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.service.deleteFood(id);
  }
}

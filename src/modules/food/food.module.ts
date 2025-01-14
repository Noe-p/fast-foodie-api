import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { IngredientModule } from '../ingredient/ingredient.module';
import { UserModule } from '../user/user.module';
import { FoodController } from './food.controller';
import { Food } from './Food.entity';
import { FoodService } from './food.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Food]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => IngredientModule),
  ],
  providers: [FoodService],
  controllers: [FoodController],
  exports: [FoodService],
})
export class FoodModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/foods', method: RequestMethod.GET },
        { path: '/foods', method: RequestMethod.DELETE },
        { path: '/foods', method: RequestMethod.PATCH },
        { path: '/foods', method: RequestMethod.POST },
        { path: '/foods/*', method: RequestMethod.GET },
        { path: '/foods/*', method: RequestMethod.DELETE },
        { path: '/foods/*', method: RequestMethod.PATCH },
        { path: '/foods/*', method: RequestMethod.POST },
      );
  }
}

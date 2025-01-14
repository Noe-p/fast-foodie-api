import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { DishModule } from '../dish/dish.module';
import { FoodModule } from '../food/food.module';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => FoodModule),
    forwardRef(() => DishModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/users', method: RequestMethod.DELETE },
        { path: '/users', method: RequestMethod.PATCH },
        { path: '/users', method: RequestMethod.POST },
        { path: '/users/*', method: RequestMethod.DELETE },
        { path: '/users/*', method: RequestMethod.PATCH },
        { path: '/users/*', method: RequestMethod.POST },
        { path: '/users/me', method: RequestMethod.GET },
      );
  }
}

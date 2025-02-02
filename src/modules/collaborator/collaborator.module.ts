import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '../auth/auth.middleware';
import { UserModule } from '../user/user.module';
import { CollaboratorController } from './collaborator.controller';
import { Collaborator } from './Collaborator.entity';
import { CollaboratorService } from './collaborator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Collaborator]),
    forwardRef(() => UserModule),
  ],
  providers: [CollaboratorService],
  controllers: [CollaboratorController],
  exports: [CollaboratorService],
})
export class CollaboratorModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/collaborators', method: RequestMethod.ALL },
        { path: '/collaborators/*', method: RequestMethod.ALL },
      );
  }
}

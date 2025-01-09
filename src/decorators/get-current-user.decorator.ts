import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@/modules/user/user.entity';

export const GetCurrentUser = createParamDecorator(
  (_, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);

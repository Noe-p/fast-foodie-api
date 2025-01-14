import { BaseDto } from './BaseDto';

export interface UserDto extends BaseDto {
  userName: string;
  collaborators: UserDto[];
}

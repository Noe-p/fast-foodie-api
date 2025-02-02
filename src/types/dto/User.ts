import { BaseDto } from './BaseDto';
import { MediaDto } from './Media';

export interface UserDto extends BaseDto {
  userName: string;
  profilePicture?: MediaDto;
  collaborators: UserDto[];
}

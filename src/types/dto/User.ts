import { BaseDto } from './BaseDto';
import { CollaboratorDto } from './Collaborator';
import { MediaDto } from './Media';

export interface UserDto extends BaseDto {
  userName: string;
  profilePicture?: MediaDto;
  collaborators: CollaboratorDto[];
  collabSend: CollaboratorDto[];
}

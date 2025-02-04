import { CollaboratorType } from '../dto';

export interface CreateCollaboratorApi {
  userName: string;
  type: CollaboratorType;
}

export interface UpdateCollaboratorApi {
  type: CollaboratorType;
}

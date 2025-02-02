import { injectable } from 'inversify';
import { ISerializer } from '@/types';
import { IHunt } from '@db/types/Hunt';
import { Hunt } from '@/openapi/HuntHubTypes';

@injectable()
export class HuntSerializer implements ISerializer<IHunt, Hunt> {
  toDTO(model: IHunt): Hunt {
    return {
      id: model._id!.toString(),
      creatorId: model.creatorId.toString(),
      name: model.name,
      description: model.description,
      currentVersion: model.currentVersion,
      status: model.status,
      startLocation: model.startLocation,
      steps: [],
      createdAt: model.createdAt?.toISOString(),
      updatedAt: model.updatedAt?.toISOString(),
    } as Hunt;
  }
}

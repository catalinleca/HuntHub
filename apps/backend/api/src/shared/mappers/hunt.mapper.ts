import { HydratedDocument } from 'mongoose';
import { IHunt } from '@/database/types/Hunt';
import { Hunt } from '@hunthub/shared';

export class HuntMapper {
  static toDTO(doc: HydratedDocument<IHunt>): Hunt {
    const json = doc.toJSON(); // baseTransform handles: id, __v, dates

    // Fix ObjectId[] → string[] for stepOrder
    if (json.stepOrder) {
      json.stepOrder = json.stepOrder.map((id: any) => id.toString());
    }

    return json as Hunt;
  }

  static toDTOArray(docs: HydratedDocument<IHunt>[]): Hunt[] {
    return docs.map(doc => this.toDTO(doc));
  }
}

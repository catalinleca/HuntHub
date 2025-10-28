import { HydratedDocument } from 'mongoose';
import { IUser } from '@/database/types/User';
import { User } from '@hunthub/shared';

export class UserMapper {
  static toDTO(doc: HydratedDocument<IUser>): User {
    const json = doc.toJSON(); // baseTransform already handles id, dates, __v

    // User doesn't have ObjectId arrays, so json is already correct!
    // baseTransform handled:
    // - _id → id
    // - removed __v
    // - dates → ISO strings

    return json as User;
  }

  static toDTOArray(docs: HydratedDocument<IUser>[]): User[] {
    return docs.map(doc => this.toDTO(doc));
  }
}

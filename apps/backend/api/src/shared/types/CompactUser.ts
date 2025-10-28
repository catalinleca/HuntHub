import { User } from '@hunthub/shared';

export type CompactUser = Pick<User, 'firebaseUid' | 'email' | 'id'>;

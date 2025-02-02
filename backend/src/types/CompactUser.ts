import { User } from '@/openapi/HuntHubTypes';

export type CompactUser = Pick<User, 'firebaseUid' | 'email' | 'id'>;

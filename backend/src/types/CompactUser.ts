import { User } from '@/openapi/HuntHubTypes';

export type CompactUser = Pick<User, 'firebaseId' | 'email' | 'id'>;

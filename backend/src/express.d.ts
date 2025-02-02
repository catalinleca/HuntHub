import { User } from '@/openapi/HuntHubTypes';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

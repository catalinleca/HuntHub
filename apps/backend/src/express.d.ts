import { User } from '@hunthub/shared';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

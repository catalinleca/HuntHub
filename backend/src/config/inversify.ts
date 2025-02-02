import 'reflect-metadata';
import { Container } from 'inversify';
import { UserService, IUserService } from '@/services/user.service';
import { TYPES } from '@/types';

const container = new Container();

container.bind<IUserService>(TYPES.UserService).to(UserService);

export { container };

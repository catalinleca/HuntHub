import 'reflect-metadata';
import { Container } from 'inversify';
import { UserService, IUserService } from '@/modules/users/user.service';
import { TYPES } from '@/shared/types';
import { HuntService, IHuntService } from '@/modules/hunts/hunt.service';
import { HuntController, IHuntController } from '@/modules/hunts/hunt.controller';
import { AuthService, IAuthService } from '@/modules/auth/auth.service';
import { AuthController, IAuthController } from '@/modules/auth/auth.controller';

const container = new Container();

container.bind<IAuthController>(TYPES.AuthController).to(AuthController);
container.bind<IHuntController>(TYPES.HuntController).to(HuntController);

container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<IHuntService>(TYPES.HuntService).to(HuntService);

export { container };

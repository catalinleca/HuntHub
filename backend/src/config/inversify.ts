import 'reflect-metadata';
import { Container } from 'inversify';
import { UserService, IUserService } from '@/services/user.service';
import { TYPES } from '@/types';
import { HuntService, IHuntService } from '@/services/hunt.service';
import { HuntController, IHuntController } from '@/controllers/hunt.controller';
import { AuthService, IAuthService } from '@/services/auth.service';
import { AuthController, IAuthController } from '@/controllers/auth.controller';

const container = new Container();

container.bind<IAuthController>(TYPES.AuthController).to(AuthController);
container.bind<IHuntController>(TYPES.HuntController).to(HuntController);

container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<IHuntService>(TYPES.HuntService).to(HuntService);

// container.bind<ISerializer<IHunt, Hunt>>(TYPES.HuntSerializer).to(HuntSerializer);

export { container };

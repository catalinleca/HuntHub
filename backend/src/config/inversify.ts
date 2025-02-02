import 'reflect-metadata';
import { Container } from 'inversify';
import { UserService, IUserService } from '@/services/user.service';
import { ISerializer, TYPES } from '@/types';
import { HuntSerializer } from '@db/serializers/hunt.serializer';
import { IHunt } from '@db/types/Hunt';
import { Hunt } from '@/openapi/HuntHubTypes';
import { HuntService, IHuntService } from '@/services/hunt.service';
import { HuntController } from '@/controllers/hunt.controller';

const container = new Container();

container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<IHuntService>(TYPES.HuntService).to(HuntService);
container.bind<HuntController>(TYPES.HuntController).to(HuntController);
container.bind<ISerializer<IHunt, Hunt>>(TYPES.HuntSerializer).to(HuntSerializer);

export { container };

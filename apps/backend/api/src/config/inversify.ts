import 'reflect-metadata';
import { Container } from 'inversify';
import { UserService, IUserService } from '@/modules/users/user.service';
import { TYPES } from '@/shared/types';
import { HuntService, IHuntService } from '@/modules/hunts/hunt.service';
import { HuntController, IHuntController } from '@/modules/hunts/hunt.controller';
import { StepService, IStepService } from '@/modules/steps/step.service';
import { StepController, IStepController } from '@/modules/steps/step.controller';
import { AuthService, IAuthService } from '@/modules/auth/auth.service';
import { AuthController, IAuthController } from '@/modules/auth/auth.controller';
import { AssetController, IAssetController } from '@/modules/assets/asset.controller';
import { AssetService, IAssetService } from '@/modules/assets/asset.service';
import { IStorageService, StorageService } from '@/services/storage/storage.service';
import { IPublishingController, PublishingController } from '@/features/publishing/publishing.controller';
import { IPublishingService, PublishingService } from '@/features/publishing/publishing.service';
import { AuthorizationService, IAuthorizationService } from '@/services/authorization/authorization.service';
import { AssetUsageTracker, IAssetUsageTracker } from '@/services/asset-usage';
import { AssetValidator, IAssetValidator } from '@/services/asset-validation';
import { HuntShareController, IHuntShareController } from '@/features/sharing/hunt-share.controller';
import { HuntShareService, IHuntShareService } from '@/features/sharing/hunt-share.service';

const container = new Container();

container.bind<IAuthController>(TYPES.AuthController).to(AuthController);
container.bind<IHuntController>(TYPES.HuntController).to(HuntController);
container.bind<IStepController>(TYPES.StepController).to(StepController);
container.bind<IAssetController>(TYPES.AssetController).to(AssetController);
container.bind<IPublishingController>(TYPES.PublishingController).to(PublishingController);
container.bind<IHuntShareController>(TYPES.HuntShareController).to(HuntShareController);

container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<IHuntService>(TYPES.HuntService).to(HuntService);
container.bind<IStepService>(TYPES.StepService).to(StepService);
container.bind<IAssetService>(TYPES.AssetService).to(AssetService);
container.bind<IStorageService>(TYPES.StorageService).to(StorageService);
container.bind<IPublishingService>(TYPES.PublishingService).to(PublishingService);
container.bind<IAuthorizationService>(TYPES.AuthorizationService).to(AuthorizationService);
container.bind<IAssetUsageTracker>(TYPES.AssetUsageTracker).to(AssetUsageTracker);
container.bind<IAssetValidator>(TYPES.AssetValidator).to(AssetValidator);
container.bind<IHuntShareService>(TYPES.HuntShareService).to(HuntShareService);

export { container };

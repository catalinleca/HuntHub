import 'reflect-metadata';
import { Container } from 'inversify';
import { UserService, IUserService } from '@/modules/users/user.service';
import { TYPES } from '@/shared/types';
import { HuntService, IHuntService } from '@/modules/hunts/hunt.service';
import { HuntSaveService, IHuntSaveService } from '@/modules/hunts/hunt-save.service';
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
import { PlayController, IPlayController } from '@/features/play/play.controller';
import { PlayService, IPlayService } from '@/features/play/play.service';
import { CloneController, ICloneController } from '@/features/cloning/clone.controller';
import { CloneService, ICloneService } from '@/features/cloning/clone.service';
import {
  PlayerInvitationController,
  IPlayerInvitationController,
} from '@/features/player-invitations/player-invitation.controller';
import {
  PlayerInvitationService,
  IPlayerInvitationService,
} from '@/features/player-invitations/player-invitation.service';
import { PreviewController, IPreviewController } from '@/features/preview/preview.controller';
import { PreviewService, IPreviewService } from '@/features/preview/preview.service';
import { GroqProvider, GeminiProvider, AIValidationService } from '@/services/ai-validation';
import type {
  ITextValidationProvider,
  IAudioValidationProvider,
  IImageValidationProvider,
  IAIValidationService,
} from '@/services/ai-validation';
import { OpenAIHuntGenerator, IAIHuntGenerator } from '@/features/ai-generation/ai-hunt-generator.provider';
import { AIHuntGenerationService, IAIHuntGenerationService } from '@/features/ai-generation/ai-hunt-generation.service';
import {
  AIHuntGenerationController,
  IAIHuntGenerationController,
} from '@/features/ai-generation/ai-hunt-generation.controller';

const container = new Container();

container.bind<IAuthController>(TYPES.AuthController).to(AuthController);
container.bind<IHuntController>(TYPES.HuntController).to(HuntController);
container.bind<IStepController>(TYPES.StepController).to(StepController);
container.bind<IAssetController>(TYPES.AssetController).to(AssetController);
container.bind<IPublishingController>(TYPES.PublishingController).to(PublishingController);
container.bind<IHuntShareController>(TYPES.HuntShareController).to(HuntShareController);
container.bind<IPlayController>(TYPES.PlayController).to(PlayController);
container.bind<ICloneController>(TYPES.CloneController).to(CloneController);
container.bind<IPlayerInvitationController>(TYPES.PlayerInvitationController).to(PlayerInvitationController);
container.bind<IPreviewController>(TYPES.PreviewController).to(PreviewController);

container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<IHuntService>(TYPES.HuntService).to(HuntService);
container.bind<IHuntSaveService>(TYPES.HuntSaveService).to(HuntSaveService);
container.bind<IStepService>(TYPES.StepService).to(StepService);
container.bind<IAssetService>(TYPES.AssetService).to(AssetService);
container.bind<IStorageService>(TYPES.StorageService).to(StorageService);
container.bind<IPublishingService>(TYPES.PublishingService).to(PublishingService);
container.bind<IAuthorizationService>(TYPES.AuthorizationService).to(AuthorizationService);
container.bind<IAssetUsageTracker>(TYPES.AssetUsageTracker).to(AssetUsageTracker);
container.bind<IAssetValidator>(TYPES.AssetValidator).to(AssetValidator);
container.bind<IHuntShareService>(TYPES.HuntShareService).to(HuntShareService);
container.bind<IPlayService>(TYPES.PlayService).to(PlayService);
container.bind<ICloneService>(TYPES.CloneService).to(CloneService);
container.bind<IPlayerInvitationService>(TYPES.PlayerInvitationService).to(PlayerInvitationService);
container.bind<IPreviewService>(TYPES.PreviewService).to(PreviewService);

container.bind<ITextValidationProvider>(TYPES.TextValidationProvider).to(GroqProvider).inSingletonScope();
container.bind<IAudioValidationProvider>(TYPES.AudioValidationProvider).to(GeminiProvider).inSingletonScope();
container.bind<IImageValidationProvider>(TYPES.ImageValidationProvider).to(GeminiProvider).inSingletonScope();
container.bind<IAIValidationService>(TYPES.AIValidationService).to(AIValidationService);

container.bind<IAIHuntGenerator>(TYPES.AIHuntGenerator).to(OpenAIHuntGenerator).inSingletonScope();
container.bind<IAIHuntGenerationService>(TYPES.AIHuntGenerationService).to(AIHuntGenerationService);
container.bind<IAIHuntGenerationController>(TYPES.AIHuntGenerationController).to(AIHuntGenerationController);

export { container };

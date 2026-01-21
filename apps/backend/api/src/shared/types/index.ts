export const TYPES = {
  AuthController: Symbol.for('AuthController'),
  HuntController: Symbol.for('HuntController'),
  StepController: Symbol.for('StepController'),
  AssetController: Symbol.for('AssetController'),
  PublishingController: Symbol.for('PublishingController'),
  HuntShareController: Symbol.for('HuntShareController'),
  PlayController: Symbol.for('PlayController'),
  CloneController: Symbol.for('CloneController'),
  PlayerInvitationController: Symbol.for('PlayerInvitationController'),
  PreviewController: Symbol.for('PreviewController'),

  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  HuntService: Symbol.for('HuntService'),
  HuntSaveService: Symbol.for('HuntSaveService'),
  StepService: Symbol.for('StepService'),
  AssetService: Symbol.for('AssetService'),
  StorageService: Symbol.for('StorageService'),
  PublishingService: Symbol.for('PublishingService'),
  AuthorizationService: Symbol.for('AuthorizationService'),
  HuntShareService: Symbol.for('HuntShareService'),
  CloneService: Symbol.for('CloneService'),
  AssetUsageTracker: Symbol.for('AssetUsageTracker'),
  AssetValidator: Symbol.for('AssetValidator'),
  PlayService: Symbol.for('PlayService'),
  PlayerInvitationService: Symbol.for('PlayerInvitationService'),
  PreviewService: Symbol.for('PreviewService'),

  TextValidationProvider: Symbol.for('TextValidationProvider'),
  AudioValidationProvider: Symbol.for('AudioValidationProvider'),
  ImageValidationProvider: Symbol.for('ImageValidationProvider'),

  AIValidationService: Symbol.for('AIValidationService'),

  AIHuntGenerator: Symbol.for('AIHuntGenerator'),
  AIHuntGenerationService: Symbol.for('AIHuntGenerationService'),
  AIHuntGenerationController: Symbol.for('AIHuntGenerationController'),
};

export interface ISerializer<TModel, TDTO> {
  toDTO(model: TModel): TDTO;
}

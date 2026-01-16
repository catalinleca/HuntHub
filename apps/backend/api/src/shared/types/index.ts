export const TYPES = {
  AuthController: Symbol.for('AuthController'),
  HuntController: Symbol.for('HuntController'),
  StepController: Symbol.for('StepController'),
  AssetController: Symbol.for('AssetController'),
  PublishingController: Symbol.for('PublishingController'),
  HuntShareController: Symbol.for('HuntShareController'),
  PlayController: Symbol.for('PlayController'),

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
  AssetUsageTracker: Symbol.for('AssetUsageTracker'),
  AssetValidator: Symbol.for('AssetValidator'),
  PlayService: Symbol.for('PlayService'),

  TextValidationProvider: Symbol.for('TextValidationProvider'),
  AudioValidationProvider: Symbol.for('AudioValidationProvider'),
  ImageValidationProvider: Symbol.for('ImageValidationProvider'),

  AIValidationService: Symbol.for('AIValidationService'),
};

export interface ISerializer<TModel, TDTO> {
  toDTO(model: TModel): TDTO;
}

export const TYPES = {
  AuthController: Symbol.for('AuthController'),
  HuntController: Symbol.for('HuntController'),
  StepController: Symbol.for('StepController'),
  AssetController: Symbol.for('AssetController'),

  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  HuntService: Symbol.for('HuntService'),
  StepService: Symbol.for('StepService'),
  AssetService: Symbol.for('AssetService'),
  StorageService: Symbol.for('StorageService'),
};

export interface ISerializer<TModel, TDTO> {
  toDTO(model: TModel): TDTO;
}

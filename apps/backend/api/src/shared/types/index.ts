export const TYPES = {
  AuthController: Symbol.for('AuthController'),
  HuntController: Symbol.for('HuntController'),
  StepController: Symbol.for('StepController'),

  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  HuntService: Symbol.for('HuntService'),
  StepService: Symbol.for('StepService'),
};

export interface ISerializer<TModel, TDTO> {
  toDTO(model: TModel): TDTO;
}

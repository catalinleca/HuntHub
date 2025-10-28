export const TYPES = {
  AuthController: Symbol.for('AuthController'),
  HuntController: Symbol.for('HuntController'),

  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  HuntService: Symbol.for('HuntService'),
};

export interface ISerializer<TModel, TDTO> {
  toDTO(model: TModel): TDTO;
}

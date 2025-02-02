export const TYPES = {
  UserService: Symbol.for('UserService'),
  HuntService: Symbol.for('HuntService'),
  HuntController: Symbol.for('HuntController'),
  HuntSerializer: Symbol.for('HuntSerializer'),
};

export interface ISerializer<TModel, TDTO> {
  toDTO(model: TModel): TDTO;
}

import { skipToken } from '@tanstack/react-query';

export function queryFnOrSkip<TParam, TResult>(
  fn: (p: TParam) => Promise<TResult>,
  param?: TParam | null,
): (() => Promise<TResult>) | typeof skipToken {
  const isValid = typeof param === 'number' ? param > 0 : param != null;

  return isValid ? () => fn(param as TParam) : skipToken;
}

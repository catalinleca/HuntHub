import { skipToken } from '@tanstack/react-query';

export function queryFnOrSkip<TParam, TResult>(
  fn: (p: TParam) => Promise<TResult>,
  param?: TParam | null,
): (() => Promise<TResult>) | typeof skipToken {
  return param != null ? () => fn(param) : skipToken;
}

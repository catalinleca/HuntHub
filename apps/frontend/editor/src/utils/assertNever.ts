export function assertNever(x: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${x}`);
}

import type { TSQuery } from './types';

export type TSQueryMethod = (this: TSQuery, ...args: any[]) => any;

const registry: Record<string, TSQueryMethod> = {};

export function register(name: string, fn: TSQueryMethod) {
  registry[name] = fn;
}

export function buildInstance($el: HTMLElement[]): TSQuery {
  const instance = { $el } as TSQuery;

  for (const [name, fn] of Object.entries(registry)) {
    // @ts-ignore
    instance[name] = fn;
  }

  return instance;
}

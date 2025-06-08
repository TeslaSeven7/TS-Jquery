import { register } from '../core/inject';
import type { TSQuery } from '../core/types';

export function forEach(this: TSQuery, callback: (el: HTMLElement, index: number) => void): void {
  this.$el.forEach(callback);
}
register('forEach', forEach);
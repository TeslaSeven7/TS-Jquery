import { register } from '../core/inject';
import type { TSQuery } from '../core/types';

export function each(this: TSQuery, callback: (el: HTMLElement, index: number) => void): TSQuery {
  this.$el.forEach((el, index) => callback(el, index));
  return this;
}

register('each', each);
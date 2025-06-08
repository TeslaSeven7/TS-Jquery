import { safeTSQuerySelectorAll } from './selector';
import { buildInstance } from './inject';

export function $(selector: string | HTMLElement | HTMLElement[]) {
  let $el: HTMLElement[];

  if (typeof selector === 'string') {
    $el = safeTSQuerySelectorAll(selector);
  } else if (selector instanceof HTMLElement) {
    $el = [selector];
  } else if (Array.isArray(selector)) {
    $el = selector;
  } else {
    throw new Error('Invalid selector');
  }

  return buildInstance($el);
}

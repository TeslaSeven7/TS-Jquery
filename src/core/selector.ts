export function safeTSQuerySelectorAll(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll(selector));
}
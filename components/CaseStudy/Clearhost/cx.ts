/** Join truthy class names — the SCSS-module stand-in for `clsx`/`cn`. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

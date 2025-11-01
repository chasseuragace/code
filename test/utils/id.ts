let counter = 0;

export function uniqueSuffix(prefix = ''): string {
  counter += 1;
  const ts = Date.now();
  return `${prefix}${ts}_${counter}`;
}

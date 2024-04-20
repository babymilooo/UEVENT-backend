export function removeUndefKeys(obj: object) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
}

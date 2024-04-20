export function objDataToString<T>(obj: T): { [P in keyof T]: string } {
  const newObj: { [P in keyof T]: string } = {} as { [P in keyof T]: string };
  for (const key in obj) {
    newObj[key] = (obj[key] as any).toString();
  }
  return newObj;
}

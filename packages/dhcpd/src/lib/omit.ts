const omit = <T extends object, K extends keyof T>(o: T | Readonly<T>, prop: K): Omit<T, K> => {
  const result = { ...o };
  delete result[prop];
  return result;
};

export default omit;

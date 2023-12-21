const isKeyOf = <T extends object>(key: PropertyKey, obj: T): key is keyof T =>
  key in obj;

export default isKeyOf;

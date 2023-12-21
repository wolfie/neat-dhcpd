const isDefined = <T>(t: T | undefined | null): t is T =>
  t !== null && typeof t !== "undefined";

export default isDefined;

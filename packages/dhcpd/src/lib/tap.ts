const tap =
  <T>(tapper: (value: T) => void) =>
  (value: T): T => {
    tapper(value);
    return value;
  };
export default tap;

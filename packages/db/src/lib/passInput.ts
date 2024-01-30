const passInputWithoutTracing =
  <T extends { input: any }, FN extends (arg: any) => any>( // eslint-disable-line @typescript-eslint/no-explicit-any
    fn: FN
  ) =>
  (t: T): ReturnType<FN> => {
    const clone = structuredClone(t.input);
    delete clone['remoteTracing'];
    return fn(clone);
  };

export default passInputWithoutTracing;

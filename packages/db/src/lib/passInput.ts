// TODO replace this with a function that takes a zod input, (optional zod output) and wraps it into a
// publicProcedure.input(WithTraceId(INPUT)).query(FN)
const passInputWithoutTracing =
  <T extends { input: any }, FN extends (arg: any) => any>( // eslint-disable-line @typescript-eslint/no-explicit-any
    fn: FN
  ) =>
  (t: T): ReturnType<FN> => {
    const clone = structuredClone(t.input);
    delete clone['remoteTracingId'];
    return fn(clone);
  };

export default passInputWithoutTracing;

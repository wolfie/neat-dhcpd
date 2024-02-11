export const ENV_NAME = 'LITEL_ENABLE';
const isEnabled = () => !!process.env[ENV_NAME];
export default isEnabled;

import getMacVendor from './getMacVendor';
import trpc from './trpcClient';

const getSeenMacs = async () => {
  const seenMacs = await trpc.seenMacs.getAll.query();
  return seenMacs.map((seenMac) => ({
    ...seenMac,
    vendor: getMacVendor(seenMac.mac),
  }));
};

export default getSeenMacs;

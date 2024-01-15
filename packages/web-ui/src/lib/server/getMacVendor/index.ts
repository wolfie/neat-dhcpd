import oui from './oui.csv';
import mam from './mam.csv';
import oui36 from './oui36.csv';

export type MacVendor = {
  Registry: string;
  Assignment: string;
  'Organization Name': string;
  'Organization Address': string;
};

const malCache: Record<string, MacVendor> = {};
const mamCache: Record<string, MacVendor> = {};
const masCache: Record<string, MacVendor> = {};

const MAC_KEY_LENGTH_MA_L = 6;
const MAC_KEY_LENGTH_MA_M = 7;
const MAC_KEY_LENGTH_MA_S = 9;

const createCaches = () => {
  if (
    Object.keys(malCache).length + Object.keys(mamCache).length + Object.keys(masCache).length >
    0
  ) {
    return;
  }

  console.log('creating MAC caches...');
  if (Object.keys(malCache).length === 0) {
    console.time('MA-L');
    (oui as Array<MacVendor>).forEach((vendor) => (malCache[vendor.Assignment] = vendor));
    console.timeEnd('MA-L');
  }

  if (Object.keys(mamCache).length === 0) {
    console.time('MA-M');
    (mam as Array<MacVendor>).forEach((vendor) => (mamCache[vendor.Assignment] = vendor));
    console.timeEnd('MA-M');
  }

  if (Object.keys(masCache).length === 0) {
    console.time('MA-S');
    (oui36 as Array<MacVendor>).forEach((vendor) => (masCache[vendor.Assignment] = vendor));
    console.timeEnd('MA-S');
  }
  console.log('done');
};

const getMacVendor = (mac: string): MacVendor | undefined => {
  createCaches();

  const cleanMac = mac.replaceAll(':', '').toUpperCase();
  return (
    masCache[cleanMac.substring(0, MAC_KEY_LENGTH_MA_S)] ??
    mamCache[cleanMac.substring(0, MAC_KEY_LENGTH_MA_M)] ??
    malCache[cleanMac.substring(0, MAC_KEY_LENGTH_MA_L)]
  );
};

export default getMacVendor;

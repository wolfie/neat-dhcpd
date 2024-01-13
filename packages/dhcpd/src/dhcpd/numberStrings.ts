type TypeOf<T extends Readonly<Array<Readonly<[number, string]>>>> = T[number][1];

export type Op = TypeOf<typeof OP>;
const OP = [
  [1, 'BOOTREQUEST'],
  [2, 'BOOTREPLY'],
] as const;

export type HType = TypeOf<typeof HTYPE>;
const HTYPE = [
  [1, 'Ethernet (10 Mb)'],
  [6, 'IEEE 802 Networks'],
  [7, 'ARCNET'],
  [11, 'LocalTalk'],
  [12, 'LocalNet (IBM PCNet or SYTEK LocalNET)'],
  [14, 'SMDS'],
  [15, 'Frame Relay'],
  [16, 'Asynchronous Transfer Mode (ATM)'],
  [17, 'HDLC'],
  [18, 'Fibre Channel'],
  [19, 'Asynchronous Transfer Mode (ATM)'],
  [20, 'Serial Line'],
] as const;

const DHCP_MESSAGE_TYPES = [
  [1, 'DHCPDISCOVER'],
  [2, 'DHCPOFFER'],
  [3, 'DHCPREQUEST'],
  [4, 'DHCPDECLINE'],
  [5, 'DHCPACK'],
  [6, 'DHCPNAK'],
  [7, 'DHCPRELEASE'],
  [8, 'DHCPINFORM'],
  [9, 'DHCPFORCERENEW'],
  [10, 'DHCPLEASEQUERY'],
  [11, 'DHCPLEASEUNASSIGNED'],
  [12, 'DHCPLEASEUNKNOWN'],
  [13, 'DHCPLEASEACTIVE'],
  [14, 'DHCPBULKLEASEQUERY'],
  [15, 'DHCPLEASEQUERYDONE'],
  [16, 'DHCPACTIVELEASEQUERY'],
  [17, 'DHCPLEASEQUERYSTATUS'],
  [18, 'DHCPTLS'],
] as const;

const forNumber =
  <const T extends Readonly<[number, string]>>(arr: Readonly<Array<T>>) =>
  (n: number): T[1] | undefined =>
    arr.find(([num]) => num === n)?.[1];
const forString =
  <const T extends Readonly<[number, string]>>(arr: Readonly<Array<T>>) =>
  (t: T[1]): T[0] =>
    arr.find(([_, str]) => str === t)![0];

export const forNumber__TESTING = forNumber;
export const forString__TESTING = forString;

export const opForNumber = forNumber(OP);
export const opForString = forString(OP);

export const htypeForNumber = forNumber(HTYPE);
export const htypeForString = forString(HTYPE);

export const messageTypesForNumber = forNumber(DHCP_MESSAGE_TYPES);
export const messageTypesForString = forString(DHCP_MESSAGE_TYPES);

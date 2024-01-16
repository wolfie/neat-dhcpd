import dgram from 'node:dgram';
import os from 'node:os';
import { splitBootpMessage } from './splitBootpMessage';
import { parseMessage } from './parseMessage';
import trpc from '../trpcClient';
import createResponse from './createResponse';
import isDefined from '../lib/isDefined';
import parseRequestMessage from './parseRequestMessage';
import encodeResponseMessage from './encodeResponseMessage';
import log from '../lib/log';
import { format } from 'node:util';
import { getBroadcastAddr, ipFromString, isLanIp } from '@neat-dhcpd/common';
import omit from '../lib/omit';

const hasPropWithValue =
  <T extends object, K extends keyof T, const V extends T[K]>(key: K, value: V) =>
  (obj: T): obj is T & Record<K, V> =>
    obj[key] === value;

const findCurrentIp = async () => {
  const configPromise = await trpc.config.get.query();
  const foundIpv4Addresses = Object.entries(os.networkInterfaces())
    .flatMap(
      ([nic, ifaces]) =>
        ifaces
          ?.filter(hasPropWithValue('family', 'IPv4'))
          .filter(hasPropWithValue('internal', false))
          .map((iface) => ({
            ...iface,
            address: ipFromString(iface.address)!,
            netmask: ipFromString(iface.netmask)!,
            nic,
          }))
          .filter((iface) => iface.address && iface.netmask)
    )
    .filter(isDefined);

  // eslint-disable-next-line functional/no-throw-statements
  if (foundIpv4Addresses.length === 0) throw new Error('No external IPv4 addresses found');

  const usedAddress =
    foundIpv4Addresses.find((addr) => addr.cidr === configPromise?.broadcast_cidr) ??
    foundIpv4Addresses.find((addr) => isLanIp(addr.address)) ??
    foundIpv4Addresses[0];

  log(
    'log',
    `Using ${usedAddress.address.str} with netmask ${usedAddress.netmask.str} from ${usedAddress.nic}`
  );
  return usedAddress;
};

export const createDhcpServer = async () => {
  const currentAddress = await findCurrentIp();

  const socket = dgram.createSocket({ type: 'udp4' });
  socket.on('message', async (msg, rinfo) => {
    const config = await trpc.config.get.query();
    if (!config) {
      log('error', 'No config found');
      return;
    }
    if (!config.broadcast_cidr) {
      log('error', 'No broadcast CIDR configured');
      return;
    }

    log('debug', { msg: msg.toString('base64') });
    const requestBootp = splitBootpMessage(msg);
    log('debug', { requestBootp: omit(requestBootp, '__original') });
    const messageParseResult = parseMessage(requestBootp);
    log('debug', { messageParseResult });
    if (!messageParseResult.success) return; // logged above, should be enough
    const requestParseResult = parseRequestMessage(messageParseResult.message);
    log('log', { requestParseResult, rinfo });
    if (!requestParseResult.success) return; // logged above, should be enough
    const request = requestParseResult.request;

    trpc.seenMacs.add.mutate({ mac: request.chaddr });

    const response = await createResponse(request, currentAddress, config);
    log('log', { response });

    if (!response.success) return;
    const responseBuffer = encodeResponseMessage(
      response.message,
      requestBootp,
      response.maxMessageLength
    );

    const broadcastAddress = getBroadcastAddr(config.broadcast_cidr);
    if (!broadcastAddress) {
      log('error', { error: 'Broadcast address is not a valid CIDR', config });
      return;
    }
    log('debug', { broadcastAddress });

    if (config.send_replies) {
      log('debug', `replying to ${broadcastAddress}:68: ${responseBuffer.toString('base64')}`);
      socket.send(
        responseBuffer,
        0,
        responseBuffer.length,
        68,
        broadcastAddress.str, // TODO send to CIADDR in case it's within our range
        (error, b) => {
          if (error) log('error', `${format(error)}\nbytes: ${b}`);
        }
      );
    } else {
      log('debug', 'not sending message, config.sendReplies is false');
    }
  });
  socket.on('listening', () => {
    socket.setBroadcast(true);
    const { address, port } = socket.address();
    log('log', `listening on ${address}:${port}`);
  });
  socket.on('error', (e) => {
    log('error', ['socket error', e]);
  });
  socket.bind(67);
};

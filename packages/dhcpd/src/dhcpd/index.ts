import type { RemoteInfo } from 'node:dgram';
import dgram from 'node:dgram';
import os from 'node:os';
import splitBootpMessage from './splitBootpMessage.js';
import parseMessage from './parseMessage.js';
import trpc from '../trpcClient.js';
import createResponse from './createResponse.js';
import isDefined from '../lib/isDefined.js';
import parseRequestMessage from './parseRequestMessage.js';
import encodeResponseMessage from './encodeResponseMessage.js';
import log from '../lib/log.js';
import { format } from 'node:util';
import { getBroadcastAddr, ipFromString, isLanIp } from '@neat-dhcpd/common';
import omit from '../lib/omit.js';
import { isParsedRequestOption } from './mapRequestOptions.js';
import { startTraceRoot } from '@neat-dhcpd/litel';

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
  const startupTrace = startTraceRoot('startup');
  const currentAddress = await findCurrentIp();

  const socket = dgram.createSocket({ type: 'udp4' });
  socket.on('message', async (msg: Buffer, rinfo: RemoteInfo) => {
    const trace = startTraceRoot('handleMessage');
    // eslint-disable-next-line functional/no-try-statements
    try {
      const config = await trpc.config.get.query();
      if (!config) {
        log('error', 'No config found', trace.id);
        return;
      }
      if (!config.broadcast_cidr) {
        log('error', 'No broadcast CIDR configured', trace.id);
        return;
      }

      log('debug', { msg: msg.toString('base64') }, trace.id);
      const requestBootp = trace.wrapCall(splitBootpMessage)(msg);
      log('debug', { requestBootp: omit(requestBootp, '__original') }, trace.id);
      const messageParseResult = trace.wrapCall(parseMessage)(requestBootp);
      log('debug', { messageParseResult }, trace.id);
      if (!messageParseResult.success) return; // logged above, should be enough
      const requestParseResult = trace.wrapCall(parseRequestMessage)(messageParseResult.message);
      log('log', { requestParseResult, rinfo }, trace.id);
      if (!requestParseResult.success) return; // logged above, should be enough
      const request = requestParseResult.request;

      trpc.seenMac.add.mutate({
        mac: request.chaddr,
        remoteTracing: { parentId: trace.id, system: trace.system },
      });
      const hostname = request.options.options.find(isParsedRequestOption(12))?.value;
      if (hostname)
        trpc.seenHostname.set.mutate({
          mac: request.chaddr,
          hostname,
          remoteTracing: { parentId: trace.id, system: trace.system },
        });

      const response = await createResponse(request, currentAddress, config, trace);
      log('log', { response }, trace.id);

      if (!response.success) return;
      const responseBuffer = trace.wrapCall(encodeResponseMessage)(
        response.message,
        requestBootp,
        response.maxMessageLength
      );

      const broadcastAddress = getBroadcastAddr(config.broadcast_cidr);
      if (!broadcastAddress) {
        log('error', { error: 'Broadcast address is not a valid CIDR', config }, trace.id);
        return;
      }
      log('debug', { broadcastAddress }, trace.id);

      if (config.send_replies) {
        log(
          'debug',
          `replying to ${broadcastAddress.str}:68: ${responseBuffer.toString('base64')}`,
          trace.id
        );
        socket.send(
          responseBuffer,
          0,
          responseBuffer.length,
          68,
          broadcastAddress.str, // TODO send to CIADDR in case it's within our range
          (error, b) => {
            if (error) log('error', `${format(error)}\nbytes: ${b}`, trace.id);
          }
        );
      } else {
        log('debug', 'not sending message, config.sendReplies is false', trace.id);
      }
    } finally {
      trace.end();
    }
  });
  socket.on('listening', () => {
    socket.setBroadcast(true);
    const { address, port } = socket.address();
    log('log', `listening on ${address}:${port}`, startupTrace.id);
    startupTrace.end();
  });
  socket.on('error', (e) => {
    log('error', ['socket error', e]);
  });
  socket.bind(67);
};

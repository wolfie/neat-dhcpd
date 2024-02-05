import trpc from '$lib/server/trpcClient';
import type { Actions, PageServerLoad } from './$types.js';
import os from 'node:os';
import type { IpString } from '@neat-dhcpd/common';
import { ipFromString, isLanIp } from '@neat-dhcpd/common';
import getPolledData from '$lib/server/getPolledData';
import { startTraceRoot } from '@neat-dhcpd/litel';

const IFACES = Object.entries(os.networkInterfaces()).flatMap(
  ([nic, ifaces]) =>
    ifaces
      ?.map((iface) => ({ ...iface, nic }))
      .filter(<T>(t: T | undefined): t is T => typeof t !== 'undefined')
      .filter(
        <T extends os.NetworkInterfaceInfo>(iface: T): iface is T & os.NetworkInterfaceInfoIPv4 =>
          iface.family === 'IPv4'
      )
      .filter((iface) => {
        const ip = ipFromString(iface.address);
        return ip && isLanIp(ip);
      }) ?? []
);

export const load: PageServerLoad = async () => {
  const trace = startTraceRoot('/:load');
  // eslint-disable-next-line functional/no-try-statements
  try {
    const [config, polledData, dnsIps] = await Promise.all([
      trpc.config.get.query({ remoteTracing: { parentId: trace.id, system: trace.system } }),
      getPolledData(trace),
      trpc.dhcpOption.get.query({
        option: 6,
        remoteTracing: { parentId: trace.id, system: trace.system },
      }),
    ]);

    return {
      config,
      ifaces: IFACES,
      dnsIps: (dnsIps ?? []) as IpString[],
      ...polledData,
    };
  } finally {
    trace.end();
  }
};

export const actions: Actions = {
  config: async (event) => {
    const trace = startTraceRoot('/:actions:config');
    // eslint-disable-next-line functional/no-try-statements
    try {
      const formdata = await event.request.formData();
      const ipStart = formdata.get('ipStart') as IpString;
      const ipEnd = formdata.get('ipEnd') as IpString;
      const leaseTimeMinutes = parseInt(formdata.get('leaseTimeMinutes') as string);
      const gatewayIp = formdata.get('gatewayIp') as IpString;
      const dns = formdata.get('dns') as string;
      const sendReplies = formdata.get('sendReplies') === 'on';
      const broadcastCidr = (formdata.get('broadcastCidr') as string) || null;
      const logLevel = formdata.get('logLevel') as 'log' | 'error' | 'debug';

      // TODO extract to separate action
      const dnsIps = dns.split(/\r\n|\n/) as IpString[];

      await Promise.all([
        trpc.config.set.mutate({
          ip_start: ipStart,
          ip_end: ipEnd,
          lease_time_minutes: leaseTimeMinutes,
          gateway_ip: gatewayIp,
          send_replies: sendReplies,
          broadcast_cidr: broadcastCidr,
          log_level: logLevel,
          remoteTracing: { parentId: trace.id, system: trace.system },
        }),
        trpc.dhcpOption.set.mutate({
          option: 6,
          value_json: JSON.stringify(dnsIps),
          remoteTracing: { parentId: trace.id, system: trace.system },
        }),
      ]);

      return { success: true };
    } finally {
      trace.end();
    }
  },

  aliases: async (event) => {
    const trace = startTraceRoot('/:actions:aliases');
    // eslint-disable-next-line functional/no-try-statements
    try {
      const formData = await event.request.formData();

      for (const [key, alias] of formData.entries()) {
        if (!key.startsWith('name:') || typeof alias !== 'string' || !alias) continue;
        const mac = key.substring(5);
        await trpc.alias.set.mutate({
          mac,
          alias,
          remoteTracing: { parentId: trace.id, system: trace.system },
        });
      }

      return { success: true };
    } finally {
      trace.end();
    }
  },
};

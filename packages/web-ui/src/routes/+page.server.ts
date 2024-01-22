import trpc from '$lib/server/trpcClient';
import type { Actions, PageServerLoad } from './$types';
import os from 'node:os';
import type { IpString } from '@neat-dhcpd/common';
import { ipFromString, isLanIp } from '@neat-dhcpd/common';
import getPolledData from '$lib/server/getPolledData';

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
  const [config, polledData] = await Promise.all([trpc.config.get.query(), getPolledData()]);

  return {
    config,
    ifaces: IFACES,
    ...polledData,
  };
};

export const actions: Actions = {
  config: async (event) => {
    const formdata = await event.request.formData();
    const ipStart = formdata.get('ipStart') as IpString;
    const ipEnd = formdata.get('ipEnd') as IpString;
    const leaseTimeMinutes = parseInt(formdata.get('leaseTimeMinutes') as string);
    const gatewayIp = formdata.get('gatewayIp') as IpString;
    const dns = formdata.get('dns') as string;
    const sendReplies = formdata.get('sendReplies') === 'on';
    const broadcastCidr = (formdata.get('broadcastCidr') as string) || null;
    const logLevel = formdata.get('logLevel') as 'log' | 'error' | 'debug';

    const [dns1, dns2, dns3, dns4] = dns.split(/\r\n|\n/, 4) as IpString[];

    await trpc.config.set.mutate({
      ip_start: ipStart,
      ip_end: ipEnd,
      lease_time_minutes: leaseTimeMinutes,
      gateway_ip: gatewayIp,
      dns1,
      dns2,
      dns3,
      dns4,
      send_replies: sendReplies,
      broadcast_cidr: broadcastCidr,
      log_level: logLevel,
    });

    return { success: true };
  },

  aliases: async (event) => {
    const formData = await event.request.formData();

    for (const [key, alias] of formData.entries()) {
      if (!key.startsWith('name:') || typeof alias !== 'string' || !alias) continue;
      const mac = key.substring(5);
      await trpc.alias.set.mutate({ mac, alias });
    }

    return { success: true };
  },
};

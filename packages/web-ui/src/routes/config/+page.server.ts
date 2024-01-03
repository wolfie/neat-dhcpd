// TODO get this again
import getMacVendor from "$lib/server/getMacVendor";
import trpc from "$lib/server/trpcClient";
import type { Actions, PageServerLoad } from "./$types";
import os from "node:os";

const IFACES = Object.entries(os.networkInterfaces()).flatMap(
  ([nic, ifaces]) =>
    ifaces
      ?.map((iface) => ({ ...iface, nic }))
      .filter(<T>(t: T | undefined): t is T => typeof t !== "undefined")
      .filter(
        <T extends os.NetworkInterfaceInfo>(
          iface: T
        ): iface is T & os.NetworkInterfaceInfoIPv4 => iface.family === "IPv4"
      )
      .filter(
        (iface) =>
          iface.address.startsWith("192.168.") ||
          iface.address.startsWith("10.") ||
          iface.address.startsWith("172.") // TODO: 172.16.0.0/12
      ) ?? []
);

export const load: PageServerLoad = async () => {
  const [config, aliases] = await Promise.all([
    trpc.configGet.query(),
    trpc.aliasesGet.query(),
  ]);

  return {
    config,
    aliases,
    ifaces: IFACES,
  };
};

export const actions: Actions = {
  config: async (event) => {
    const formdata = await event.request.formData();
    const ipStart = formdata.get(
      "ipStart"
    ) as `${number}.${number}.${number}.${number}`;
    const ipEnd = formdata.get(
      "ipEnd"
    ) as `${number}.${number}.${number}.${number}`;
    const leaseTimeMinutes = parseInt(
      formdata.get("leaseTimeMinutes") as string
    );
    const gatewayIp = formdata.get(
      "gatewayIp"
    ) as `${number}.${number}.${number}.${number}`;
    const dns1 = formdata.get(
      "dns1"
    ) as `${number}.${number}.${number}.${number}`;
    const dns2 = formdata.get(
      "dns2"
    ) as `${number}.${number}.${number}.${number}`;
    const dns3 = formdata.get(
      "dns3"
    ) as `${number}.${number}.${number}.${number}`;
    const dns4 = formdata.get(
      "dns4"
    ) as `${number}.${number}.${number}.${number}`;
    const sendReplies = formdata.get("sendReplies") === "on";
    const broadcastCidr = (formdata.get("broadcastCidr") as string) || null;

    await trpc.configSave.mutate({
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
    });

    return { success: true };
  },

  aliases: async (event) => {
    const formData = await event.request.formData();

    for (const [key, alias] of formData.entries()) {
      if (!key.startsWith("name:") || typeof alias !== "string" || !alias)
        continue;
      const mac = key.substring(5);
      await trpc.aliasSet.mutate({ mac, alias });
    }

    return { success: true };
  },
};

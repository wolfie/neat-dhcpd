import type { Config } from "@neat-dhcpd/db";
import type { Address } from "./createResponse";
import { getBroadcastAddr, ipFromString } from "../lib/ip";
import log from "../lib/log";

const createGetResponseOption =
  (serverAddress: Address, config: Config) =>
  (id: number): Buffer | undefined => {
    switch (id) {
      case 1:
        return serverAddress.netmask.buf;
      case 3:
        return ipFromString(config.gateway_ip)?.buf;
      case 6:
        return Buffer.concat([
          ipFromString(config.dns1)?.buf ?? Buffer.alloc(0),
          (config.dns2 && ipFromString(config.dns2)?.buf) || Buffer.alloc(0),
          (config.dns3 && ipFromString(config.dns3)?.buf) || Buffer.alloc(0),
          (config.dns4 && ipFromString(config.dns4)?.buf) || Buffer.alloc(0),
        ]); // TODO take into account if not multiple DNS configs
      case 15:
        return Buffer.from("NeatDhcpd", "ascii"); // TODO
      case 28:
        const ip_start = ipFromString(config.ip_start);
        if (!ip_start) {
          log("error", { message: "ip_start is not a valid ip", config });
          return undefined;
        }
        return getBroadcastAddr(serverAddress.netmask, ip_start).buf;
    }
    return undefined;
  };

export default createGetResponseOption;

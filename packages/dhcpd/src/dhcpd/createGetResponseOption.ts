import type { Config } from "packages/db/src/server";
import type { Address } from "./createResponse";
import pton4B from "../lib/pton4B";
import getBroadcastAddr from "../lib/getBroadcastAddr";

const createGetResponseOption =
  (serverAddress: Address, config: Config) => (id: number) => {
    switch (id) {
      case 1:
        return pton4B(serverAddress.netmask as any); // TODO fix as any
      case 3:
        return pton4B(config.gateway_ip);
      case 6:
        return Buffer.concat([
          pton4B(config.dns1),
          pton4B(config.dns2),
          pton4B(config.dns3),
          pton4B(config.dns4),
        ]); // TODO take into account if not multiple DNS configs
      case 15:
        return Buffer.from("NeatDhcpd", "ascii"); // TODO
      case 28:
        return pton4B(
          getBroadcastAddr(serverAddress.netmask as any, config.ip_start)
        );
    }
    return undefined;
  };

export default createGetResponseOption;

import type { DhcpMessage } from "./parseMessage";
import type { ParsedRequestOption } from "./mapRequestOptions";
import type { DhcpRequest } from "./parseRequestMessage";
import type { Config } from "packages/db/src/server";
import createOfferResponse from "./createOfferResponse";
import createAckResponse from "./createAckResponse";

export type ResponseResult =
  | {
      success: true;
      maxMessageLength: number;
      responseIp: string;
      message: DhcpResponse;
    }
  | {
      success: false;
      error: "no-type-option" | "no-ips-left" | "not-for-me";
    }
  | {
      success: false;
      error: "unhandled-type-option";
      id: ParsedRequestOption<53>["value"];
    }
  | {
      success: false;
      error: "requested-invalid-ip";
      requestedIp: string | undefined;
      offeredIp: string | undefined;
      leasedIp: string | undefined;
    };

export type DhcpResponse = Omit<DhcpMessage, "op" | "options"> & {
  op: "BOOTREPLY";
  options: {
    magicCookie: string;
    options: Array<[number, Buffer]>;
  };
};

export type Address = {
  address: `${number}.${number}.${number}.${number}`;
  netmask: string;
};

const createResponse = async (
  request: DhcpRequest,
  serverAddress: Address,
  config: Config
): Promise<ResponseResult> => {
  const typeOption = request.options.options.find(
    (o): o is ParsedRequestOption<53> =>
      o.isParsed && o.name === "DHCP Message Type"
  );
  if (!typeOption) return { success: false, error: "no-type-option" } as const;

  switch (typeOption.value) {
    case "DHCPDISCOVER":
      return createOfferResponse(request, serverAddress, config);
    case "DHCPREQUEST":
      return createAckResponse(request, serverAddress, config);
    default:
      return {
        success: false,
        error: "unhandled-type-option",
        id: typeOption.value,
      };
  }
};

export default createResponse;

import type { Config } from "packages/db/src/server";
import type { Address, ResponseResult } from "./createResponse";
import type { DhcpRequest } from "./parseRequestMessage";
import { isParsedRequestOption } from "./mapRequestOptions";
import { messageTypesForString } from "./numberStrings";
import tap from "../lib/tap";
import trpc from "../trpcClient";
import pton4I from "../lib/pton4I";
import pton4B from "../lib/pton4B";
import rand from "../lib/rand";
import ntop4 from "../lib/ntop4";
import createGetResponseOption from "./createGetResponseOption";
import log from "../lib/log";

const findFreeIpN = async (
  requestedAddress:
    | {
        mac: string;
        ip: { num: number; str: string };
      }
    | undefined,
  config: Config
) => {
  const ipStartN = pton4I(config.ip_start);
  const ipEndN = pton4I(config.ip_end);

  const reservedIps = await Promise.all([
    trpc.leasesGet
      .query()
      .then((leases) => leases.map((l) => ({ mac: l.mac, ip: l.ip }))),
    trpc.offersGet
      .query()
      .then((offers) => offers.map((o) => ({ mac: o.mac, ip: o.ip }))),
  ]).then(([leases, offers]) => leases.concat(offers));

  if (
    requestedAddress &&
    ipStartN <= requestedAddress.ip.num &&
    requestedAddress.ip.num <= ipEndN
  ) {
    const occupiedLease = reservedIps.find(
      (l) => l.ip === requestedAddress.ip.str
    );
    if (!occupiedLease || occupiedLease.mac === requestedAddress.mac) {
      return requestedAddress.ip.num;
    }
  }

  const reservedIpNs = reservedIps.map((l) => pton4I(l.ip));

  let candidate: number = rand(
    pton4I("169.254.0.0"),
    pton4I("169.254.255.255")
  );
  let triesLeft = 5000;
  for (; triesLeft > 0; triesLeft--) {
    candidate = rand(ipStartN, ipEndN);
    if (!reservedIpNs.includes(candidate)) break;
  }
  if (triesLeft <= 0) {
    return "no-ips-left" as const;
  }
  return candidate;
};

const DEFAULT_MAX_MESSAGE_LENGTH = 1500;

const createOfferResponse = async (
  request: DhcpRequest,
  serverAddress: Address,
  config: Config
): Promise<ResponseResult> => {
  if (
    request.options.options.find(isParsedRequestOption(53))?.value !==
    "DHCPDISCOVER"
  ) {
    throw new Error(
      "Unexpected option 53, expected DHCPDISCOVER: " + JSON.stringify(request)
    );
  }

  const clientIdentifier = (() => {
    const cid = request.options.options.find(isParsedRequestOption(61));
    return cid ? `${cid.value.type}:${cid.value.content}` : request.chaddr;
  })();

  const maxMessageLength =
    request.options.options.find(isParsedRequestOption(57))?.value ??
    DEFAULT_MAX_MESSAGE_LENGTH;

  const getOption = createGetResponseOption(serverAddress, config);

  const options =
    request.options.options
      .find(isParsedRequestOption(55))
      ?.value.map<[number, Buffer | undefined]>(({ id }) => [id, getOption(id)])
      .map(
        tap(
          (options) =>
            typeof options[1] === "undefined" &&
            log("debug", "unfulfilled requested option " + options[0])
        )
      )
      .filter((t): t is [number, Buffer] => typeof t[1] !== "undefined") ?? [];

  // TODO make sure option 1 is ordered before option 3

  options.unshift([53, Buffer.of(messageTypesForString("DHCPOFFER"))]);

  const leaseTimeSecs = Math.min(
    config.lease_time_minutes,
    request.options.options.find(isParsedRequestOption(51))?.value.seconds ??
      config.lease_time_minutes
  );

  options.push([51, Buffer.of(leaseTimeSecs)]);
  options.push([54, pton4B(serverAddress.address)]);
  options.push([255, Buffer.alloc(0)]);

  const requestedIp = request.options.options.find(
    isParsedRequestOption(50)
  )?.value;
  const offeredIp = await findFreeIpN(
    requestedIp ? { mac: request.chaddr, ip: requestedIp } : undefined,
    config
  );

  if (typeof offeredIp === "string")
    return { success: false, error: offeredIp };
  const offeredIpString = ntop4(offeredIp);

  await trpc.offerAdd.mutate({
    ip: offeredIpString,
    mac: request.chaddr,
    lease_time_secs: leaseTimeSecs,
  });

  return {
    success: true,
    maxMessageLength,
    responseIp:
      request.options.options.find(isParsedRequestOption(50))?.value.str ??
      "255.255.255.255",
    message: {
      op: "BOOTREPLY",
      htype: request.htype,
      hlen: request.hlen,
      hops: 0,
      xid: request.xid,
      secs: 0,
      broadcastFlag: false,
      ciaddr: "0.0.0.0",
      yiaddr: offeredIpString,
      siaddr: serverAddress.address,
      giaddr: "0.0.0.0",
      chaddr: request.chaddr,
      file: "",
      sname: "",
      options: {
        magicCookie: request.options.magicCookie,
        options,
      },
    },
  };
};

export default createOfferResponse;

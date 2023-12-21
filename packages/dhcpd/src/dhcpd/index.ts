import dgram from "node:dgram";
import os, { NetworkInterfaceInfoIPv4 } from "node:os";
import { splitBootpMessage } from "./splitBootpMessage";
import { parseMessage } from "./parseMessage";
import trpc from "../trpcClient";
import createResponse from "./createResponse";
import addressIsWithin from "../lib/addressIsWithin";
import isDefined from "../lib/isDefined";
import parseRequestMessage from "./parseRequestMessage";
import encodeResponseMessage from "./encodeResponseMessage";
import log from "../lib/log";
import { format } from "node:util";
import getBroadcastAddr from "../lib/getBroadcastAddr";

const hasPropWithValue =
  <T extends object, K extends keyof T, const V extends T[K]>(
    key: K,
    value: V
  ) =>
  (obj: T): obj is T & Record<K, V> =>
    obj[key] === value;

const isTen = addressIsWithin("10.0.0.0", "10.255.255.255");
const isOneSevenTwo = addressIsWithin("172.16.0.0", "172.31.255.255");
const isOneNineTwo = addressIsWithin("192.168.0.0", "192.168.255.255");

const hasIpString = <T extends NetworkInterfaceInfoIPv4>(
  iface: T
): iface is T & { address: `${number}.${number}.${number}.${number}` } =>
  /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(iface.address);

const findCurrentIp = () => {
  const foundIpv4Addresses = Object.entries(os.networkInterfaces())
    .flatMap(([nic, ifaces]) =>
      ifaces
        ?.filter(hasPropWithValue("family", "IPv4"))
        .filter(hasPropWithValue("internal", false))
        .filter(hasIpString)
        .map((iface) => ({ ...iface, nic }))
    )
    .filter(isDefined);

  if (foundIpv4Addresses.length === 0)
    throw new Error("No external IPv4 addresses found");
  // if (foundIpv4Addresses.length > 1) {
  //   console.log("Found multiple external IPv4 addresses:");
  //   foundIpv4Addresses.forEach((addr) =>
  //     console.log(`${addr.nic}: ${addr.address}`)
  //   );
  // }

  const usedAddress =
    foundIpv4Addresses.find(({ address }) => isOneNineTwo(address)) ??
    foundIpv4Addresses.find(({ address }) => isTen(address)) ??
    foundIpv4Addresses.find(({ address }) => isOneSevenTwo(address)) ??
    foundIpv4Addresses[0];
  log(
    "log",
    `Using ${usedAddress.address} with netmask ${usedAddress.netmask} from ${usedAddress.nic}`
  );
  return usedAddress;
};

// TODO support ENV override
// TODO combine CIDR config from db with this
const CURRENT_ADDRESS = findCurrentIp();

export const createDhcpServer = () => {
  const socket = dgram.createSocket({ type: "udp4" });
  socket.on("message", async (msg, rinfo) => {
    const config = await trpc.configGet.query();
    if (!config) {
      log("error", "No config found");
      return;
    }
    if (!config.broadcast_cidr) {
      log("error", "No broadcast CIDR configured");
      return;
    }

    log("debug", { msg: msg.toString("base64") });
    const requestBootp = splitBootpMessage(msg);
    log("debug", { requestBootp });
    const requestMessage = parseMessage(requestBootp);
    log("debug", { requestMessage });
    const request = parseRequestMessage(requestMessage);
    log("log", { request, rinfo });

    const response = await createResponse(request, CURRENT_ADDRESS, config);
    log("log", { response });

    if (!response.success) return;
    const responseBuffer = encodeResponseMessage(
      response.message,
      requestBootp,
      response.maxMessageLength
    );

    const broadcastAddress = getBroadcastAddr(
      config.broadcast_cidr as `${number}.${number}.${number}.${number}/${number}`
    );
    log("debug", { broadcastAddress });

    if (config.send_replies) {
      log(
        "debug",
        `replying to ${broadcastAddress}:68: ${responseBuffer.toString(
          "base64"
        )}`
      );
      socket.send(
        responseBuffer,
        0,
        responseBuffer.length,
        68,
        broadcastAddress, // TODO send to CIADDR in case it's within our range
        (error, b) => {
          if (error) log("error", `${format(error)}\nbytes: ${b}`);
        }
      );
    } else {
      log("debug", "not sending message, config.sendReplies is false");
    }
  });
  socket.on("listening", () => {
    socket.setBroadcast(true);
    const { address, port } = socket.address();
    log("log", `listening on ${address}:${port}`);
  });
  socket.on("error", (e) => {
    log("error", ["socket error", e]);
  });
  socket.bind(67, CURRENT_ADDRESS.address);
};

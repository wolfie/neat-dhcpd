import ntop4 from "./ntop4";
import pton4B from "./pton4B";

const netmaskAndIpFromCidr = (
  cidr: `${number}.${number}.${number}.${number}/${number}`
): {
  netmaskB: Buffer;
  ipAddress: `${number}.${number}.${number}.${number}`;
} => {
  const [_ipAddress, _netmaskLength] = cidr.split("/");
  const netmaskLength = parseInt(_netmaskLength);
  const netmaskNumber = parseInt(
    Array(netmaskLength).fill("1").join("").padEnd(32, "0"),
    2
  );
  const netmaskB = Buffer.alloc(4);
  netmaskB.writeUInt32BE(netmaskNumber);

  const ipAddress = _ipAddress as `${number}.${number}.${number}.${number}`;

  return { netmaskB, ipAddress };
};

function getBroadcastAddr(
  netmask: `${number}.${number}.${number}.${number}`,
  ipAddress: `${number}.${number}.${number}.${number}`
): `${number}.${number}.${number}.${number}`;
function getBroadcastAddr(
  cidr: `${number}.${number}.${number}.${number}/${number}`
): `${number}.${number}.${number}.${number}`;
function getBroadcastAddr(
  a:
    | `${number}.${number}.${number}.${number}`
    | `${number}.${number}.${number}.${number}/${number}`,
  b?: `${number}.${number}.${number}.${number}`
): `${number}.${number}.${number}.${number}` {
  const { netmaskB, ipAddress } = !b
    ? netmaskAndIpFromCidr(a as any)
    : {
        ipAddress: a as `${number}.${number}.${number}.${number}`,
        netmaskB: pton4B(b as `${number}.${number}.${number}.${number}`),
      };
  const inverse = netmaskB.map((n) => 255 - n);
  const ipAddressB = pton4B(ipAddress);
  const broadcast = ipAddressB.map(
    (n, i) => (n & netmaskB.readUint8(i)) | inverse[i]
  );
  return ntop4(Buffer.from(broadcast));
}

export default getBroadcastAddr;

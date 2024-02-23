import { ipFromNumber, type Ip, type IpString, ipFromString } from '@neat-dhcpd/common';
import rand from './rand.js';

const getRandomAvailableIp = ({
  unavailableIps,
  start,
  end,
}: {
  unavailableIps: IpString[];
  start: Ip;
  end: Ip;
}): Ip | 'no-ips-left' => {
  const unavailableIpNumbers = unavailableIps.map((ip) => ipFromString(ip).num);
  let candidate = rand(start.num, end.num);
  let triesLeft = 5000;

  // TODO This stops working if there are a lot of assigned IPs in a big IP range.
  // Instead, create a list of valid ips and pick one randomly.
  for (; triesLeft > 0; triesLeft--) {
    candidate = rand(start.num, end.num);
    if (!unavailableIpNumbers.includes(candidate)) break;
  }
  if (triesLeft <= 0) return 'no-ips-left';
  else return ipFromNumber(candidate);
};

export default getRandomAvailableIp;

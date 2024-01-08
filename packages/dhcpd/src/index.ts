import { createDhcpServer } from './dhcpd';

(async () => {
  console.log('Starting DHCP server');
  createDhcpServer();
})();

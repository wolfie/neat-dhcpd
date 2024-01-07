import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(__dirname, '../../.env') });

import { createDhcpServer } from './dhcpd';

(async () => {
  console.log('Starting DHCP server');
  createDhcpServer();
})();

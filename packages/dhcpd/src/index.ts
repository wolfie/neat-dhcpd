import { setCurrentSystem } from '@neat-dhcpd/litel';
import { createDhcpServer } from './dhcpd/index.js';

setCurrentSystem('dhcpd');

process.on('unhandledRejection', (reason) => {
  console.error(`Unhandled rejection ${reason ? `(reason: ${reason})` : ''}`);
});
process.on('uncaughtException', (e, origin) => {
  console.error('Uncaught exception', e, origin);
});

(async () => {
  console.log('Starting DHCP server');
  await createDhcpServer();
})();

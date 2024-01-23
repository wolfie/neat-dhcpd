import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@neat-dhcpd/db';
import * as z from 'zod';

const env = z
  .object({ TRPC_SERVER: z.string().default('http://localhost:3000') })
  .parse(process.env);

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: env.TRPC_SERVER,
      // TODO: gather and send trace ids automatically
    }),
  ],
});
console.log(`Using ${env.TRPC_SERVER} to connect with tRPC client`);

export default trpc;

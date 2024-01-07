import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@neat-dhcpd/db";

const trpc = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: "http://localhost:3000" })],
});

export default trpc;

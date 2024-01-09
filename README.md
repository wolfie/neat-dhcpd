# NeatDHCPD

"Neat" as in tidy, as in nice to use.

I made this because I wanted to assign known IPs to my home network, but all DHCP servers come bundled with an entire firewall ecosystem, and I didn't want it to be like that.

# Installing and Running

```bash
# get repo
> git clone https://github.com/wolfie/neat-dhcpd.git
> cd neat-dhcpd

# make sure we're running the expected Node version
> nvm install

# make sure `pnpm` is accessible
> corepack enable

# build the project
> pnpm install
> pnpm build

# on Linux, use autobind to run the application with current user, but on privileged ports
> ORIGIN=http://<server-address> ./startWithAuthbind.sh

# ...but on Windows, you can just run it no sweat
> pnpm start
```

## Why did you...?

### ...Deploy the sqlite behind trpc instead of a library?

Because I wanted to use Kysley, and it wants to use `better_sqlite3`, and SvelteKit (or Vite) doesn't want to bundle that. Since I can't import `@neat-dhcpd/db` as a library, I decided to do a low-effort-yet-typesafe separation.

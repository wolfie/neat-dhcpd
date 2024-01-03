# NeatDHCP

"Neat" as in tidy, as in nice to use.

I made this because I wanted to assign known IPs to my home network, but all DHCP servers come bundled with an entire firewall ecosystem, and I didn't want it to be like that.

## Why did you...?

### ...Deploy the sqlite behind trpc instead of a library?

Because I wanted to use Kysley, and it wants to use `better_sqlite3`, and SvelteKit (or Vite) doesn't want to bundle that. Since I can't import `@neat-dhcpd/db` as a library, I decided to do a low-effort-yet-typesafe separation.

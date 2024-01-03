# Things I might do but mainly offloaded from my brain

- sensible ENV configs (address and netmask)
- eslint & https://typescript-eslint.io/rules/consistent-type-imports/
- secure DB tRPC from non-localhost queries
- use client id instead of mac as primary key
- Check if trpc could talk over sockets instead of HTTP
- reintroduce aliases
- store hostname and vendor class identifiers as a fallback for aliases
- run migrations on startup
- add "log level" config, and don't write anything in e.g. debug
- make sure that db service runs first
- send DHCPNAK
- handle DHCPINFO
- define IP from app?
- add Zod typings to DB level
- common package for things like `ip.ts` etc
- support other MAC formats than just ':'-separated
- broadcast DHCP replies to any and all interfaces, instead of asking for a specific NIC?

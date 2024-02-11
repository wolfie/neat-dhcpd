# Things I might do but mainly offloaded from my brain

## BUGS!

- BUG: last character might be missed when adding new devices

## Missing functionality for 1.0

- disable `@neat-dhpcd/litel` by default, and enable with some simple trick (env var?)
- "remove" button for devices that haven't been seen
- refresh list after adding a new device
- validate MAC strings
- handle DHCPINFORM
- handle DHCPRELEASE
- rename "send replies" to something more understandable
- rename "sugmit" to "submit"

## MAC address handling

- support other MAC formats than just `:`-separated
- make MAC addresses case insensitive
- make a MAC input template (autofill the separators)

## Misc

- sensible ENV configs (address and netmask)
- secure DB tRPC from non-localhost queries
- authentication and authorization
- use client id instead of mac as primary key
- define IP from app?
- add Zod typings to DB level
- broadcast DHCP replies to any and all interfaces, instead of asking for a specific NIC?
- responsive design (for mobile phone)
- add mDNS for easy access to aliased computers
- either fix the "report db errors into db" bug, or remove it completely
- option to clean up log after some time
- download "all" configs as json (at least aliases + reserved ips)
- don't crash if client can't connect to `@neat-dhpcd/litel` server
- remove unnecessary `system` param from remote tracking
- make a functional wrapper for `@neat-dhpcd/litel` to avoid try/catch
- make an even more automated version of `buildRelease.sh` - less manual steps after building

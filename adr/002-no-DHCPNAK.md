# Avoid implementing DHCPNAK (for now)

It seems like implementing [DHCPNAK](https://datatracker.ietf.org/doc/html/rfc2131#page-14) is at best marginally helpful, but at worst confusing for the clients. It looks like clients will keep on asking for new IPs as long as they don't get a proper DHCPOFFER/DHCPACK, so sending DHCPNAK explicitly doesn't really give a lot of benefits.

This isn't a decision to never implement it, but for now it is more risk than reward, and that's why it's not being implemented.

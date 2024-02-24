_This supersedes `002-no-DHCPNAK.md`_

# Send DHCPNAK when client requests bad IP

It seemed like (didn't verify) a client was misbehaving, as it was constantly asking for an IP outside of the allocated IP range. Many clients give up after a few tries and revert back to `DHCPDISCOVER`, but not this one.

So, I implemented `DHCPNAK` against previous thoughts, in the hopes of the client getting happy with an explicit reply. Again, didn't verify, but nothing has broken quite yet.

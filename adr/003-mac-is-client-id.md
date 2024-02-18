# No support for option 61 client identifier (for now)

This is an explicit decision to use the MAC address as the client identifier, instead of trying to follow [the RFC](https://datatracker.ietf.org/doc/html/rfc2132#section-9.14) closer. This is not to say that there would be an anti-client-id decision, but rather "it's good enough for now".

If the future shows that it would be beneficial to follow the RFC closer, then those modifications can be made, but this is more of an explicit decision to do so.

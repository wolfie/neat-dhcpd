### Nonfunctional

DO NOT USE - ABANDONED PROJECT. For some unresearched reason, some clients are not happy with the packets sent by the server, and start soon enough spamming the server with a constant stream of requests over and over again.

# NeatDHCPD

"Neat" as in tidy, as in nice to use.

I made this because I wanted to assign known IPs to my home network, but all DHCP servers come bundled with an entire firewall ecosystem, and I didn't want it to be like that.

## ⚠️ In development ⚠️

A lot of wild development is being done atm until the project is getting its 1.0.0 MVP status (see `TODO.md` for more info on this). Moderate efforts are being done to keep changes backwards compatible, but if things break, it's best to just delete the `db.sqlite` file and start from scratch for now.

## Installing and Running

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
> ./startWithAuthbind.sh

# ...but on Windows, you can just run it no sweat
> node start.js
```

## Litel o11y

You can see some timing traces if you set the environment variable `LITEL_ENABLE=1` when running the application, and then open `http://<server-ip>:12346` in your browser.

## ⚠️ Use static IP for server

Note that you must have a static IP configured for the host server, otherwise the clients cannot reach the server and your entire network will go down due to not having an IP.

## ⚠️ Won't build on a RPi 3

It seems like the Raspberry Pi 3b+ is unable to build the web UI without grinding to a halt. Presumably this is due to lack of sufficient RAM. I have not tested on a RPi4 2gb (or better) yet.

**However!** You can run `./buildRelease.sh` on a _more capable_ machine to build the project then copy the result over to a Raspberry.

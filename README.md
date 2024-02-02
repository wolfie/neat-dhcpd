# NeatDHCPD

"Neat" as in tidy, as in nice to use.

I made this because I wanted to assign known IPs to my home network, but all DHCP servers come bundled with an entire firewall ecosystem, and I didn't want it to be like that.

## ⚠️ In development ⚠️

A lot of wild development is being done atm until the project is getting its 1.0.0 MVP status. Moderate efforts are being done to keep changes backwards compatible, but if things break, it's best to just delete the `db.sqlite` file and start from scratch for now.

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

You can see some timing traces if you open `http://<server-ip>:12346`.

## ⚠️ Won't build on a RPi 3

It seems like the Raspberry Pi 3b+ is unable to build the web UI without grinding to a halt. Presumably this is due to lack of sufficient RAM. I have not tested on a RPi4 2gb (or better) yet.

**However!** You can run `./buildRelease.sh` on a _more capable_ machine to build the project then copy the result over to a Raspberry.

## Why did you...?

### ...Deploy the sqlite behind trpc instead of a library?

Because I wanted to use Kysley, and it wants to use `better_sqlite3`, and SvelteKit (or Vite) doesn't want to bundle that. Since I can't import `@neat-dhcpd/db` as a library, I decided to do a low-effort-yet-typesafe separation.

#!/bin/sh
set -e

docker build -f Dockerfile.builder -t neat-dhcpd-builder .
docker run -d --name neat-dhcpd-build neat-dhcpd-builder
docker cp neat-dhcpd-build:/build.tar.bz2 .
docker stop neat-dhcpd-build && docker rm neat-dhcpd-build

echo
echo "NEXT STEPS:"
echo "1: ssh <user>@<server> 'mkdir neat-dhcpd'  # ...if dir doesn't exist yet"
echo "2: scp build.tar.bz2 <user>@<server>:~/neat-dhcpd"
echo "3: ssh <user>@<server>"
echo "4: cd neat-dhcpd && tar -xzf build.tar.bz2 && cd build"
echo "5: pnpm i -P --frozen-lockfile"
echo "(optional) 6: tmux  # ...or some other command, like screen"
echo "either: 7a: node start"
echo "or 7b: ./startWithAuthbind.sh"

#!/bin/sh
set -e

TARGET="build"

echo
echo "Clearing directory: $TARGET"
rm -rf $TARGET

echo
echo "Recreating : $TARGET"
mkdir -v $TARGET

echo
echo "Copying main project files"
cp -v \
  .nvmrc \
  package.json \
  pnpm-lock.yaml \
  pnpm-workspace.yaml \
  start.js \
  start.waitOnDb.js \
  startWithAuthbind.sh \
  $TARGET

echo
echo "Building project"
pnpm build

COMMON="packages/common"
echo
echo "Creating Common directory"
mkdir -vp "$TARGET/$COMMON"
echo
echo "Copying Common files"
cp -vr \
  "$COMMON/build" \
  "$COMMON/package.json" \
  "$TARGET/$COMMON"

LITEL="packages/litel"
echo
echo "Creating litel directory"
mkdir -vp "$TARGET/$LITEL"
echo
echo "Copying litel files"
cp -vr \
  "$LITEL/build" \
  "$LITEL/package.json" \
  "$TARGET/$LITEL"

DB="packages/db"
echo
echo "Creating DB directory"
mkdir -vp "$TARGET/$DB"
echo
echo "Copying DB files"
cp -vr \
  "$DB/build" \
  "$DB/.env" \
  "$DB/package.json" \
  "$TARGET/$DB"

DHCPD="packages/dhcpd"
echo
echo "Creating DHCPD directory"
mkdir -vp "$TARGET/$DHCPD"
echo
echo "Copying DHCPD files"
cp -vr \
  "$DHCPD/build" \
  "$DHCPD/.env" \
  "$DHCPD/package.json" \
  "$TARGET/$DHCPD"

WEBUI="packages/web-ui"
echo
echo "Creating web UI directory"
mkdir -vp "$TARGET/$WEBUI"
echo
echo "Copying web UI files"
cp -vr \
  "$WEBUI/build" \
  "$WEBUI/.env" \
  "$WEBUI/package.json" \
  "$TARGET/$WEBUI"
COMMIT_SHA="$(git rev-parse HEAD)"
echo "Appending $TARGET/$WEBUI/.env: GIT_COMMIT_SHA=$COMMIT_SHA"
echo "GIT_COMMIT_SHA=$COMMIT_SHA" >> $TARGET/$WEBUI/.env

echo
echo "Compressing build.tar.bz2"
tar -czf build.tar.bz2 build
echo "done!"
ls -lha build.tar.bz2

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

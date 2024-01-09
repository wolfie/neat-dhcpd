#!/bin/sh

command -v authbind >/dev/null 2>&1 || { echo >&2 "I require authbind but it's not installed.  Aborting."; exit 1; }

echo "Creating /etc/authbind/byport/80 with chown $USER and chmod 700"
sudo touch /etc/authbind/byport/80 && sudo chmod 700 /etc/authbind/byport/80 && sudo chown $USER /etc/authbind/byport/80

echo "Creating /etc/authbind/byport/67 with chown $USER and chmod 700"
sudo touch /etc/authbind/byport/67 && sudo chmod 700 /etc/authbind/byport/67 && sudo chown $USER /etc/authbind/byport/67

authbind --deep pnpm start

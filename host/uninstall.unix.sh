#!/bin/sh
# Copyright 2013 The Chromium Authors. All rights reserved.
# https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/mv2-archive/api/nativeMessaging/host/uninstall_host.sh

set -e

if [ "$(uname -s)" = "Darwin" ]; then
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR="/Library/Google/Chrome/NativeMessagingHosts"
  else
    TARGET_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
  fi
else
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR="/etc/opt/chrome/native-messaging-hosts"
  else
    TARGET_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
  fi
fi

HOST_NAME=com.daijro.clipboard2file
rm "$TARGET_DIR/com.daijro.clipboard2file.json"
echo "Native messaging host $HOST_NAME has been uninstalled."

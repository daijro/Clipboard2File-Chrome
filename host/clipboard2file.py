#!/usr/bin/env -S python3 -u
# Based on https://github.com/guest271314/chrome-extensions-samples/blob/guest271314-patch-1/api/nativeMessaging/native_messaging_example_host_python.py
# NOTE: Running python with the `-u` flag is required to ensure that stdin/stdout are unbuffered

import sys
import json
import struct
from PIL import ImageGrab
import base64
from io import BytesIO
import json
from pyperclip import copy

buffered = BytesIO()

# Read a message from stdin and decode it
def getMessage():
    rawLength = sys.stdin.buffer.read(4)
    if not rawLength:
        sys.exit(0)
    messageLength = struct.unpack('@I', rawLength)[0]
    message = sys.stdin.buffer.read(messageLength).decode('utf-8')
    return json.loads(message)

# Encode message for transmission
def encodeMessage(messageContent):
    encodedContent = json.dumps(messageContent).encode('utf-8')
    encodedLength = struct.pack('@I', len(encodedContent))
    return {'length': encodedLength, 'content': encodedContent}

# Send message to stdout
def sendMessage(encodedMessage):
    sys.stdout.buffer.write(encodedMessage['length'])
    sys.stdout.buffer.write(encodedMessage['content'])
    sys.stdout.buffer.flush()

try:
    while True:
        receivedMsg = getMessage()['message']
        # Ping pong
        if receivedMsg == "ping":
            sendMessage(encodeMessage({"message": "pong"}))
        # Clear clipboard
        elif receivedMsg == "clear":
            copy('') 
            sendMessage(encodeMessage({"message": "cleared"}))
        elif receivedMsg == "get":
            # If image in clipboard
            if img := ImageGrab.grabclipboard():
                img.save(buffered, format="PNG")
                img_str = f'data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode()}'
                sendMessage(encodeMessage({'type': 'modal', 'clipboardImageB64': img_str}))
            # Else return file picker request
            else:
                sendMessage(encodeMessage({'type': 'decoyPicker'}))

except Exception as e:
    sys.stdout.buffer.flush()
    sys.stdin.buffer.flush()
    sys.exit()
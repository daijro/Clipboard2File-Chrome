#!/usr/bin/env -S python3 -u
# Based on https://github.com/guest271314/chrome-extensions-samples/blob/guest271314-patch-1/api/nativeMessaging/native_messaging_example_host_python.py
# NOTE: Running python with the `-u` flag is required to ensure that stdin/stdout are unbuffered

import base64
import struct
import sys
from io import BytesIO
import imghdr

import orjson
from PIL import Image, ImageGrab
from pyperclip import copy

buffered = BytesIO()


# Read a message from stdin and decode it
def getMessage() -> dict:
    rawLength = sys.stdin.buffer.read(4)
    if not rawLength:
        sys.exit(0)
    messageLength = struct.unpack('@I', rawLength)[0]
    message = sys.stdin.buffer.read(messageLength)
    return orjson.loads(message)


# Encode message for transmission
def encodeMessage(messageContent) -> dict:
    encodedContent = orjson.dumps(messageContent)
    encodedLength = struct.pack('@I', len(encodedContent))
    return {'length': encodedLength, 'content': encodedContent}


# Send message to stdout
def sendMessage(encodedMessage) -> None:
    sys.stdout.buffer.write(encodedMessage['length'])
    sys.stdout.buffer.write(encodedMessage['content'])
    sys.stdout.buffer.flush()


def buildImgStr(img_obj: Image.Image) -> str:
    img_obj.save(buffered, format="PNG")
    return f'data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode()}'


# Get image from clipboard
# Or the first image in a list of files
def getImg() -> None:
    # Fetch clipboard
    clip = ImageGrab.grabclipboard()
    # If clipboard was a copied image
    if isinstance(clip, Image.Image):
        sendMessage(encodeMessage({'type': 'modal', 'clipboardImageB64': buildImgStr(clip)}))
    # If clipboard contained a list of files
    elif isinstance(clip, list):
        # For every file in the list
        for file in clip:
            if not imghdr.what(file):
                continue
            # Save the image as png to the buffer
            img = Image.open(file)
            sendMessage(encodeMessage({'type': 'modal', 'clipboardImageB64': buildImgStr(img)}))
            return
        sendMessage(encodeMessage({'type': 'decoyPicker'}))
    # Else return file picker request
    else:
        sendMessage(encodeMessage({'type': 'decoyPicker'}))


def handleMsg(receivedMsg: str) -> None:
    match receivedMsg:
        # Ping pong
        case "ping":
            return sendMessage(encodeMessage({"message": "pong"}))
        # Clear clipboard
        case "clear":
            copy('')
            return sendMessage(encodeMessage({"message": "cleared"}))
        case "get":
            return getImg()
            

try:
    while True:
        handleMsg(getMessage()['message'])
except Exception as e:
    sys.stdout.buffer.flush()
    sys.stdin.buffer.flush()
    sys.exit()

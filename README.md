<h1>
  <sub>
    <img
      src="https://raw.githubusercontent.com/vord1080/clipboard2file/main/icons/clipboard2file.png"
      height="38"
      width="38"
    />
  </sub>
  Clipboard2File for Chrome
  </a>
</h1>

A fork of Clipboard2File for Chromium-based browsers.

<div align="center">
<img src="https://i.imgur.com/qvW3Pqb.png">
</div>

<p align="center">Clipboard2File is a tiny extension that lets you use an image on your clipboard as a file!</p>

---

# Install

The installation process is split into two pieces. The **[Chromium extension](https://github.com/daijro/Clipboard2File-Chrome/tree/master/app)**, and the **[Companion](https://github.com/daijro/Clipboard2File-Chrome/tree/master/host)**.

The Companion uses Chrome's [Native Messaging API](https://developer.chrome.com/docs/apps/nativeMessaging/) to gather clipboard images externally to the browser ([See #1](https://github.com/daijro/Clipboard2File-Chrome/issues/1#issue-1395351950)). It only runs when called by Chrome, not on startup. It also does not require admin/root privileges to install.

## Installing the Extension

To install the extension, simply go to [releases](https://github.com/daijro/Clipboard2File-Chrome/releases) and click the latest **.crx** file under Assets. Your browser should prompt to install the extension.

## Installing the Companion

*Note*: The Companion only has to be installed per system. It runs universally across any Chromium-based browser with the Clipboard2File extension installed.

To install from source code, download the repository and go to the hosts folder. There are setup scripts included to automatically register the native messaging host on your system. Instructions are provided below.

### Windows Installer

Windows users can simply download and run the [installer](https://github.com/daijro/Clipboard2File-Chrome/releases) to automatically register the Clipboard2File native messaging host. It can also be uninstalled in Control Panel.

<img src="https://user-images.githubusercontent.com/72637910/196106857-734814fb-52a1-4b06-a366-5240ae5aabb9.png" width=300>


### Windows

1. Install [Python 3.x](https://www.python.org/downloads/)

2. In the setup, check *Add python.exe to PATH*

3. Finish the setup

4. Download and extract a copy of the repo [here](https://github.com/daijro/Clipboard2File-Chrome/archive/refs/heads/master.zip).

5. Navigate to `Clipboard2File-Chrome-master` > `host` and open Command Prompt there.

6. Run the following command: `pip install -r requirements.txt`.

7. Now, open `install-global.win.bat` to install for the machine, or `install-user.win.bat` to install for the current user.

To uninstall, run `uninstall.win.bat`.

### MacOS / Linux

1. Open a terminal

2. Run the following commands:
> ```bash
> git clone https://github.com/daijro/Clipboard2File-Chrome
> cd Clipboard2File-Chrome/host
> pip3 install -r requirements.txt
> sh ./install.unix.sh








<hr width=50>

### Original project

<a href="https://addons.mozilla.org/addon/clipboard2file/"
    ><img
      height="50px"
      src="https://i.imgur.com/2jJOtTI.png"
      alt="Get Clipboard2File for Firefox"
  /></p>

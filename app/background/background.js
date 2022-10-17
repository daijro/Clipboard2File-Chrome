function checkNativeMessagingHost() {
  if (typeof chrome.runtime.lastError === "undefined" || chrome.runtime.lastError.message.indexOf("not found") === -1) {
    return true;
  }
  chrome.tabs.create({url: chrome.runtime.getURL("content/companionError.html")});
  return false;
}

chrome.runtime.onInstalled.addListener((e) => {
  // Workaround to keep extension validated
  console.log(e, chrome.runtime.getManifest());
  // Check if Native Messaging Host is installed
  chrome.runtime.sendNativeMessage(
    "com.daijro.clipboard2file", {
      type: "ping"
    },
    () => {
      if (checkNativeMessagingHost()) {
        console.log('Native Messaging Host is installed!');
      }
    }
  );
});

chrome.runtime.onMessage.addListener((data, sender) => {
  switch (data.type) {
    case "click":
      return chrome.runtime.sendNativeMessage(
        'com.daijro.clipboard2file', {
          message: 'get',
        },
        (respData) => {
          if (!checkNativeMessagingHost()) {
            console.log('Native Messaging Host not found.');
            var respData = {type: "decoyPicker"}
          }
          switch (respData.type) {
            case "modal":  // Send to parent frame
              return chrome.tabs.sendMessage(sender.tab.id, {
                type: "modal",
                frameId: sender.frameId,
                tabId: sender.tab.id,
                inputAttributes: data.inputAttributes,
                token: data.token,
                clipboardImageB64: respData.clipboardImageB64,
              });
            case "decoyPicker":  // Send to specific frame
              return chrome.tabs.sendMessage(sender.tab.id, {
                type: "decoyPicker",
                token: data.token,
                inputAttributes: data.inputAttributes,
              }, {frameId: sender.frameId});
          }
        }
      );
    case "clear":
      return chrome.runtime.sendNativeMessage(
        'com.daijro.clipboard2file', {
          message: "clear",
        },
      )
    case "file":
      return chrome.tabs.sendMessage(
        sender.tab.id, {
          type: "fileChanged",
          token: data.token,
          filename: data.filename,
          fileb64: data.fileb64
        },
        {frameId: data.frameId}
      );
    case "picker":
      return chrome.tabs.sendMessage(
        sender.tab.id, {
          type: "decoyPicker",
          token: data.token,
          inputAttributes: data.inputAttributes
        },
        {frameId: data.frameId}
      );
    default:
      return false;
  }
});

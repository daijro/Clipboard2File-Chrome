chrome.runtime.onMessage.addListener((data, sender) => {
  switch (data.type) {
    case "click":
      return chrome.tabs.sendMessage(sender.tab.id, {
        type: "modal",
        frameId: sender.frameId,
        tabId: sender.tab.id,
        inputAttributes: data.inputAttributes,
        token: data.token,
        clipboardImageB64: data.clipboardImageB64,
      });
    case "file":
      return chrome.tabs.sendMessage(sender.tab.id, {
        type: "fileChanged",
        token: data.token,
        filename: data.filename,
        fileb64: data.fileb64
      }, {frameId: data.frameId});
    case "picker":
      return chrome.tabs.sendMessage(sender.tab.id, {
        type: "decoyPicker",
        token: data.token,
        inputAttributes: data.inputAttributes
      }, {frameId: data.frameId});
    default:
      return false;
  }
});

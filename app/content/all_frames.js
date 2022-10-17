let token;
let clicked;

async function handleClick(event) {
  if (event.target.matches("input[type=file]:not([webkitdirectory])")) {
    event.preventDefault();

    token = crypto.randomUUID();
    clicked = event.target;

    const inputAttributes = {};
    
    for (attr of event.target.attributes) {
      inputAttributes[attr.name] = {name: attr.name, value: attr.value};
    }
    chrome.runtime.sendMessage({type: "click", token, inputAttributes});
  }
}

window.addEventListener("click", handleClick);

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), 
      n = bstr.length, 
      u8arr = new Uint8Array(n);
  while (n--) {u8arr[n] = bstr.charCodeAt(n)}
  return new File([u8arr], filename, {type:mime});
}

function changeFile(dataTransfer) {
  clicked.files = dataTransfer.files;
  clicked.dispatchEvent(new Event("input", { bubbles: true }));
  clicked.dispatchEvent(new Event("change", { bubbles: true }));
}

chrome.runtime.onMessage.addListener((data, sender) => {
  switch (data.type) {
    case "fileChanged":
      if (token === data.token) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(dataURLtoFile(data.fileb64, data.filename));
        changeFile(dataTransfer);
      }
      break;
    case "decoyPicker":
      if (token === data.token) {
        const decoyInput = document.createElement("input");
        for (const attr of ["accept", "capture", "multiple", "type", "webkitdirectory"]) {
          if (data.inputAttributes[attr]) decoyInput.setAttribute(data.inputAttributes[attr].name, data.inputAttributes[attr].value);
        }
        decoyInput.addEventListener("change", (e) => changeFile(e.target), { once: true });
        decoyInput.showPicker();
      }
      break;
    default:
      return false;
  }
});

// Add the stopPropagation hook
var s = document.createElement('script');
s.src = chrome.runtime.getURL('content/event_fix.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

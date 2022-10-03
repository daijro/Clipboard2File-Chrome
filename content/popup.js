export async function popup(data) {
  const [shadowStyleRequest, iframeRequest, iframeStyleRequest] = await Promise.all([
    fetch(chrome.runtime.getURL('content/shadow.css')),
    fetch(chrome.runtime.getURL('content/popup.html')),
    fetch(chrome.runtime.getURL('content/popup.css')),
  ]);
  const settings = {}
  for (const settingName of ["clearOnPaste", "defaultFilename", "showFilenameBox"]) {
    await chrome.storage.local.get([settingName], function(data) {
      settings[settingName] = data[settingName];
    });
  }

  const { clipboardImageB64, token, inputAttributes, frameId, tabId } = data;

  // Convert base64 image back to a blob
  // const clipboardImage = await fetch(clipboardImageB64).then(r => r.blob());

  const aside = document.createElement("aside");
  const iframe = document.createElement("iframe");
  const dialog = document.createElement("dialog");
  const root = document.createElement("div");

  const shadow = aside.attachShadow({ mode: "closed" });

  const shadowStyleElement = document.createElement("style");
  shadowStyleElement.textContent = await shadowStyleRequest.text();

  shadow.appendChild(shadowStyleElement);
  shadow.append(dialog);

  iframe.srcdoc = await iframeRequest.text();
  dialog.append(root);
  root.appendChild(iframe);

  dialog.addEventListener(
    "mouseover",
    (mouseover) => {
      if (mouseover.clientX + window.visualViewport.pageLeft < window.visualViewport.width * window.visualViewport.scale + window.visualViewport.pageLeft - modalWidth) {
        root.style.setProperty("--posX", `${(100 * mouseover.clientX) / (window.visualViewport.width * window.visualViewport.scale)}%`);
      } else {
        root.style.setProperty("--posX", `${(100 * (window.visualViewport.width * window.visualViewport.scale - modalWidth)) / (window.visualViewport.width * window.visualViewport.scale)}%`);
      }

      if (mouseover.clientY + window.visualViewport.pageTop < window.visualViewport.height * window.visualViewport.scale + window.visualViewport.pageTop - modalHeight) {
        root.style.setProperty("--posY", `${(100 * mouseover.clientY) / (window.visualViewport.height * window.visualViewport.scale)}%`);
      } else {
        root.style.setProperty("--posY", `${(100 * (mouseover.clientY - modalHeight)) / (window.visualViewport.height * window.visualViewport.scale)}%`);
      }
    },
    { once: true }
  );

  const modalWidth = 250 / window.devicePixelRatio;
  const modalHeight = 200 / window.devicePixelRatio;

  const controller = new AbortController();
  const signal = controller.signal;

  document.documentElement.appendChild(aside);

  dialog.showModal();

  await new Promise((resolve) => iframe.contentWindow.addEventListener("DOMContentLoaded", resolve, { once: true }));

  const iframeStyleElement = iframe.contentDocument.createElement("style");
  iframeStyleElement.textContent = await iframeStyleRequest.text();
  iframe.contentDocument.body.appendChild(iframeStyleElement);

  const preview = iframe.contentDocument.getElementById("preview");
  const selectAll = iframe.contentDocument.getElementById("selectAll");
  const filenameInput = iframe.contentDocument.getElementById("filename");

  let defaultFilename;
  if (settings.defaultFilename === "unix") defaultFilename = String(Date.now());
  else if (settings.defaultFilename === "unknown") defaultFilename = "unknown";
  else defaultFilename = generateFilename();

  if (settings.showFilenameBox) {
    filenameInput.setAttribute("placeholder", `${defaultFilename}.png`);
    filenameInput.value = `${defaultFilename}.png`;
    filenameInput.setSelectionRange(0, defaultFilename.length);
  } else {
    filenameInput.style.display = "none";
  }

  const previewImage = new iframe.contentWindow.Image();
  previewImage.src = clipboardImageB64;
  preview.style.backgroundImage = `url(${previewImage.src})`;

  selectAll.textContent = chrome.i18n.getMessage("showAllFiles", "Show all files");

  iframe.contentDocument.body.style.setProperty("--devicePixelRatio", iframe.contentWindow.devicePixelRatio);
  root.style.setProperty("--devicePixelRatio", window.devicePixelRatio);

  iframe.contentDocument.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") iframe.contentDocument.dispatchEvent(new FocusEvent("blur"));
    },
    { signal }
  );

  filenameInput.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Enter") preview.dispatchEvent(new Event("click"));
    },
    { signal }
  );

  preview.addEventListener(
    "click",
    async () => {
      iframe.contentDocument.dispatchEvent(new FocusEvent("blur"));
      if (settings.clearOnPaste) {
        window.focus();
        if (document.activeElement) document.activeElement.blur();
        await navigator.clipboard.writeText('')
      }
      let filename;
      if (filenameInput.value === `${defaultFilename}.png` || filenameInput.value.length === 0) filename = `${defaultFilename}.png`;
      else filename = filenameInput.value;

      chrome.runtime.sendMessage({ type: "file", token, frameId, tabId, filename, fileb64: clipboardImageB64 });
    },
    { signal, once: true }
  );

  selectAll.addEventListener(
    "click",
    async () => {
      iframe.contentDocument.dispatchEvent(new FocusEvent("blur"));

      return showPicker();
    },
    { signal, once: true }
  );

  window.addEventListener(
    "resize",
    () => {
      iframe.contentDocument.body.style.setProperty("--devicePixelRatio", iframe.contentWindow.devicePixelRatio);
      root.style.setProperty("--devicePixelRatio", window.devicePixelRatio);
    },
    { signal }
  );

  await previewImage.decode();

  window.addEventListener("visibilitychange", () => iframe.contentDocument.dispatchEvent(new FocusEvent("blur")), { signal });

  iframe.contentDocument.addEventListener(
    "blur",
    (e) => {
      controller.abort();
      aside.remove();
    },
    { signal }
  );

  if (settings.showFilenameBox) filenameInput.focus();
  else iframe.contentDocument.body.focus({ preventScroll: true });

  const { matches: prefersReducedMotion } = window.matchMedia("(prefers-reduced-motion: reduce)");

  let keyframes = [
    { transform: "skew(2deg, 1deg) scale(0.95)", opacity: "0" },
    { opacity: "1", pointerEvents: "initial" },
  ];

  let easing = "cubic-bezier(.07, .95, 0, 1)";
  let duration = 270;

  if (prefersReducedMotion) {
    (easing = "cubic-bezier(0, 0, 0, 1)"), (duration = 150);
    keyframes.shift();
  }

  root.animate(keyframes, {
    duration,
    fill: "forwards",
    easing,
  });

  function showPicker() {
    chrome.runtime.sendMessage({ type: "picker", token, inputAttributes, frameId, tabId });
  }

}

function generateFilename() {
  const date = new Date(Date.now());
  const currentDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString();
  const filenameDate = currentDateTime.substring(0, 10);
  const filenameTime = currentDateTime.substring(11, 19).replace(/:/g, "-");

  return `img-${filenameDate}-${filenameTime}`;
}

// Let the extension work on pages that stop propagation of input events (tinypng.com, etc.)
Event.prototype.stopPropagation = (function (original) {
  return function () {
    try {original()} catch (e) {return}
    if (this.type === "click") handleClick(this);
  }
})(Event.prototype.stopPropagation);
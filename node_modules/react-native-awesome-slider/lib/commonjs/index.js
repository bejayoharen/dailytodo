"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _ballon = require("./ballon");
Object.keys(_ballon).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ballon[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ballon[key];
    }
  });
});
var _slide = require("./slide");
Object.keys(_slide).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _slide[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _slide[key];
    }
  });
});
//# sourceMappingURL=index.js.map
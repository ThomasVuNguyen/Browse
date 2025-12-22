"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
// APIs for the renderer provided here
});
//# sourceMappingURL=preload.js.map
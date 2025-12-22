import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    // APIs for the renderer provided here
});

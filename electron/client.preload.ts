import { ipcRenderer, contextBridge } from "electron";

let clientAPI = {
    sayHello(hello: string) {
        ipcRenderer.send("test", hello);
    }
};

contextBridge.exposeInMainWorld("electron", clientAPI);

declare global {
    const electron: typeof clientAPI;
}
import { app, BrowserWindow } from "electron";

let provider = (async function () {
    const { join } = await import('path');
    const is_dev = await import('electron-is-dev');
    if (is_dev) {
        try {
            const { createServer } = await import('vite');
            const viteInstance = await createServer({
                root: `${join(__dirname, '..')}`,
                mode: 'development',
                configFile: `${join(__dirname, '../vite.config.ts')}`,
            });
            await viteInstance.listen();
            const PORT = viteInstance.config.server.port;
            return {
                url: `http://localhost:${PORT}`,
                server: viteInstance,
            };
        }
        catch (e) {
            console.error(e);
        }
    }
    return {
        url: `file://${join(__dirname, 'index.html')}`,
        server: null,
    };
})();

class ElectronWindow {
    private _win: BrowserWindow;
    constructor() {
        this._win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: true,
                enableRemoteModule: true,
            },
        });

        provider.then(inst => this._win.loadURL(inst.url));
    }
}

app.whenReady().then(() => new ElectronWindow())


app.on('window-all-closed', () => {
    provider.then(inst => inst.server && inst.server.close());
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        new ElectronWindow()
    }
})
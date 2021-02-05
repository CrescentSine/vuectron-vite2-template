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

class AppMainWindow extends BrowserWindow {
    constructor() {
        super({
            width: 800,
            height: 600,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: true,
                enableRemoteModule: true,
            },
        });

        provider.then(inst => this.loadURL(inst.url));
    }
}

app.whenReady().then(() => new AppMainWindow())


app.on('window-all-closed', () => {
    provider.then(inst => inst.server && inst.server.close());
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        new AppMainWindow()
    }
})
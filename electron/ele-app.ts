import { app, BrowserWindow, ipcMain } from "electron";
import is_dev from "electron-is-dev";
import { join } from 'path';

class AppMainWindow extends BrowserWindow {
    constructor() {
        super({
            width: 800,
            height: 600,
            webPreferences: {
                preload: join(__dirname, './client.preload.js'),
                contextIsolation: true,
                devTools: is_dev
            },
        });

        if (is_dev) {
            this.webContents.openDevTools();
        }

        this.getMainPageProvider().then(inst => {
            this.loadURL(inst.url);

            if (inst.server) {
                app.once('window-all-closed', () => inst.server.close());
            }
        });
    }

    private async getMainPageProvider() {
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
    }
}

ipcMain.on('test', function (_e, args) {
    console.log("receive", args, "from client");
})

app.whenReady().then(() => new AppMainWindow())


app.once('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        new AppMainWindow()
    }
})
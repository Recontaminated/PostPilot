const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { authorize } = require('./src/oauth.js');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('src/index.html');
}

// Handle OAuth start
ipcMain.handle('start-auth', async () => {
    try {
        const client = await authorize();
        return client.credentials;
    } catch (error) {
        console.error('Auth error:', error);
        throw error;
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
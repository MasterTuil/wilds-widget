const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen } = require('electron');
const path = require('path');
const fs   = require('fs');

const SAVE_PATH = path.join(app.getPath('userData'), 'wilds-save.json');

let widgetWin = null;
let gameWin   = null;
let tray      = null;

// ── Save / Load (file-based so Vex survives restarts) ────────────

ipcMain.handle('save-load', () => {
  try { return JSON.parse(fs.readFileSync(SAVE_PATH, 'utf8')); }
  catch { return null; }
});

ipcMain.handle('save-write', (_e, data) => {
  fs.writeFileSync(SAVE_PATH, JSON.stringify(data), 'utf8');
});

// ── Widget window ────────────────────────────────────────────────

function createWidget() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  widgetWin = new BrowserWindow({
    width:  520,
    height: 380,
    x: width  - 540,
    y: height - 400,
    transparent:     true,
    frame:           false,
    alwaysOnTop:     true,
    resizable:       false,
    skipTaskbar:     true,
    hasShadow:       false,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });

  widgetWin.loadFile(path.join(__dirname, '../widget/widget.html'));
  widgetWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });
  widgetWin.webContents.openDevTools({ mode: 'detach' });
  widgetWin.webContents.on('console-message', (_e, level, msg) => {
    if (level >= 2) console.error('[widget]', msg);
  });

  widgetWin.on('closed', () => { widgetWin = null; });
}

// ── Full game window ─────────────────────────────────────────────

function openGame() {
  if (gameWin) { gameWin.focus(); return; }

  gameWin = new BrowserWindow({
    width:  420,
    height: 780,
    minWidth:  380,
    minHeight: 680,
    frame:           false,
    transparent:     false,
    backgroundColor: '#0d0c1a',
    titleBarStyle:   'hidden',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });

  gameWin.loadFile(path.join(__dirname, '../web/index.html'));
  gameWin.on('closed', () => { gameWin = null; });
}

// ── Tray ─────────────────────────────────────────────────────────

function createTray() {
  // 16×16 template image — simple placeholder until we have an icon asset
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);

  const menu = Menu.buildFromTemplate([
    { label: 'Open Game',      click: openGame },
    { label: 'Show Widget',    click: () => widgetWin?.show() },
    { label: 'Hide Widget',    click: () => widgetWin?.hide() },
    { type: 'separator' },
    { label: 'Quit WILDS',     click: () => app.quit() },
  ]);

  tray.setToolTip('WILDS');
  tray.setContextMenu(menu);
  tray.on('click', () => widgetWin?.show());
}

// ── IPC from renderer ─────────────────────────────────────────────

ipcMain.on('open-game',       () => openGame());
ipcMain.on('widget-drag',     (_e, { x, y }) => widgetWin?.setPosition(x, y));
ipcMain.on('toggle-on-top',   (_e, val) => widgetWin?.setAlwaysOnTop(val));
ipcMain.on('quit-app',        () => app.quit());

// Desktop mode: sink Vex below all app windows
ipcMain.on('set-desktop-mode', (_e, desktopMode) => {
  if (!widgetWin) return;
  if (desktopMode) {
    widgetWin.setAlwaysOnTop(false);
    if (typeof widgetWin.moveBottom === 'function') widgetWin.moveBottom();
  } else {
    widgetWin.setAlwaysOnTop(true, 'floating');
  }
});

// Called after panel closes in desktop mode — sinks back down
ipcMain.on('sink-to-desktop', () => {
  if (!widgetWin) return;
  if (typeof widgetWin.moveBottom === 'function') widgetWin.moveBottom();
});

// ── App lifecycle ─────────────────────────────────────────────────

app.whenReady().then(() => {
  createWidget();
  createTray();
});

app.on('window-all-closed', () => {
  // Keep running in tray on macOS
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!widgetWin) createWidget();
});

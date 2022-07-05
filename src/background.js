'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import crypto from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import ftp from 'basic-ftp'

const isDevelopment = process.env.NODE_ENV !== 'production'
const previousAccountPath = path.join(__dirname, './data/previousAccount.json')


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  // interfaces provided to renderer processes
  ipcMain.handle('getFTPList',async () => {
    let list
    const client = new ftp.Client()
    try {
      await client.access({
        host: '127.0.0.1',
        user: 'test',
        password: '123456',
        secure: false
      })
      list = await client.list()
    }
    catch (err) {
      console.log(err)
    }
    client.close()
    return list
  })

  ipcMain.handle('setPreviousAccount',async (event, previousAccount) => {
    let temp = JSON.parse(previousAccount)
    // 将password加密
    const algorithm = 'aes-256-cbc'
    const password = temp.ip + temp.username + 'vOV987KHkhjkasdhfadsfDSF09SDFfr3'
    const key = crypto.scryptSync(password, 'GfG', 32)
    const iv = Buffer.alloc(16, 0)
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    temp.password = cipher.update(temp.password)
    temp.password = Buffer.concat([temp.password, cipher.final()]).toString('hex')
    await fs.mkdir(path.dirname(previousAccountPath), {recursive: true})
    await fs.writeFile(previousAccountPath, JSON.stringify(temp), 'utf-8')
  })

  ipcMain.handle('getPreviousAccount',async () => {
    try {
      await fs.access(previousAccountPath)
      let temp = JSON.parse(await fs.readFile(previousAccountPath, 'utf-8'))
      return JSON.stringify(temp)
    } catch {
      console.log('previousAccount.json uncreated')
      return null
    }
  })

  ipcMain.handle('decryptPassword',async (event, previousAccount) => {
    let temp = JSON.parse(previousAccount)
    let encryptedPassword = temp.password
    // 解密password
    const algorithm = 'aes-256-cbc'
    const password = temp.ip + temp.username + 'vOV987KHkhjkasdhfadsfDSF09SDFfr3'
    const key = crypto.scryptSync(password, 'GfG', 32)
    const iv = Buffer.alloc(16, 0)
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decryptedPassword = Buffer.from(encryptedPassword, 'hex')
    decryptedPassword = decipher.update(decryptedPassword)
    decryptedPassword = Buffer.concat([decryptedPassword, decipher.final()]).toString('utf-8')
    return decryptedPassword
  })

  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

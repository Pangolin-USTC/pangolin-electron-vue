const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    getFTPList: () => ipcRenderer.invoke('getFTPList'),
    getPreviousAccount: () => ipcRenderer.invoke('getPreviousAccount'),
    setPreviousAccount: (previousAccount) => ipcRenderer.invoke('setPreviousAccount', previousAccount),
    decryptPassword: (previousAccount) => ipcRenderer.invoke('decryptPassword', previousAccount),
})

const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    getPreviousAccount: () => ipcRenderer.invoke('getPreviousAccount'),
    ftpLogin: (account) => ipcRenderer.invoke('ftpLogin', account),
    checkLocalHexo: () => ipcRenderer.invoke('checkLocalHexo'),
    getArticleList: () => ipcRenderer.invoke('getArticleList'),
    getArticleContent: (filename) => ipcRenderer.invoke('getArticleContent', filename),
    setArticleContent: (filename, content) => ipcRenderer.invoke('setArticleContent', filename, content),
    createArticle: (title) => ipcRenderer.invoke('createArticle', title),
    deleteArticle: (filename) => ipcRenderer.invoke('deleteArticle', filename),
    ftpSync: () => ipcRenderer.invoke('ftpSync'),
})

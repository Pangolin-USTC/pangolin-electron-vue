import {promises as fs} from 'fs'
import crypto from 'crypto'
import path from 'path'
import structuredClone from '@ungap/structured-clone'
import Hexo from 'hexo'
import {app} from 'electron'
const ftp = require('basic-ftp')
const StreamZip = require('node-stream-zip')
const yaml = require('js-yaml')

// app.getAppPath()会获得asar文件路径
const dataPath = path.join(app.getAppPath(), '..', '..', 'data')
const defaultHexoPath = path.join(dataPath, 'default_hexo.zip')
const previousAccountPath = path.join(dataPath, 'previousAccount.json')
let loggedInAccount, hexoPath, postsPath, publicPath, configPath

async function setPreviousAccount(account) {
    // 将password加密
    const algorithm = 'aes-256-cbc'
    const password = account.host + account.user + 'vOV987KHkhjkasdhfadsfDSF09SDFfr3'
    const key = crypto.scryptSync(password, 'GfG', 32)
    const iv = Buffer.alloc(16, 0)
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    account.password = cipher.update(account.password)
    account.password = Buffer.concat([account.password, cipher.final()]).toString('hex')
    await fs.mkdir(path.dirname(previousAccountPath), {recursive: true})
    await fs.writeFile(previousAccountPath, JSON.stringify(account), 'utf-8')
}

function decryptPassword(account) {
    let encryptedPassword = account.password
    // 解密password
    try {
        const algorithm = 'aes-256-cbc'
        const password = account.host + account.user + 'vOV987KHkhjkasdhfadsfDSF09SDFfr3'
        const key = crypto.scryptSync(password, 'GfG', 32)
        const iv = Buffer.alloc(16, 0)
        const decipher = crypto.createDecipheriv(algorithm, key, iv)
        let decryptedPassword = Buffer.from(encryptedPassword, 'hex')
        decryptedPassword = decipher.update(decryptedPassword)
        decryptedPassword = Buffer.concat([decryptedPassword, decipher.final()]).toString('utf-8')
        return decryptedPassword
    } catch (e) {
        return ''
    }
}

export default (ipcMain) => {
    ipcMain.handle('getPreviousAccount', async () => {
        try {
            await fs.access(previousAccountPath)
            let temp = JSON.parse(await fs.readFile(previousAccountPath, 'utf-8'))
            return JSON.stringify(temp)
        } catch {
            console.log('previousAccount.json uncreated')
            return null
        }
    })

    // 登录成功返回true
    ipcMain.handle('ftpLogin', async (event, account) => {
        account = JSON.parse(account)
        loggedInAccount = structuredClone(account)
        hexoPath = path.join(dataPath, loggedInAccount.host, loggedInAccount.user)
        postsPath = path.join(hexoPath, 'source', '_posts')
        publicPath = path.join(hexoPath, 'public')
        configPath = path.join(hexoPath, '_config.yml')
        const client = new ftp.Client(2000)
        let ret = false
        // 先视为明文登录
        try {
            await client.access(account)
            // 明文登录成功, 重新设置previousAccount
            await setPreviousAccount(account)
            ret = true
        } catch (e) {
            // 再尝试解密登录
            account.password = decryptPassword(account)
            if (account.password !== '') {
                try {
                    await client.access(account)
                    // 解密登录成功
                    loggedInAccount.password = account.password
                    ret = true
                } catch (e) {
                    ret = false
                }
            }
        }
        if (ret === false) return false
        // 检查publicPath是否正确
        try {
            await client.list(account.publicPath)
            return true
        } catch (e) {
            // 没有对应目录, 检查是否能创建
            try {
                await client.ensureDir(account.publicPath)
                return true
            } catch (e) {
                return false
            }
        } finally {
            client.close()
        }
    })

    // 检查本地有无对应文件夹, 若没有, 则初始化hexo文件夹
    ipcMain.handle('checkLocalHexo', async () => {
        try {
            await fs.access(path.join(hexoPath, 'scaffolds'))
        } catch (e) {
            // 没有对应文件夹
            await fs.mkdir(hexoPath, {recursive: true})
            const zip = new StreamZip.async({
                file: defaultHexoPath,
                storeEntries: true
            })
            await zip.extract(null, hexoPath)
            await zip.close()
        } finally {
            // 设置root路径, 这对generate出正确的href很关键
            if (loggedInAccount.root.length === 0 || loggedInAccount.root.charAt(0) !== '/')
                loggedInAccount.root = '/' + loggedInAccount.root
            let doc = yaml.load(await fs.readFile(configPath, 'utf-8'))
            doc.root = loggedInAccount.root
            await fs.writeFile(configPath, yaml.dump(doc), (err) => {
                if (err) console.log(err)
            })
        }
    })

    ipcMain.handle('getArticleList', async () => {
        return JSON.stringify({data: await fs.readdir(postsPath)})
    })

    ipcMain.handle('getArticleContent', async (event, filename) => {
        const filePath = path.join(postsPath, filename)
        return await fs.readFile(filePath, 'utf-8')
    })

    ipcMain.handle('setArticleContent', async (event, filename, content) => {
        const filePath = path.join(postsPath, filename)
        await fs.writeFile(filePath, content, 'utf-8')
    })

    ipcMain.handle('createArticle', async (event, title) => {
        title = '"' + title + '"'
        let hexo = new Hexo(hexoPath, {silent: true})
        hexo.init().then(() => {
            hexo.call('new', {_: [title]}).then(() => {
                return hexo.exit()
            })
        })
    })

    ipcMain.handle('deleteArticle', async (event, filename) => {
        const filePath = path.join(postsPath, filename)
        return await fs.unlink(filePath)
    })

    ipcMain.handle('ftpSync', async () => {
        // 先hexo generate
        let hexo = new Hexo(hexoPath, {silent: true})
        hexo.init().then(function () {
            hexo.load().then(function () {
                hexo.call('generate', {}).then(async function () {
                    return hexo.exit()
                })
            })
        })
        try {
            // 再将public文件夹通过ftp传到publicPath
            const client = new ftp.Client(2000)
            await client.access(loggedInAccount)
            await client.uploadFromDir(publicPath, loggedInAccount.publicPath)
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    })
}

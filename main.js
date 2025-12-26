/**
 * useMultiSession.js
*/

const https = require('https')
const chalk = require('chalk')

function fetchGithubJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''

      if (res.statusCode !== 200) {
        reject(new Error('Gagal mengambil data'))
        return
      }

      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (err) {
          reject(new Error('JSON tidak valid'))
        }
      })
    }).on('error', err => {
      reject(err)
    })
  })
}

async function verifyUser(username) {
  const GITHUB_RAW_URL =
    'https://raw.githubusercontent.com/otdoriryu-oss/ryu/main/data.json'

  const users = await fetchGithubJSON(GITHUB_RAW_URL)
  
  if (!Array.isArray(users)) {
    throw new Error('Format data GitHub salah')
  }
  const user = users.find(
    u => u.username.toLowerCase() === username.toLowerCase()
  )
  if (!user) {
    throw new Error('User tidak terdaftar / tidak terverifikasi')
  }
  if (!user.number) {
    throw new Error('Nomor WhatsApp tidak ditemukan')
  }

  return user.number
}

async function useMultiSession(sock, PaiCode, username) {
  try {
    console.log(chalk.yellow.bold('\n[ SYSTEM ] Verifikasi user...'))
    const nomor = await verifyUser(username)
    console.log(chalk.green.bold('[ OK ] User terverifikasi'))
    console.log(chalk.blue.bold('[ INFO ] Nomor WhatsApp: ') + nomor)

    const code = await sock.requestPairingCode(nomor, PaiCode)

    console.log(chalk.red.bold('[ PAIRING CODE ] ') + chalk.reset(code))

  } catch (err) {
    console.log(chalk.red.bold('[ ERROR ] ') + err.message)
    process.exit(1)
  }
}

module.exports = useMultiSession

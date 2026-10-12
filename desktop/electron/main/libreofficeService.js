import { app, net } from 'electron'
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'

const LO_VERSION = '24.8.4'
const LO_URL = `https://download2.portableapps.com/portableapps/LibreOfficePortable/LibreOfficePortable_${LO_VERSION}_MultilingualAll.paf.exe`
const LO_DIR  = path.join(app.getPath('userData'), 'libreoffice')
const LO_EXE  = path.join(LO_DIR, 'LibreOfficePortable.exe')
const LO_INSTALLER = path.join(app.getPath('userData'), 'lo_installer.exe')

export function isLibreOfficeInstalled() {
  return fs.existsSync(LO_EXE)
}

function downloadFile(url, destPath, onProgress) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath)
    const request = net.request(url)
    let total = 0
    let downloaded = 0

    request.on('response', (response) => {
      // Follow redirect
      if (response.statusCode >= 300 && response.statusCode < 400) {
        file.close()
        fs.unlink(destPath, () => {})
        return downloadFile(response.headers.location, destPath, onProgress)
          .then(resolve).catch(reject)
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode}`))
      }
      total = parseInt(response.headers['content-length'] || '0', 10)

      response.on('data', (chunk) => {
        downloaded += chunk.length
        file.write(chunk)
        if (total > 0) onProgress && onProgress(Math.round((downloaded / total) * 80))
      })
      response.on('end', () => {
        file.end()
        resolve()
      })
      response.on('error', (err) => {
        file.close()
        reject(err)
      })
    })

    request.on('error', (err) => {
      file.close()
      reject(err)
    })
    request.end()
  })
}

export async function downloadLibreOffice(onProgress) {
  // Clean up any previous partial download
  try { fs.unlinkSync(LO_INSTALLER) } catch {}

  onProgress && onProgress(1)
  await downloadFile(LO_URL, LO_INSTALLER, onProgress)

  // Verify download
  const stat = fs.statSync(LO_INSTALLER)
  if (stat.size < 1_000_000) throw new Error('הקובץ שהורד פגום')

  onProgress && onProgress(82)

  // Silent extraction — PortableApps format supports /DESTINATION and /SILENT
  await new Promise((resolve, reject) => {
    execFile(
      LO_INSTALLER,
      [`/DESTINATION=${app.getPath('userData')}`, '/SILENT'],
      { shell: false, timeout: 300_000 },
      (err) => {
        if (err && err.code !== 0 && err.code !== 1) {
          reject(new Error(`שגיאה בחילוץ: ${err.message}`))
        } else {
          resolve()
        }
      }
    )
  })

  onProgress && onProgress(95)
  try { fs.unlinkSync(LO_INSTALLER) } catch {}

  if (!fs.existsSync(LO_EXE)) {
    throw new Error('LibreOffice Portable לא נמצא לאחר החילוץ')
  }
  onProgress && onProgress(100)
}

export async function convertDocument(inputPath, outputPath, onProgress) {
  if (!isLibreOfficeInstalled()) throw new Error('LibreOffice Portable לא מותקן')

  const outputDir  = path.dirname(outputPath)
  const outputExt  = path.extname(outputPath).slice(1).toLowerCase()

  onProgress && onProgress(5)

  // Try soffice.exe directly (inside the portable app bundle)
  const soffice = path.join(LO_DIR, 'App', 'libreoffice', 'program', 'soffice.exe')
  const exe = fs.existsSync(soffice) ? soffice : LO_EXE

  await new Promise((resolve, reject) => {
    execFile(
      exe,
      ['--headless', '--convert-to', outputExt, '--outdir', outputDir, inputPath],
      { timeout: 120_000, shell: false },
      (err) => {
        if (err) reject(new Error(`המרה נכשלה: ${err.message}`))
        else resolve()
      }
    )
  })

  // LibreOffice names output after input base name — rename if needed
  const inputBase = path.basename(inputPath, path.extname(inputPath))
  const loOutput  = path.join(outputDir, `${inputBase}.${outputExt}`)
  if (loOutput !== outputPath && fs.existsSync(loOutput)) {
    fs.renameSync(loOutput, outputPath)
  }

  onProgress && onProgress(100)
}

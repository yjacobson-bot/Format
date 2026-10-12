import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { spawn, execFile } from 'child_process'

const LO_VERSION = '24.8.4'
const LO_URL = `https://download2.portableapps.com/portableapps/LibreOfficePortable/LibreOfficePortable_${LO_VERSION}_MultilingualAll.paf.exe`
const LO_DIR = path.join(app.getPath('userData'), 'libreoffice')
const LO_EXE = path.join(LO_DIR, 'LibreOfficePortable.exe')
const LO_INSTALLER = path.join(app.getPath('userData'), 'lo_installer.exe')

export function isLibreOfficeInstalled() {
  return fs.existsSync(LO_EXE)
}

export function getLibreOfficePath() {
  return LO_EXE
}

export async function downloadLibreOffice(onProgress) {
  await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(LO_INSTALLER)
    const request = https.get(LO_URL, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close()
        fs.unlink(LO_INSTALLER, () => {})
        return https.get(res.headers.location, (res2) => {
          const total = parseInt(res2.headers['content-length'] || '0', 10)
          let downloaded = 0
          const file2 = fs.createWriteStream(LO_INSTALLER)
          res2.on('data', chunk => {
            downloaded += chunk.length
            if (total) onProgress && onProgress(Math.round((downloaded / total) * 80))
          })
          res2.pipe(file2)
          file2.on('finish', () => file2.close(resolve))
          file2.on('error', reject)
        }).on('error', reject)
      }
      const total = parseInt(res.headers['content-length'] || '0', 10)
      let downloaded = 0
      res.on('data', chunk => {
        downloaded += chunk.length
        if (total) onProgress && onProgress(Math.round((downloaded / total) * 80))
      })
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
    })
    request.on('error', reject)
    file.on('error', reject)
  })

  onProgress && onProgress(82)

  // Silent extraction via PortableApps installer
  await new Promise((resolve, reject) => {
    const proc = spawn(LO_INSTALLER, [`/DESTINATION=${app.getPath('userData')}`, '/SILENT'], {
      detached: false, stdio: 'ignore',
    })
    proc.on('close', code => {
      if (code === 0 || code === 1) resolve()
      else reject(new Error(`Installer exited with code ${code}`))
    })
    proc.on('error', reject)
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

  const outputDir = path.dirname(outputPath)
  const outputExt = path.extname(outputPath).slice(1).toLowerCase()

  const filterMap = {
    docx: 'MS Word 2007 XML',
    doc: 'MS Word 97',
    txt: 'Text',
    odt: 'writer8',
    rtf: 'Rich Text Format',
    html: 'HTML (StarWriter)',
  }
  const filterName = filterMap[outputExt] || outputExt

  onProgress && onProgress(5)

  await new Promise((resolve, reject) => {
    const args = ['--headless', '--convert-to', outputExt, '--infilter=impress_pdf_import',
      '--outdir', outputDir, inputPath]

    const soffice = path.join(path.dirname(LO_EXE), 'App', 'libreoffice', 'program', 'soffice.exe')
    const exe = fs.existsSync(soffice) ? soffice : LO_EXE

    const proc = execFile(exe, args, { timeout: 120000 })
    proc.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`המרה נכשלה (קוד ${code})`))
    })
    proc.on('error', reject)
  })

  // LibreOffice outputs to same dir with its own name — rename to desired outputPath
  const inputBase = path.basename(inputPath, path.extname(inputPath))
  const loOutput = path.join(outputDir, `${inputBase}.${outputExt}`)
  if (loOutput !== outputPath && fs.existsSync(loOutput)) {
    fs.renameSync(loOutput, outputPath)
  }

  onProgress && onProgress(100)
}

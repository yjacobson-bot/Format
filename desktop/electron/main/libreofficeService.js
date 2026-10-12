import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'

function getLoDir() {
  // In packaged app: bundled in resources/libreoffice
  // In dev: fall back to userData
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'libreoffice')
  }
  return path.join(app.getPath('userData'), 'libreoffice')
}

export function isLibreOfficeInstalled() {
  const loExe = path.join(getLoDir(), 'LibreOfficePortable.exe')
  return fs.existsSync(loExe)
}

export async function convertDocument(inputPath, outputPath, onProgress) {
  if (!isLibreOfficeInstalled()) throw new Error('LibreOffice לא נמצא בחבילת התוכנה')

  const loDir = getLoDir()
  const outputDir = path.dirname(outputPath)
  const outputExt = path.extname(outputPath).slice(1).toLowerCase()

  onProgress && onProgress(5)

  const soffice = path.join(loDir, 'App', 'libreoffice', 'program', 'soffice.exe')
  const loExe = path.join(loDir, 'LibreOfficePortable.exe')
  const exe = fs.existsSync(soffice) ? soffice : loExe

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

  const inputBase = path.basename(inputPath, path.extname(inputPath))
  const loOutput = path.join(outputDir, `${inputBase}.${outputExt}`)
  if (loOutput !== outputPath && fs.existsSync(loOutput)) {
    fs.renameSync(loOutput, outputPath)
  }

  onProgress && onProgress(100)
}

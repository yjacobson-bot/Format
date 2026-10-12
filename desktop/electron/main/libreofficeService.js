import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'

function getLoDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'libreoffice')
  }
  return path.join(app.getPath('userData'), 'libreoffice')
}

function findExe(dir, names, depth = 0) {
  if (depth > 6) return null
  if (!fs.existsSync(dir)) return null
  let entries
  try { entries = fs.readdirSync(dir) } catch { return null }
  for (const name of names) {
    const p = path.join(dir, name)
    if (fs.existsSync(p)) return p
  }
  for (const entry of entries) {
    const full = path.join(dir, entry)
    try {
      if (fs.statSync(full).isDirectory()) {
        const found = findExe(full, names, depth + 1)
        if (found) return found
      }
    } catch { /* skip */ }
  }
  return null
}

function getSoffice() {
  const loDir = getLoDir()
  // Try common known paths first (fast path)
  const candidates = [
    path.join(loDir, 'App', 'libreoffice', 'program', 'soffice.exe'),
    path.join(loDir, 'program', 'soffice.exe'),
    path.join(loDir, 'LibreOfficePortable.exe'),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  // Fallback: search recursively
  return findExe(loDir, ['soffice.exe', 'LibreOfficePortable.exe'])
}

export function isLibreOfficeInstalled() {
  return getSoffice() !== null
}

export async function convertDocument(inputPath, outputPath, onProgress) {
  const exe = getSoffice()
  if (!exe) throw new Error('LibreOffice לא נמצא בחבילת התוכנה')

  const outputDir = path.dirname(outputPath)
  const outputExt = path.extname(outputPath).slice(1).toLowerCase()

  onProgress && onProgress(5)

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

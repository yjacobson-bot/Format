import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import path from 'path'
import fs from 'fs'
import { spawnSync } from 'child_process'

function unpackedPath(p) {
  return p.replace('app.asar', 'app.asar.unpacked')
}

ffmpeg.setFfmpegPath(unpackedPath(ffmpegInstaller.path))
ffmpeg.setFfprobePath(unpackedPath(ffprobeInstaller.path))

const activeJobs = new Map()

// GPU encoder map: hwAccel → { h264, h265 }
const HW_CODECS = {
  nvenc: { h264: 'h264_nvenc', h265: 'hevc_nvenc' },
  qsv:   { h264: 'h264_qsv',  h265: 'hevc_qsv'  },
  amf:   { h264: 'h264_amf',  h265: 'hevc_amf'  },
}

export function detectHardwareEncoders() {
  try {
    const result = spawnSync(unpackedPath(ffmpegInstaller.path), ['-hide_banner', '-encoders'], { encoding: 'utf8', timeout: 5000 })
    const out = (result.stdout || '') + (result.stderr || '')
    const available = []
    if (out.includes('h264_nvenc')) available.push('nvenc')
    if (out.includes('h264_qsv'))   available.push('qsv')
    if (out.includes('h264_amf'))   available.push('amf')
    return available
  } catch {
    return []
  }
}

function resolveVideoCodec(settings) {
  if (settings.videoCodec) return settings.videoCodec // user set explicit codec
  const hw = settings.hwAccel
  if (!hw || hw === 'cpu') return null
  const codecs = HW_CODECS[hw]
  if (!codecs) return null
  // pick h265 or h264 based on container hint (default h264)
  return codecs.h264
}

export async function probeFile(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err)
      resolve(metadata)
    })
  })
}

export function buildFFmpegCommand(inputPath, outputPath, settings, formatArgs) {
  let cmd = ffmpeg(inputPath)

  if (settings.trim?.start != null) cmd = cmd.seekInput(settings.trim.start)
  if (settings.trim?.end != null) cmd = cmd.duration(settings.trim.end - (settings.trim.start || 0))

  const vfFilters = []

  if (settings.resolution) {
    vfFilters.push(`scale=${settings.resolution.replace(':', ':')}`)
  }

  if (settings.rotate) {
    const transposeMap = { 90: 'transpose=1', 180: 'transpose=2,transpose=2', 270: 'transpose=2' }
    if (transposeMap[settings.rotate]) vfFilters.push(transposeMap[settings.rotate])
  }

  if (settings.flip === 'horizontal') vfFilters.push('hflip')
  if (settings.flip === 'vertical') vfFilters.push('vflip')

  if (settings.grayscale) vfFilters.push('hue=s=0')

  if (settings.watermark) {
    vfFilters.push(`movie=${settings.watermark.replace(/\\/g, '/')},scale=200:-1[wm];[in][wm]overlay=10:10[out]`)
  }

  if (vfFilters.length > 0) {
    cmd = cmd.videoFilters(vfFilters)
  }

  const resolvedVideoCodec = resolveVideoCodec(settings)
  if (resolvedVideoCodec) cmd = cmd.videoCodec(resolvedVideoCodec)
  if (settings.audioCodec) cmd = cmd.audioCodec(settings.audioCodec)
  if (settings.videoBitrate) cmd = cmd.videoBitrate(settings.videoBitrate)
  if (settings.audioBitrate) cmd = cmd.audioBitrate(settings.audioBitrate)
  if (settings.fps) cmd = cmd.fps(parseFloat(settings.fps))
  if (settings.sampleRate) cmd = cmd.audioFrequency(parseInt(settings.sampleRate))
  if (settings.channels) cmd = cmd.audioChannels(parseInt(settings.channels))

  if (settings.volume) cmd = cmd.audioFilters(`volume=${settings.volume}`)
  if (settings.normalize) cmd = cmd.audioFilters('dynaudnorm')
  if (settings.fadeIn) cmd = cmd.audioFilters(`afade=t=in:d=${settings.fadeIn}`)
  if (settings.fadeOut) cmd = cmd.audioFilters(`afade=t=out:d=${settings.fadeOut}`)

  if (settings.quality && !settings.videoCodec) {
    cmd = cmd.outputOptions(['-q:v', settings.quality])
  }

  if (settings.subtitleFile && fs.existsSync(settings.subtitleFile)) {
    cmd = cmd.outputOptions(['-vf', `subtitles=${settings.subtitleFile.replace(/\\/g, '/')}`])
  }

  if (formatArgs && formatArgs.length > 0) {
    const notAlreadySet = formatArgs.filter((arg, i) => {
      const isFlag = arg.startsWith('-')
      if (!isFlag) return true
      const key = arg.split(':')[0].slice(1)
      const alreadySet = [
        settings.videoCodec && 'c',
        settings.audioCodec && 'c',
        settings.videoBitrate && 'b',
        settings.audioBitrate && 'b',
        settings.fps && 'r',
        settings.sampleRate && 'ar',
        settings.channels && 'ac',
      ].filter(Boolean)
      return !alreadySet.some(s => key.includes(s))
    })
    if (notAlreadySet.length > 0) {
      cmd = cmd.outputOptions(notAlreadySet)
    }
  }

  cmd = cmd.output(outputPath)
  return cmd
}

// Parse ffmpeg stderr for accurate progress: time, speed, bitrate
function parseProgressLine(line, totalDuration) {
  const timeMatch = line.match(/time=(\d+):(\d+):(\d+)\.(\d+)/)
  const speedMatch = line.match(/speed=\s*([\d.]+)x/)
  const bitrateMatch = line.match(/bitrate=\s*([\d.]+)kbits\/s/)
  const sizeMatch = line.match(/size=\s*(\d+)kB/)

  if (!timeMatch) return null

  const currentSec = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 100
  const speed = speedMatch ? parseFloat(speedMatch[1]) : null
  const bitrate = bitrateMatch ? parseFloat(bitrateMatch[1]) : null
  const size = sizeMatch ? parseInt(sizeMatch[1]) * 1024 : null

  let percent = 0
  let remainingSec = null
  if (totalDuration > 0) {
    percent = Math.min(99, (currentSec / totalDuration) * 100)
    if (speed && speed > 0) {
      remainingSec = Math.round((totalDuration - currentSec) / speed)
    }
  }

  return { percent, currentSec, totalDuration, speed, bitrate, size, remainingSec }
}

const GPU_ERROR_PATTERNS = ['No such encoder', 'Unknown encoder', 'cannot open video encoder', 'GPU', 'nvenc', 'qsv', 'amf', 'Error initializing output stream']

function isGpuError(msg) {
  return GPU_ERROR_PATTERNS.some(p => msg.toLowerCase().includes(p.toLowerCase()))
}

function runCmd(taskId, cmd, totalDuration, onProgress, onComplete, onError, fallbackFn) {
  let lastProgressTime = 0

  cmd.on('stderr', (line) => {
    const progress = parseProgressLine(line, totalDuration)
    if (progress) {
      const now = Date.now()
      if (now - lastProgressTime < 250) return
      lastProgressTime = now
      onProgress(taskId, Math.round(progress.percent), {
        speed: progress.speed,
        remainingSec: progress.remainingSec,
        bitrate: progress.bitrate,
        currentSec: progress.currentSec,
        totalDuration,
      })
    }
  })

  cmd.on('end', () => {
    activeJobs.delete(taskId)
    onComplete(taskId)
  })

  cmd.on('error', (err) => {
    activeJobs.delete(taskId)
    if (fallbackFn && isGpuError(err.message)) {
      fallbackFn()
    } else {
      onError(taskId, err.message)
    }
  })

  cmd.run()
  activeJobs.set(taskId, cmd)
}

export function startConversion(taskId, inputPath, outputPath, settings, formatArgs, onProgress, onComplete, onError) {
  const useGpu = settings.hwAccel && settings.hwAccel !== 'cpu'
  const cmd = buildFFmpegCommand(inputPath, outputPath, settings, formatArgs)

  const fallbackToCpu = () => {
    const cpuSettings = { ...settings, hwAccel: 'cpu' }
    const cpuCmd = buildFFmpegCommand(inputPath, outputPath, cpuSettings, formatArgs)
    runCmd(taskId, cpuCmd, 0, onProgress, onComplete, onError, null)
  }

  // Get duration for accurate progress
  probeFile(inputPath).then(meta => {
    const totalDuration = meta?.format?.duration || 0
    runCmd(taskId, cmd, totalDuration, onProgress, onComplete, onError, useGpu ? fallbackToCpu : null)
  }).catch(() => {
    runCmd(taskId, cmd, 0, onProgress, onComplete, onError, useGpu ? fallbackToCpu : null)
  })
}

export function cancelConversion(taskId) {
  const cmd = activeJobs.get(taskId)
  if (cmd) {
    cmd.kill('SIGKILL')
    activeJobs.delete(taskId)
  }
}

export function cancelAll() {
  for (const [id, cmd] of activeJobs) {
    cmd.kill('SIGKILL')
    activeJobs.delete(id)
  }
}

export function buildOutputPath(inputPath, outputDir, ext) {
  const baseName = path.basename(inputPath, path.extname(inputPath))
  const dir = outputDir || path.dirname(inputPath)
  let outPath = path.join(dir, `${baseName}.${ext}`)

  let counter = 1
  while (fs.existsSync(outPath)) {
    outPath = path.join(dir, `${baseName}_${counter}.${ext}`)
    counter++
  }
  return outPath
}

export async function extractFrameAtTime(videoPath, timeSec, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .seekInput(timeSec)
      .frames(1)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  })
}

export async function getVideoDuration(filePath) {
  const meta = await probeFile(filePath)
  return meta.format?.duration || 0
}

export async function mergeVideos(inputPaths, outputPath, settings, onProgress) {
  return new Promise((resolve, reject) => {
    const listFile = outputPath + '.txt'
    const listContent = inputPaths.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n')
    fs.writeFileSync(listFile, listContent)

    let cmd = ffmpeg()
      .input(listFile)
      .inputOptions(['-f', 'concat', '-safe', '0'])

    // If not using copy codec, apply transcoding settings
    if (settings?.videoCodec && settings.videoCodec !== 'copy') {
      cmd = cmd.videoCodec(settings.videoCodec)
    }
    if (settings?.audioCodec && settings.audioCodec !== 'copy') {
      cmd = cmd.audioCodec(settings.audioCodec)
    }
    if (settings?.audioBitrate) cmd = cmd.audioBitrate(settings.audioBitrate)

    // Default: stream copy for speed
    if (!settings?.videoCodec || settings.videoCodec === 'copy') {
      cmd = cmd.outputOptions(['-c', 'copy'])
    }

    cmd
      .output(outputPath)
      .on('progress', p => onProgress && onProgress(p.percent || 0))
      .on('end', () => { try { fs.unlinkSync(listFile) } catch {} resolve() })
      .on('error', (err) => { try { fs.unlinkSync(listFile) } catch {} reject(err) })
      .run()
  })
}

export async function splitVideo(inputPath, outputDir, segmentDuration) {
  return new Promise((resolve, reject) => {
    const baseName = path.basename(inputPath, path.extname(inputPath))
    const ext = path.extname(inputPath)
    const outputPattern = path.join(outputDir, `${baseName}_%03d${ext}`)

    ffmpeg(inputPath)
      .outputOptions([
        '-c', 'copy',
        '-map', '0',
        '-segment_time', String(segmentDuration),
        '-f', 'segment',
        '-reset_timestamps', '1',
      ])
      .output(outputPattern)
      .on('end', resolve)
      .on('error', reject)
      .run()
  })
}

export async function addWatermark(videoPath, watermarkPath, outputPath, position = 'topleft') {
  const positions = {
    topleft: 'overlay=10:10',
    topright: 'overlay=W-w-10:10',
    bottomleft: 'overlay=10:H-h-10',
    bottomright: 'overlay=W-w-10:H-h-10',
    center: 'overlay=(W-w)/2:(H-h)/2',
  }
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(watermarkPath)
      .complexFilter([`${positions[position] || positions.topleft}`])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  })
}

// Scan a directory recursively for media files
export function scanDirectory(dirPath, extensions) {
  const results = []
  function scan(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          scan(fullPath)
        } else {
          const ext = path.extname(entry.name).slice(1).toLowerCase()
          if (extensions.includes(ext)) {
            results.push({ name: entry.name, path: fullPath, size: fs.statSync(fullPath).size })
          }
        }
      }
    } catch {}
  }
  scan(dirPath)
  return results
}

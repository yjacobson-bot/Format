import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import path from 'path'
import fs from 'fs'
import { spawnSync } from 'child_process'
import os from 'os'

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

  if (settings.subtitleFile && fs.existsSync(settings.subtitleFile)) {
    vfFilters.push(`subtitles=${settings.subtitleFile.replace(/\\/g, '/')}`)
  }

  if (settings.watermarkPath) {
    cmd = cmd.input(settings.watermarkPath)
    const scale = settings.watermarkScale || 0.1
    const posMap = {
      topleft: '10:10', topright: 'W-w-10:10',
      bottomleft: '10:H-h-10', bottomright: 'W-w-10:H-h-10',
      center: '(W-w)/2:(H-h)/2',
    }
    const pos = posMap[settings.watermarkPosition || 'topleft']
    const baseFilter = vfFilters.length > 0
      ? `[0:v]${vfFilters.join(',')}[mainv];[1:v][mainv]scale2ref=iw*${scale}:-1[wm][base];[base][wm]overlay=${pos}[out]`
      : `[1:v][0:v]scale2ref=iw*${scale}:-1[wm][base];[base][wm]overlay=${pos}[out]`
    cmd = cmd.complexFilter([baseFilter], '[out]').outputOptions(['-c:a', 'copy'])
  } else if (vfFilters.length > 0) {
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

  if (settings.noAudio) cmd = cmd.outputOptions(['-an'])
  if (!settings.noAudio && settings.volume) cmd = cmd.audioFilters(`volume=${settings.volume}`)
  if (!settings.noAudio && settings.normalize) cmd = cmd.audioFilters('dynaudnorm')
  if (!settings.noAudio && settings.fadeIn) cmd = cmd.audioFilters(`afade=t=in:d=${settings.fadeIn}`)
  if (!settings.noAudio && settings.fadeOut) cmd = cmd.audioFilters(`afade=t=out:d=${settings.fadeOut}`)

  if (settings.quality && !settings.videoCodec) {
    cmd = cmd.outputOptions(['-q:v', settings.quality])
  }

  // Use fast preset for CPU encoding if not explicitly set (skip for audio-only outputs)
  const isGpuCodec = resolvedVideoCodec && (resolvedVideoCodec.includes('nvenc') || resolvedVideoCodec.includes('qsv') || resolvedVideoCodec.includes('amf'))
  const hasNoVideoFlag = formatArgs && formatArgs.includes('-vn')
  if (!isGpuCodec && !settings.preset && !settings.videoCodec && !hasNoVideoFlag) {
    cmd = cmd.outputOptions(['-preset', 'fast'])
  }

  // Thread allocation based on user setting
  const totalCores = os.cpus().length
  let threadsPerJob
  if (settings.threadMode === 'max') {
    threadsPerJob = totalCores
  } else if (settings.threadMode === 'manual' && settings.threadCount > 0) {
    threadsPerJob = Math.min(settings.threadCount, totalCores)
  } else if (settings.threadMode === 'background') {
    // Half cores max — OS priority set after spawn
    threadsPerJob = Math.max(1, Math.floor(totalCores / 2))
  } else {
    // 'optimal': proportional — each job gets cores / activeJobs
    const activeCount = Math.max(1, activeJobs.size + 1) // +1 for this job being added
    threadsPerJob = Math.max(1, Math.floor(totalCores / activeCount))
  }
  cmd = cmd.outputOptions(['-threads', String(threadsPerJob)])

  if (formatArgs && formatArgs.length > 0) {
    const skipIndices = new Set()
    formatArgs.forEach((arg, i) => {
      if (!arg.startsWith('-')) return
      const key = arg.split(':')[0].slice(1)
      if (key === 'vf' && vfFilters.length > 0) {
        skipIndices.add(i)
        if (i + 1 < formatArgs.length && !formatArgs[i + 1].startsWith('-')) skipIndices.add(i + 1)
        return
      }
      const alreadySet = [
        settings.videoCodec && 'c',
        settings.audioCodec && 'c',
        settings.videoBitrate && 'b',
        settings.audioBitrate && 'b',
        settings.fps && 'r',
        settings.sampleRate && 'ar',
        settings.channels && 'ac',
      ].filter(Boolean)
      if (alreadySet.some(s => key.includes(s))) skipIndices.add(i)
    })
    const notAlreadySet = formatArgs.filter((_, i) => !skipIndices.has(i))
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

function runCmd(taskId, cmd, totalDuration, onProgress, onComplete, onError, fallbackFn, isBackground) {
  let lastProgressTime = 0

  if (isBackground) {
    cmd.on('start', () => {
      try {
        if (cmd._ffmpegProc?.pid) {
          // PRIORITY_BELOW_NORMAL = 10 on Windows, ~10 on Unix (nice value)
          os.setPriority(cmd._ffmpegProc.pid, 10)
        }
      } catch {}
    })
  }

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

  const isBackground = settings.threadMode === 'background'

  const fallbackToCpu = () => {
    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath) } catch {}
    const cpuSettings = { ...settings, hwAccel: 'cpu' }
    const cpuCmd = buildFFmpegCommand(inputPath, outputPath, cpuSettings, formatArgs)
    runCmd(taskId, cpuCmd, 0, onProgress, onComplete, onError, null, isBackground)
  }

  // Get duration for accurate progress (captured in closure for fallback too)
  probeFile(inputPath).then(meta => {
    const totalDuration = meta?.format?.duration || 0
    const fallbackWithDuration = useGpu ? () => {
      try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath) } catch {}
      const cpuSettings = { ...settings, hwAccel: 'cpu' }
      const cpuCmd = buildFFmpegCommand(inputPath, outputPath, cpuSettings, formatArgs)
      runCmd(taskId, cpuCmd, totalDuration, onProgress, onComplete, onError, null, isBackground)
    } : null
    runCmd(taskId, cmd, totalDuration, onProgress, onComplete, onError, fallbackWithDuration, isBackground)
  }).catch(() => {
    runCmd(taskId, cmd, 0, onProgress, onComplete, onError, useGpu ? fallbackToCpu : null, isBackground)
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

export async function mixAudio(inputPaths, outputPath, weights, settings, onProgress) {
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg()
    inputPaths.forEach(p => { cmd = cmd.input(p) })

    const n = inputPaths.length
    const w = weights && weights.length === n
      ? weights.map(v => (parseFloat(v) || 1).toFixed(2)).join(' ')
      : Array(n).fill('1').join(' ')

    const audioCodec = settings?.audioCodec && settings.audioCodec !== 'copy' ? settings.audioCodec : 'libmp3lame'
    const audioBitrate = settings?.audioBitrate && settings.audioBitrate !== 'copy' ? settings.audioBitrate : '192k'

    cmd
      .complexFilter([`amix=inputs=${n}:duration=longest:normalize=0:weights=${w}`])
      .audioCodec(audioCodec)
      .audioBitrate(audioBitrate)
      .output(outputPath)
      .on('progress', p => onProgress && onProgress(p.percent || 0))
      .on('end', resolve)
      .on('error', reject)
      .run()
  })
}

export async function mergeVideos(inputPaths, outputPath, settings, onProgress) {
  return new Promise((resolve, reject) => {
    const listFile = outputPath + '.txt'
    const fileTrimMap = settings?.fileTrimMap || {}

    const listLines = inputPaths.flatMap(p => {
      const escaped = p.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
      const trim = fileTrimMap[p]
      const lines = [`file '${escaped}'`]
      if (trim?.start != null) lines.push(`inpoint ${trim.start}`)
      if (trim?.end != null) lines.push(`outpoint ${trim.end}`)
      return lines
    })
    fs.writeFileSync(listFile, listLines.join('\n'))

    let cmd = ffmpeg()
      .input(listFile)
      .inputOptions(['-f', 'concat', '-safe', '0'])

    const hasTranscoding = (settings?.videoCodec && settings.videoCodec !== 'copy') ||
                           (settings?.audioCodec && settings.audioCodec !== 'copy')

    if (settings?.videoCodec && settings.videoCodec !== 'copy') {
      cmd = cmd.videoCodec(settings.videoCodec)
    }
    if (settings?.audioCodec && settings.audioCodec !== 'copy') {
      cmd = cmd.audioCodec(settings.audioCodec)
    }
    if (settings?.audioBitrate && settings.audioBitrate !== 'copy') {
      cmd = cmd.audioBitrate(settings.audioBitrate)
    }

    if (!hasTranscoding) {
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

export async function addWatermark(videoPath, watermarkPath, outputPath, position = 'topleft', wmScale = 0.2) {
  const overlayPos = {
    topleft:     'overlay=10:10',
    topright:    'overlay=W-w-10:10',
    bottomleft:  'overlay=10:H-h-10',
    bottomright: 'overlay=W-w-10:H-h-10',
    center:      'overlay=(W-w)/2:(H-h)/2',
  }
  const pos = overlayPos[position] || overlayPos.topleft
  const filter = `[1:v][0:v]scale2ref=iw*${wmScale}:-1[wm][base];[base][wm]${pos}[out]`
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(watermarkPath)
      .complexFilter([filter], '[out]')
      .outputOptions(['-c:a', 'copy'])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  })
}

// Trim multiple segments from a single file
// exportMode 'single': concat all segments into one output file
// exportMode 'multiple': save each segment as a separate file (output_1.ext, output_2.ext…)
export async function trimMultiple(inputPath, outputPath, segments, exportMode = 'single') {
  if (!segments || segments.length === 0) throw new Error('No segments provided')

  if (exportMode === 'multiple') {
    const ext = path.extname(outputPath)
    const base = outputPath.slice(0, -ext.length)
    const jobs = segments.map((seg, i) => new Promise((resolve, reject) => {
      const out = `${base}_${i + 1}${ext}`
      ffmpeg(inputPath)
        .seekInput(parseFloat(seg.start) || 0)
        .duration(parseFloat(seg.end) - (parseFloat(seg.start) || 0))
        .outputOptions(['-c', 'copy'])
        .output(out)
        .on('end', resolve)
        .on('error', reject)
        .run()
    }))
    return Promise.all(jobs)
  }

  // Single concat mode using filter_complex
  return new Promise((resolve, reject) => {
    const n = segments.length
    const vParts = [], aParts = [], filterParts = []

    segments.forEach((seg, i) => {
      const start = parseFloat(seg.start) || 0
      const end = parseFloat(seg.end)
      filterParts.push(
        `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${i}]`,
        `[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${i}]`,
      )
      vParts.push(`[v${i}]`)
      aParts.push(`[a${i}]`)
    })
    filterParts.push(`${vParts.join('')}${aParts.join('')}concat=n=${n}:v=1:a=1[vout][aout]`)

    ffmpeg(inputPath)
      .complexFilter(filterParts)
      .outputOptions(['-map', '[vout]', '-map', '[aout]'])
      .output(outputPath)
      .on('end', resolve)
      .on('error', (err) => {
        // Retry without audio stream
        if (err.message.includes('Stream specifier') || err.message.includes('matches no streams') || err.message.includes('audio')) {
          const vOnly = segments.map((seg, i) => `[0:v]trim=start=${parseFloat(seg.start)||0}:end=${parseFloat(seg.end)},setpts=PTS-STARTPTS[v${i}]`)
          const vOnlyParts = segments.map((_, i) => `[v${i}]`)
          vOnly.push(`${vOnlyParts.join('')}concat=n=${n}:v=1:a=0[vout]`)
          ffmpeg(inputPath)
            .complexFilter(vOnly)
            .outputOptions(['-map', '[vout]'])
            .output(outputPath)
            .on('end', resolve)
            .on('error', reject)
            .run()
        } else {
          reject(err)
        }
      })
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

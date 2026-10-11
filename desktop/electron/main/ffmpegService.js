import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import path from 'path'
import fs from 'fs'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

const activeJobs = new Map()

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

  if (settings.videoCodec) cmd = cmd.videoCodec(settings.videoCodec)
  if (settings.audioCodec) cmd = cmd.audioCodec(settings.audioCodec)
  if (settings.videoBitrate) cmd = cmd.videoBitrate(settings.videoBitrate)
  if (settings.audioBitrate) cmd = cmd.audioBitrate(settings.audioBitrate)
  if (settings.fps) cmd = cmd.fps(parseFloat(settings.fps))
  if (settings.sampleRate) cmd = cmd.audioFrequency(parseInt(settings.sampleRate))
  if (settings.channels) cmd = cmd.audioChannels(parseInt(settings.channels))

  if (settings.volume) cmd = cmd.audioFilters(`volume=${settings.volume}`)
  if (settings.normalize) cmd = cmd.audioFilters('loudnorm')
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

export function startConversion(taskId, inputPath, outputPath, settings, formatArgs, onProgress, onComplete, onError) {
  const cmd = buildFFmpegCommand(inputPath, outputPath, settings, formatArgs)

  cmd.on('progress', (progress) => {
    onProgress(taskId, progress.percent || 0)
  })

  cmd.on('end', () => {
    activeJobs.delete(taskId)
    onComplete(taskId)
  })

  cmd.on('error', (err) => {
    activeJobs.delete(taskId)
    onError(taskId, err.message)
  })

  cmd.run()
  activeJobs.set(taskId, cmd)
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

export async function mergeVideos(inputPaths, outputPath, onProgress) {
  return new Promise((resolve, reject) => {
    const listFile = outputPath + '.txt'
    const listContent = inputPaths.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n')
    fs.writeFileSync(listFile, listContent)

    ffmpeg()
      .input(listFile)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions(['-c', 'copy'])
      .output(outputPath)
      .on('progress', p => onProgress && onProgress(p.percent || 0))
      .on('end', () => { fs.unlinkSync(listFile); resolve() })
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

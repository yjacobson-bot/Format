export const VIDEO_FORMATS = [
  {
    id: 'mp4', label: 'MP4', ext: 'mp4', icon: '🎬',
    description: 'Most compatible format for all devices',
    ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac', '-movflags', '+faststart'],
  },
  {
    id: 'avi', label: 'AVI', ext: 'avi', icon: '🎬',
    description: 'Audio Video Interleave',
    ffmpegArgs: ['-c:v', 'mpeg4', '-c:a', 'mp3'],
  },
  {
    id: 'mkv', label: 'MKV', ext: 'mkv', icon: '🎬',
    description: 'Matroska - supports multiple tracks',
    ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac'],
  },
  {
    id: 'mov', label: 'MOV', ext: 'mov', icon: '🎬',
    description: 'Apple QuickTime Movie',
    ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac'],
  },
  {
    id: 'wmv', label: 'WMV', ext: 'wmv', icon: '🎬',
    description: 'Windows Media Video',
    ffmpegArgs: ['-c:v', 'wmv2', '-c:a', 'wmav2'],
  },
  {
    id: 'flv', label: 'FLV', ext: 'flv', icon: '🎬',
    description: 'Flash Video',
    ffmpegArgs: ['-c:v', 'flv1', '-c:a', 'mp3'],
  },
  {
    id: 'webm', label: 'WebM', ext: 'webm', icon: '🎬',
    description: 'Open web video format',
    ffmpegArgs: ['-c:v', 'libvpx-vp9', '-c:a', 'libopus'],
  },
  {
    id: '3gp', label: '3GP', ext: '3gp', icon: '📱',
    description: 'Mobile phone video format',
    ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac', '-vf', 'scale=320:-2'],
  },
  {
    id: 'mpeg', label: 'MPEG', ext: 'mpg', icon: '🎬',
    description: 'MPEG-1/2 Video',
    ffmpegArgs: ['-c:v', 'mpeg2video', '-c:a', 'mp2'],
  },
  {
    id: 'ts', label: 'TS', ext: 'ts', icon: '📺',
    description: 'MPEG Transport Stream',
    ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac'],
  },
  {
    id: 'm2ts', label: 'M2TS', ext: 'm2ts', icon: '📀',
    description: 'Blu-ray BDAV MPEG-2 Transport Stream',
    ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac'],
  },
  {
    id: 'ogv', label: 'OGV', ext: 'ogv', icon: '🎬',
    description: 'Ogg Theora Video',
    ffmpegArgs: ['-c:v', 'libtheora', '-c:a', 'libvorbis'],
  },
  {
    id: 'h265', label: 'H.265/HEVC', ext: 'mp4', icon: '🎬',
    description: 'High Efficiency Video Coding',
    ffmpegArgs: ['-c:v', 'libx265', '-c:a', 'aac'],
  },
  {
    id: 'gif_video', label: 'GIF מוידאו', ext: 'gif', icon: '🖼️',
    description: 'Animated GIF from video',
    ffmpegArgs: ['-vf', 'fps=10,scale=480:-1:flags=lanczos', '-loop', '0'],
    audioDisabled: true,
  },
]

export const AUDIO_FORMATS = [
  {
    id: 'mp3', label: 'MP3', ext: 'mp3', icon: '🎵',
    description: 'Most popular audio format',
    ffmpegArgs: ['-c:a', 'libmp3lame', '-q:a', '2'],
  },
  {
    id: 'aac', label: 'AAC', ext: 'aac', icon: '🎵',
    description: 'Advanced Audio Coding',
    ffmpegArgs: ['-c:a', 'aac', '-b:a', '192k'],
  },
  {
    id: 'wav', label: 'WAV', ext: 'wav', icon: '🎵',
    description: 'Uncompressed PCM audio',
    ffmpegArgs: ['-c:a', 'pcm_s16le'],
  },
  {
    id: 'flac', label: 'FLAC', ext: 'flac', icon: '🎵',
    description: 'Free Lossless Audio Codec',
    ffmpegArgs: ['-c:a', 'flac'],
  },
  {
    id: 'ogg', label: 'OGG', ext: 'ogg', icon: '🎵',
    description: 'Open container format - Vorbis',
    ffmpegArgs: ['-c:a', 'libvorbis', '-q:a', '4'],
  },
  {
    id: 'wma', label: 'WMA', ext: 'wma', icon: '🎵',
    description: 'Windows Media Audio',
    ffmpegArgs: ['-c:a', 'wmav2', '-b:a', '192k'],
  },
  {
    id: 'm4a', label: 'M4A', ext: 'm4a', icon: '🎵',
    description: 'Apple AAC audio',
    ffmpegArgs: ['-c:a', 'aac', '-b:a', '192k'],
  },
  {
    id: 'opus', label: 'OPUS', ext: 'opus', icon: '🎵',
    description: 'Modern efficient audio codec',
    ffmpegArgs: ['-c:a', 'libopus', '-b:a', '128k'],
  },
  {
    id: 'ac3', label: 'AC3', ext: 'ac3', icon: '🔊',
    description: 'Dolby Digital Audio',
    ffmpegArgs: ['-c:a', 'ac3', '-b:a', '192k'],
  },
  {
    id: 'amr', label: 'AMR', ext: 'amr', icon: '📱',
    description: 'Adaptive Multi-Rate (mobile)',
    ffmpegArgs: ['-c:a', 'libopencore_amrnb', '-ar', '8000', '-ac', '1'],
  },
  {
    id: 'aiff', label: 'AIFF', ext: 'aiff', icon: '🎵',
    description: 'Audio Interchange File Format',
    ffmpegArgs: ['-c:a', 'pcm_s16be'],
  },
  {
    id: 'ape', label: 'APE', ext: 'ape', icon: '🎵',
    description: "Monkey's Audio - lossless",
    ffmpegArgs: ['-c:a', 'ape'],
  },
]

export const IMAGE_FORMATS = [
  {
    id: 'jpg', label: 'JPG', ext: 'jpg', icon: '🖼️',
    description: 'JPEG - best for photos',
    ffmpegArgs: ['-q:v', '2'],
  },
  {
    id: 'png', label: 'PNG', ext: 'png', icon: '🖼️',
    description: 'PNG - lossless with transparency',
    ffmpegArgs: ['-compression_level', '6'],
  },
  {
    id: 'bmp', label: 'BMP', ext: 'bmp', icon: '🖼️',
    description: 'Windows Bitmap',
    ffmpegArgs: [],
  },
  {
    id: 'gif', label: 'GIF', ext: 'gif', icon: '🖼️',
    description: 'Graphics Interchange Format',
    ffmpegArgs: [],
  },
  {
    id: 'webp', label: 'WebP', ext: 'webp', icon: '🖼️',
    description: 'Modern web image format',
    ffmpegArgs: ['-quality', '80'],
  },
  {
    id: 'tiff', label: 'TIFF', ext: 'tiff', icon: '🖼️',
    description: 'Tagged Image File Format',
    ffmpegArgs: ['-compression_algo', 'lzw'],
  },
  {
    id: 'ico', label: 'ICO', ext: 'ico', icon: '🖼️',
    description: 'Windows Icon',
    ffmpegArgs: ['-vf', 'scale=256:256'],
  },
]

export const RESOLUTIONS = [
  { label: 'זהה למקור', value: null },
  { label: '4K (3840×2160)', value: '3840:2160' },
  { label: '1080p (1920×1080)', value: '1920:1080' },
  { label: '720p (1280×720)', value: '1280:720' },
  { label: '480p (854×480)', value: '854:480' },
  { label: '360p (640×360)', value: '640:360' },
  { label: '240p (426×240)', value: '426:240' },
  { label: '320×240', value: '320:240' },
  { label: '176×144 (3GP)', value: '176:144' },
]

export const VIDEO_BITRATES = [
  { label: 'אוטומטי', value: null },
  { label: '8000 kbps', value: '8000k' },
  { label: '4000 kbps', value: '4000k' },
  { label: '2000 kbps', value: '2000k' },
  { label: '1500 kbps', value: '1500k' },
  { label: '1000 kbps', value: '1000k' },
  { label: '500 kbps', value: '500k' },
  { label: '256 kbps', value: '256k' },
]

export const AUDIO_BITRATES = [
  { label: 'אוטומטי', value: null },
  { label: '320 kbps', value: '320k' },
  { label: '256 kbps', value: '256k' },
  { label: '192 kbps', value: '192k' },
  { label: '128 kbps', value: '128k' },
  { label: '96 kbps', value: '96k' },
  { label: '64 kbps', value: '64k' },
  { label: '32 kbps', value: '32k' },
]

export const FRAMERATES = [
  { label: 'זהה למקור', value: null },
  { label: '60 fps', value: '60' },
  { label: '30 fps', value: '30' },
  { label: '25 fps', value: '25' },
  { label: '24 fps', value: '24' },
  { label: '15 fps', value: '15' },
  { label: '10 fps', value: '10' },
]

export const SAMPLE_RATES = [
  { label: 'זהה למקור', value: null },
  { label: '48000 Hz', value: '48000' },
  { label: '44100 Hz', value: '44100' },
  { label: '32000 Hz', value: '32000' },
  { label: '22050 Hz', value: '22050' },
  { label: '16000 Hz', value: '16000' },
  { label: '8000 Hz', value: '8000' },
]

export const AUDIO_CHANNELS = [
  { label: 'זהה למקור', value: null },
  { label: 'סטריאו (2)', value: '2' },
  { label: 'מונו (1)', value: '1' },
  { label: 'סראונד 5.1 (6)', value: '6' },
]

export const DEVICE_PRESETS = [
  {
    id: 'iphone', label: 'iPhone/iPad', icon: '📱', category: 'video',
    settings: { format: 'mp4', resolution: '1920:1080', videoBitrate: '2000k', audioBitrate: '128k', fps: '30' }
  },
  {
    id: 'android', label: 'Android Phone', icon: '📱', category: 'video',
    settings: { format: 'mp4', resolution: '1280:720', videoBitrate: '1500k', audioBitrate: '128k', fps: '30' }
  },
  {
    id: 'ps4', label: 'PlayStation 4/5', icon: '🎮', category: 'video',
    settings: { format: 'mp4', resolution: '1920:1080', videoBitrate: '8000k', audioBitrate: '192k', fps: '60' }
  },
  {
    id: 'xbox', label: 'Xbox One/Series', icon: '🎮', category: 'video',
    settings: { format: 'mp4', resolution: '1920:1080', videoBitrate: '8000k', audioBitrate: '192k', fps: '60' }
  },
  {
    id: 'youtube', label: 'YouTube', icon: '▶️', category: 'video',
    settings: { format: 'mp4', resolution: '1920:1080', videoBitrate: '8000k', audioBitrate: '192k', fps: '30' }
  },
  {
    id: 'twitter', label: 'Twitter/X', icon: '🐦', category: 'video',
    settings: { format: 'mp4', resolution: '1280:720', videoBitrate: '2500k', audioBitrate: '128k', fps: '30' }
  },
  {
    id: 'instagram', label: 'Instagram', icon: '📸', category: 'video',
    settings: { format: 'mp4', resolution: '1080:1080', videoBitrate: '3500k', audioBitrate: '128k', fps: '30' }
  },
  {
    id: 'dvd', label: 'DVD', icon: '📀', category: 'video',
    settings: { format: 'mpg', resolution: '720:480', videoBitrate: '4000k', audioBitrate: '192k', fps: '29.97' }
  },
]

export const VIDEO_CODECS = [
  { label: 'אוטומטי', value: null },
  { label: 'H.264 (libx264)', value: 'libx264' },
  { label: 'H.265/HEVC (libx265)', value: 'libx265' },
  { label: 'VP9 (libvpx-vp9)', value: 'libvpx-vp9' },
  { label: 'MPEG-4 (mpeg4)', value: 'mpeg4' },
  { label: 'MPEG-2 (mpeg2video)', value: 'mpeg2video' },
  { label: 'העתק (ללא קידוד מחדש)', value: 'copy' },
]

export const AUDIO_CODECS = [
  { label: 'אוטומטי', value: null },
  { label: 'AAC (aac)', value: 'aac' },
  { label: 'MP3 (libmp3lame)', value: 'libmp3lame' },
  { label: 'Vorbis (libvorbis)', value: 'libvorbis' },
  { label: 'Opus (libopus)', value: 'libopus' },
  { label: 'FLAC (flac)', value: 'flac' },
  { label: 'העתק (ללא קידוד מחדש)', value: 'copy' },
]

export const VIDEO_INPUT_EXTENSIONS = [
  'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', '3gp', '3g2',
  'mpg', 'mpeg', 'm2ts', 'mts', 'ts', 'vob', 'ogv', 'rm', 'rmvb',
  'asf', 'divx', 'f4v', 'm4v', 'h264', 'hevc', 'gif'
]

export const AUDIO_INPUT_EXTENSIONS = [
  'mp3', 'aac', 'wav', 'flac', 'ogg', 'wma', 'm4a', 'opus', 'ac3',
  'dts', 'amr', 'aiff', 'ape', 'mka', 'mid', 'midi', 'ra', 'voc'
]

export const IMAGE_INPUT_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp', 'tiff', 'tif',
  'ico', 'svg', 'psd', 'raw', 'cr2', 'nef', 'arw', 'dng', 'heic'
]

export const CATEGORIES = [
  { id: 'video', label: 'Video', icon: '🎬', description: 'Convert video files' },
  { id: 'audio', label: 'Audio', icon: '🎵', description: 'Convert audio files' },
  { id: 'image', label: 'Picture', icon: '🖼️', description: 'Convert image files' },
  { id: 'dvd', label: 'DVD/ISO', icon: '📀', description: 'Rip DVD and ISO files' },
  { id: 'tools', label: 'Tools', icon: '🔧', description: 'Merge, split, watermark' },
]

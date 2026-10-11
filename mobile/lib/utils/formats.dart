class FormatOption {
  final String id;
  final String label;
  final String ext;
  final String icon;
  final String description;
  final List<String> ffmpegArgs;
  final bool audioDisabled;

  const FormatOption({
    required this.id,
    required this.label,
    required this.ext,
    required this.icon,
    required this.description,
    this.ffmpegArgs = const [],
    this.audioDisabled = false,
  });
}

class ConversionSettings {
  final String? videoCodec;
  final String? audioCodec;
  final String? resolution;
  final String? videoBitrate;
  final String? audioBitrate;
  final String? fps;
  final String? sampleRate;
  final String? channels;
  final double? trimStart;
  final double? trimEnd;
  final int? rotate;
  final bool grayscale;
  final bool normalize;
  final String? quality;
  final String? width;
  final String? height;

  const ConversionSettings({
    this.videoCodec,
    this.audioCodec,
    this.resolution,
    this.videoBitrate,
    this.audioBitrate,
    this.fps,
    this.sampleRate,
    this.channels,
    this.trimStart,
    this.trimEnd,
    this.rotate,
    this.grayscale = false,
    this.normalize = false,
    this.quality,
    this.width,
    this.height,
  });

  ConversionSettings copyWith({
    String? videoCodec,
    String? audioCodec,
    String? resolution,
    String? videoBitrate,
    String? audioBitrate,
    String? fps,
    String? sampleRate,
    String? channels,
    double? trimStart,
    double? trimEnd,
    int? rotate,
    bool? grayscale,
    bool? normalize,
    String? quality,
    String? width,
    String? height,
  }) {
    return ConversionSettings(
      videoCodec: videoCodec ?? this.videoCodec,
      audioCodec: audioCodec ?? this.audioCodec,
      resolution: resolution ?? this.resolution,
      videoBitrate: videoBitrate ?? this.videoBitrate,
      audioBitrate: audioBitrate ?? this.audioBitrate,
      fps: fps ?? this.fps,
      sampleRate: sampleRate ?? this.sampleRate,
      channels: channels ?? this.channels,
      trimStart: trimStart ?? this.trimStart,
      trimEnd: trimEnd ?? this.trimEnd,
      rotate: rotate ?? this.rotate,
      grayscale: grayscale ?? this.grayscale,
      normalize: normalize ?? this.normalize,
      quality: quality ?? this.quality,
      width: width ?? this.width,
      height: height ?? this.height,
    );
  }

  List<String> toFFmpegArgs() {
    final args = <String>[];
    if (trimStart != null) args.addAll(['-ss', trimStart.toString()]);
    if (trimEnd != null && trimStart != null) args.addAll(['-t', (trimEnd! - trimStart!).toString()]);
    if (videoCodec != null) args.addAll(['-c:v', videoCodec!]);
    if (audioCodec != null) args.addAll(['-c:a', audioCodec!]);
    if (videoBitrate != null) args.addAll(['-b:v', videoBitrate!]);
    if (audioBitrate != null) args.addAll(['-b:a', audioBitrate!]);
    if (fps != null) args.addAll(['-r', fps!]);
    if (sampleRate != null) args.addAll(['-ar', sampleRate!]);
    if (channels != null) args.addAll(['-ac', channels!]);
    if (resolution != null) args.addAll(['-vf', 'scale=${resolution!}']);
    if (grayscale) args.addAll(['-vf', 'hue=s=0']);
    if (normalize) args.addAll(['-af', 'loudnorm']);
    if (quality != null) args.addAll(['-q:v', quality!]);
    return args;
  }
}

const videoFormats = [
  FormatOption(id: 'mp4', label: 'MP4', ext: 'mp4', icon: '🎬', description: 'Most compatible format', ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac', '-movflags', '+faststart']),
  FormatOption(id: 'mkv', label: 'MKV', ext: 'mkv', icon: '🎬', description: 'Matroska container', ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac']),
  FormatOption(id: 'avi', label: 'AVI', ext: 'avi', icon: '🎬', description: 'Audio Video Interleave', ffmpegArgs: ['-c:v', 'mpeg4', '-c:a', 'mp3']),
  FormatOption(id: 'mov', label: 'MOV', ext: 'mov', icon: '🎬', description: 'QuickTime Movie', ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac']),
  FormatOption(id: 'webm', label: 'WebM', ext: 'webm', icon: '🎬', description: 'Open web video', ffmpegArgs: ['-c:v', 'libvpx-vp9', '-c:a', 'libopus']),
  FormatOption(id: '3gp', label: '3GP', ext: '3gp', icon: '📱', description: 'Mobile video format', ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac', '-vf', 'scale=320:-2']),
  FormatOption(id: 'flv', label: 'FLV', ext: 'flv', icon: '🎬', description: 'Flash Video', ffmpegArgs: ['-c:v', 'flv1', '-c:a', 'mp3']),
  FormatOption(id: 'wmv', label: 'WMV', ext: 'wmv', icon: '🎬', description: 'Windows Media Video', ffmpegArgs: ['-c:v', 'wmv2', '-c:a', 'wmav2']),
  FormatOption(id: 'ts', label: 'TS', ext: 'ts', icon: '📺', description: 'MPEG Transport Stream', ffmpegArgs: ['-c:v', 'libx264', '-c:a', 'aac']),
  FormatOption(id: 'gif', label: 'GIF', ext: 'gif', icon: '🖼️', description: 'Animated GIF', ffmpegArgs: ['-vf', 'fps=10,scale=480:-1:flags=lanczos'], audioDisabled: true),
];

const audioFormats = [
  FormatOption(id: 'mp3', label: 'MP3', ext: 'mp3', icon: '🎵', description: 'Most popular audio', ffmpegArgs: ['-c:a', 'libmp3lame', '-q:a', '2']),
  FormatOption(id: 'aac', label: 'AAC', ext: 'aac', icon: '🎵', description: 'Advanced Audio Coding', ffmpegArgs: ['-c:a', 'aac', '-b:a', '192k']),
  FormatOption(id: 'wav', label: 'WAV', ext: 'wav', icon: '🎵', description: 'Uncompressed PCM', ffmpegArgs: ['-c:a', 'pcm_s16le']),
  FormatOption(id: 'flac', label: 'FLAC', ext: 'flac', icon: '🎵', description: 'Lossless audio', ffmpegArgs: ['-c:a', 'flac']),
  FormatOption(id: 'ogg', label: 'OGG', ext: 'ogg', icon: '🎵', description: 'Ogg Vorbis', ffmpegArgs: ['-c:a', 'libvorbis', '-q:a', '4']),
  FormatOption(id: 'opus', label: 'OPUS', ext: 'opus', icon: '🎵', description: 'Modern codec', ffmpegArgs: ['-c:a', 'libopus', '-b:a', '128k']),
  FormatOption(id: 'm4a', label: 'M4A', ext: 'm4a', icon: '🎵', description: 'Apple AAC', ffmpegArgs: ['-c:a', 'aac', '-b:a', '192k']),
  FormatOption(id: 'wma', label: 'WMA', ext: 'wma', icon: '🎵', description: 'Windows Media Audio', ffmpegArgs: ['-c:a', 'wmav2', '-b:a', '192k']),
  FormatOption(id: 'ac3', label: 'AC3', ext: 'ac3', icon: '🔊', description: 'Dolby Digital', ffmpegArgs: ['-c:a', 'ac3', '-b:a', '192k']),
];

const imageFormats = [
  FormatOption(id: 'jpg', label: 'JPG', ext: 'jpg', icon: '🖼️', description: 'Best for photos', ffmpegArgs: ['-q:v', '2']),
  FormatOption(id: 'png', label: 'PNG', ext: 'png', icon: '🖼️', description: 'Lossless with transparency', ffmpegArgs: []),
  FormatOption(id: 'bmp', label: 'BMP', ext: 'bmp', icon: '🖼️', description: 'Windows Bitmap', ffmpegArgs: []),
  FormatOption(id: 'webp', label: 'WebP', ext: 'webp', icon: '🖼️', description: 'Modern web format', ffmpegArgs: []),
  FormatOption(id: 'gif', label: 'GIF', ext: 'gif', icon: '🖼️', description: 'Animated images', ffmpegArgs: []),
  FormatOption(id: 'tiff', label: 'TIFF', ext: 'tiff', icon: '🖼️', description: 'High quality print', ffmpegArgs: []),
];

const resolutions = ['Same as source', '3840:2160 (4K)', '1920:1080 (1080p)', '1280:720 (720p)', '854:480 (480p)', '640:360 (360p)', '320:240'];
const videoBitrates = ['Auto', '8000k', '4000k', '2000k', '1500k', '1000k', '500k', '256k'];
const audioBitrates = ['Auto', '320k', '256k', '192k', '128k', '96k', '64k'];
const frameRates = ['Same as source', '60', '30', '25', '24', '15', '10'];
const sampleRates = ['Same as source', '48000', '44100', '32000', '22050', '16000', '8000'];
const audioChannels = ['Same as source', '2 (Stereo)', '1 (Mono)', '6 (5.1)'];

const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', '3gp', 'mpeg', 'mpg', 'ts', 'm2ts', 'ogv', 'vob', 'f4v', 'm4v'];
const audioExtensions = ['mp3', 'aac', 'wav', 'flac', 'ogg', 'wma', 'm4a', 'opus', 'ac3', 'aiff', 'amr'];
const imageExtensions = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp', 'tiff', 'tif', 'heic'];

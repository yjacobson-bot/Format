import 'dart:io';
import 'package:ffmpeg_kit_flutter_full_gpl/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter_full_gpl/ffprobe_kit.dart';
import 'package:ffmpeg_kit_flutter_full_gpl/return_code.dart';
import 'package:ffmpeg_kit_flutter_full_gpl/log.dart' as fflog;
import 'package:ffmpeg_kit_flutter_full_gpl/statistics.dart';
import 'package:path/path.dart' as p;
import '../models/conversion_task.dart';
import '../utils/formats.dart';

class FfmpegService {
  static final FfmpegService _instance = FfmpegService._internal();
  factory FfmpegService() => _instance;
  FfmpegService._internal();

  Future<Map<String, dynamic>?> probeFile(String inputPath) async {
    final session = await FFprobeKit.getMediaInformation(inputPath);
    final info = session.getMediaInformation();
    if (info == null) return null;
    return {
      'duration': info.getDuration(),
      'size': info.getSize(),
      'bitrate': info.getBitrate(),
      'streams': info.getStreams()?.map((s) => {
        'type': s.getType(),
        'codec': s.getCodec(),
        'width': s.getWidth(),
        'height': s.getHeight(),
        'sampleRate': s.getSampleRate(),
        'channelLayout': s.getChannelLayout(),
      }).toList(),
    };
  }

  Future<String> buildOutputPath(String inputPath, String? outputDir, String ext) async {
    final baseName = p.basenameWithoutExtension(inputPath);
    final dir = outputDir ?? p.dirname(inputPath);

    String outPath = p.join(dir, '$baseName.$ext');
    int counter = 1;
    while (await File(outPath).exists()) {
      outPath = p.join(dir, '${baseName}_$counter.$ext');
      counter++;
    }
    return outPath;
  }

  List<String> buildArgs(
    String inputPath,
    String outputPath,
    ConversionSettings settings,
    List<String> formatArgs,
  ) {
    final args = <String>['-i', inputPath];

    if (settings.trimStart != null) {
      args.insertAll(0, ['-ss', settings.trimStart.toString()]);
    }
    if (settings.trimEnd != null && settings.trimStart != null) {
      args.addAll(['-t', (settings.trimEnd! - settings.trimStart!).toString()]);
    }

    final vfFilters = <String>[];
    if (settings.resolution != null) {
      vfFilters.add('scale=${settings.resolution}');
    }
    if (settings.rotate != null) {
      switch (settings.rotate) {
        case 90: vfFilters.add('transpose=1'); break;
        case 180: vfFilters.addAll(['transpose=2', 'transpose=2']); break;
        case 270: vfFilters.add('transpose=2'); break;
      }
    }
    if (settings.grayscale) vfFilters.add('hue=s=0');
    if (vfFilters.isNotEmpty) args.addAll(['-vf', vfFilters.join(',')]);

    if (settings.videoCodec != null) args.addAll(['-c:v', settings.videoCodec!]);
    if (settings.audioCodec != null) args.addAll(['-c:a', settings.audioCodec!]);
    if (settings.videoBitrate != null) args.addAll(['-b:v', settings.videoBitrate!]);
    if (settings.audioBitrate != null) args.addAll(['-b:a', settings.audioBitrate!]);
    if (settings.fps != null) args.addAll(['-r', settings.fps!]);
    if (settings.sampleRate != null) args.addAll(['-ar', settings.sampleRate!]);
    if (settings.channels != null) args.addAll(['-ac', settings.channels!]);

    final afFilters = <String>[];
    if (settings.normalize) afFilters.add('loudnorm');
    if (afFilters.isNotEmpty) args.addAll(['-af', afFilters.join(',')]);

    if (settings.quality != null) args.addAll(['-q:v', settings.quality!]);

    final settingsApplied = {
      if (settings.videoCodec != null) '-c:v',
      if (settings.audioCodec != null) '-c:a',
      if (settings.videoBitrate != null) '-b:v',
      if (settings.audioBitrate != null) '-b:a',
      if (settings.fps != null) '-r',
      if (settings.sampleRate != null) '-ar',
      if (settings.channels != null) '-ac',
    };

    for (int i = 0; i < formatArgs.length; i++) {
      final arg = formatArgs[i];
      if (!settingsApplied.contains(arg)) {
        args.add(arg);
      } else if (i + 1 < formatArgs.length && !formatArgs[i + 1].startsWith('-')) {
        i++;
      }
    }

    args.addAll(['-y', outputPath]);
    return args;
  }

  Future<bool> convert(
    ConversionTask task,
    String outputPath, {
    void Function(double progress)? onProgress,
    void Function(String log)? onLog,
  }) async {
    final args = buildArgs(
      task.inputPath,
      outputPath,
      task.settings,
      task.outputFormat.ffmpegArgs,
    );

    final session = await FFmpegKit.executeWithArgumentsAsync(
      args,
      (s) async {
        final rc = await s.getReturnCode();
      },
      (log) {
        onLog?.call(log.getMessage());
      },
      (stats) {
        final time = stats.getTime();
        if (time > 0 && onProgress != null) {
          onProgress(stats.getVideoFrameNumber()?.toDouble() ?? 0);
        }
      },
    );

    final rc = await session.getReturnCode();
    return ReturnCode.isSuccess(rc);
  }

  Future<bool> mergeVideos(List<String> inputPaths, String outputPath) async {
    final listContent = inputPaths.map((p) => "file '$p'").join('\n');
    final listFile = File('${outputPath}_list.txt');
    await listFile.writeAsString(listContent);

    final session = await FFmpegKit.execute(
      '-f concat -safe 0 -i "${listFile.path}" -c copy -y "$outputPath"'
    );
    await listFile.delete();
    final rc = await session.getReturnCode();
    return ReturnCode.isSuccess(rc);
  }

  Future<bool> splitVideo(String inputPath, String outputDir, double segmentDuration) async {
    final baseName = p.basenameWithoutExtension(inputPath);
    final ext = p.extension(inputPath);
    final outputPattern = p.join(outputDir, '${baseName}_%03d$ext');

    final session = await FFmpegKit.execute(
      '-i "$inputPath" -c copy -map 0 -segment_time $segmentDuration -f segment -reset_timestamps 1 -y "$outputPattern"'
    );
    final rc = await session.getReturnCode();
    return ReturnCode.isSuccess(rc);
  }

  void cancelAll() {
    FFmpegKit.cancel();
  }
}

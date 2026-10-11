import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';
import '../models/conversion_task.dart';
import '../services/ffmpeg_service.dart';
import '../utils/formats.dart';

class ConversionProvider extends ChangeNotifier {
  final FfmpegService _ffmpeg = FfmpegService();
  final _uuid = const Uuid();

  final List<ConversionTask> _tasks = [];
  String _outputDir = '';
  int _maxConcurrent = 2;
  bool _deleteSourceAfter = false;

  List<ConversionTask> get tasks => List.unmodifiable(_tasks);
  String get outputDir => _outputDir;
  int get maxConcurrent => _maxConcurrent;
  bool get deleteSourceAfter => _deleteSourceAfter;

  int get pendingCount => _tasks.where((t) => t.status == TaskStatus.pending).length;
  int get runningCount => _tasks.where((t) => t.status == TaskStatus.running).length;
  int get doneCount => _tasks.where((t) => t.status == TaskStatus.done).length;
  int get errorCount => _tasks.where((t) => t.status == TaskStatus.error).length;

  Future<void> init() async {
    final dir = await getExternalStorageDirectory();
    _outputDir = '${dir?.path ?? '/storage/emulated/0/Movies'}/FormatFactory';
    await Directory(_outputDir).create(recursive: true);
  }

  void setOutputDir(String dir) {
    _outputDir = dir;
    notifyListeners();
  }

  void setMaxConcurrent(int v) {
    _maxConcurrent = v;
    notifyListeners();
  }

  void setDeleteSourceAfter(bool v) {
    _deleteSourceAfter = v;
    notifyListeners();
  }

  void addTasks(List<String> filePaths, FormatOption outputFormat, ConversionSettings settings) {
    for (final path in filePaths) {
      final file = File(path);
      _tasks.add(ConversionTask(
        id: _uuid.v4(),
        inputPath: path,
        fileName: path.split('/').last,
        fileSize: file.existsSync() ? file.lengthSync() : 0,
        outputFormat: outputFormat,
        settings: settings,
      ));
    }
    notifyListeners();
    _processQueue();
  }

  Future<void> _processQueue() async {
    final running = _tasks.where((t) => t.status == TaskStatus.running).length;
    final pending = _tasks.where((t) => t.status == TaskStatus.pending).toList();
    final slots = _maxConcurrent - running;

    for (int i = 0; i < slots && i < pending.length; i++) {
      _runTask(pending[i]);
    }
  }

  Future<void> _runTask(ConversionTask task) async {
    final outputPath = await _ffmpeg.buildOutputPath(
      task.inputPath,
      _outputDir.isNotEmpty ? _outputDir : null,
      task.outputFormat.ext,
    );

    task.outputPath = outputPath;
    task.status = TaskStatus.running;
    task.startedAt = DateTime.now();
    task.progress = 0;
    notifyListeners();

    final success = await _ffmpeg.convert(
      task,
      outputPath,
      onProgress: (p) {
        task.progress = p.clamp(0, 100);
        notifyListeners();
      },
    );

    task.completedAt = DateTime.now();
    if (success) {
      task.status = TaskStatus.done;
      task.progress = 100;
      if (_deleteSourceAfter) {
        try { await File(task.inputPath).delete(); } catch (_) {}
      }
    } else {
      task.status = TaskStatus.error;
      task.error = 'Conversion failed. Check file format.';
    }
    notifyListeners();
    _processQueue();
  }

  void startAll() {
    _processQueue();
  }

  void cancelTask(String taskId) {
    final task = _tasks.firstWhere((t) => t.id == taskId, orElse: () => throw StateError(''));
    if (task.status == TaskStatus.running) {
      _ffmpeg.cancelAll();
      task.status = TaskStatus.cancelled;
      task.error = 'Cancelled by user';
      notifyListeners();
      _processQueue();
    }
  }

  void removeTask(String taskId) {
    _tasks.removeWhere((t) => t.id == taskId);
    notifyListeners();
  }

  void clearCompleted() {
    _tasks.removeWhere((t) => t.status == TaskStatus.done || t.status == TaskStatus.cancelled);
    notifyListeners();
  }

  void clearAll() {
    _ffmpeg.cancelAll();
    _tasks.clear();
    notifyListeners();
  }
}

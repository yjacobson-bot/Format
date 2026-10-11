import '../utils/formats.dart';

enum TaskStatus { pending, running, done, error, cancelled }

class ConversionTask {
  final String id;
  final String inputPath;
  final String fileName;
  final int fileSize;
  final FormatOption outputFormat;
  final ConversionSettings settings;
  String? outputPath;
  TaskStatus status;
  double progress;
  String? error;
  DateTime? startedAt;
  DateTime? completedAt;

  ConversionTask({
    required this.id,
    required this.inputPath,
    required this.fileName,
    required this.fileSize,
    required this.outputFormat,
    required this.settings,
    this.outputPath,
    this.status = TaskStatus.pending,
    this.progress = 0,
    this.error,
    this.startedAt,
    this.completedAt,
  });

  String get statusLabel {
    switch (status) {
      case TaskStatus.pending: return 'Pending';
      case TaskStatus.running: return 'Converting';
      case TaskStatus.done: return 'Done';
      case TaskStatus.error: return 'Error';
      case TaskStatus.cancelled: return 'Cancelled';
    }
  }

  String get sizeLabel {
    if (fileSize == 0) return '';
    if (fileSize < 1024) return '${fileSize}B';
    if (fileSize < 1048576) return '${(fileSize / 1024).toStringAsFixed(1)}KB';
    return '${(fileSize / 1048576).toStringAsFixed(1)}MB';
  }
}

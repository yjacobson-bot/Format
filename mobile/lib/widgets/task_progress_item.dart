import 'package:flutter/material.dart';
import '../models/conversion_task.dart';

class TaskProgressItem extends StatelessWidget {
  final ConversionTask task;
  final VoidCallback? onRemove;
  final VoidCallback? onCancel;
  final VoidCallback? onOpenFile;

  const TaskProgressItem({
    super.key,
    required this.task,
    this.onRemove,
    this.onCancel,
    this.onOpenFile,
  });

  Color _statusColor(BuildContext context) {
    switch (task.status) {
      case TaskStatus.pending: return Colors.orange.shade700;
      case TaskStatus.running: return Theme.of(context).colorScheme.primary;
      case TaskStatus.done: return Colors.green.shade600;
      case TaskStatus.error: return Colors.red.shade600;
      case TaskStatus.cancelled: return Colors.grey.shade600;
    }
  }

  IconData _statusIcon() {
    switch (task.status) {
      case TaskStatus.pending: return Icons.hourglass_empty;
      case TaskStatus.running: return Icons.sync;
      case TaskStatus.done: return Icons.check_circle;
      case TaskStatus.error: return Icons.error;
      case TaskStatus.cancelled: return Icons.cancel;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _statusColor(context);
    final isRunning = task.status == TaskStatus.running;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(_statusIcon(), color: color, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    task.fileName,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (task.fileSize > 0)
                  Text(task.sizeLabel, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    task.outputFormat.label,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color),
                  ),
                ),
              ],
            ),

            if (isRunning) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: task.progress / 100,
                        backgroundColor: Colors.grey.shade200,
                        valueColor: AlwaysStoppedAnimation(color),
                        minHeight: 6,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${task.progress.toInt()}%',
                    style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ],

            if (task.status == TaskStatus.error && task.error != null) ...[
              const SizedBox(height: 4),
              Text(task.error!, style: TextStyle(fontSize: 11, color: Colors.red.shade600), maxLines: 2, overflow: TextOverflow.ellipsis),
            ],

            if (task.status == TaskStatus.done && task.outputPath != null) ...[
              const SizedBox(height: 4),
              GestureDetector(
                onTap: onOpenFile,
                child: Text(
                  '→ ${task.outputPath!.split('/').last}',
                  style: TextStyle(fontSize: 11, color: Colors.green.shade600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

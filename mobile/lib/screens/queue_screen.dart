import 'package:flutter/material.dart';
import 'package:open_file/open_file.dart';
import 'package:provider/provider.dart';
import '../providers/conversion_provider.dart';
import '../models/conversion_task.dart';
import '../widgets/task_progress_item.dart';

class QueueScreen extends StatelessWidget {
  const QueueScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ConversionProvider>(
      builder: (context, provider, _) {
        final tasks = provider.tasks;

        return Scaffold(
          body: Column(
            children: [
              if (tasks.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  color: Colors.grey.shade50,
                  child: Row(
                    children: [
                      _StatChip('Total', tasks.length, Colors.grey),
                      const SizedBox(width: 6),
                      _StatChip('Running', provider.runningCount, Colors.blue),
                      const SizedBox(width: 6),
                      _StatChip('Done', provider.doneCount, Colors.green),
                      const SizedBox(width: 6),
                      if (provider.errorCount > 0) ...[
                        _StatChip('Error', provider.errorCount, Colors.red),
                        const SizedBox(width: 6),
                      ],
                      const Spacer(),
                      if (provider.pendingCount > 0)
                        TextButton.icon(
                          onPressed: provider.startAll,
                          icon: const Icon(Icons.play_arrow, size: 16),
                          label: Text('Start All (${provider.pendingCount})'),
                          style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4)),
                        ),
                    ],
                  ),
                ),

              Expanded(
                child: tasks.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.queue_play_next, size: 64, color: Colors.grey.shade300),
                          const SizedBox(height: 12),
                          Text('Queue is empty', style: TextStyle(fontSize: 16, color: Colors.grey.shade500)),
                          const SizedBox(height: 8),
                          Text('Add files from Video, Audio or Image tabs', style: TextStyle(fontSize: 13, color: Colors.grey.shade400)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(12),
                      itemCount: tasks.length,
                      itemBuilder: (ctx, i) {
                        final task = tasks[i];
                        return Dismissible(
                          key: Key(task.id),
                          direction: task.status == TaskStatus.running ? DismissDirection.none : DismissDirection.endToStart,
                          background: Container(
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 16),
                            color: Colors.red.shade100,
                            child: const Icon(Icons.delete, color: Colors.red),
                          ),
                          onDismissed: (_) => provider.removeTask(task.id),
                          child: TaskProgressItem(
                            task: task,
                            onRemove: () => provider.removeTask(task.id),
                            onCancel: () => provider.cancelTask(task.id),
                            onOpenFile: task.outputPath != null ? () => OpenFile.open(task.outputPath!) : null,
                          ),
                        );
                      },
                    ),
              ),
            ],
          ),
          bottomNavigationBar: tasks.isNotEmpty
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: Colors.grey.shade200)),
                ),
                child: Row(
                  children: [
                    if (provider.doneCount > 0)
                      Expanded(
                        child: OutlinedButton(
                          onPressed: provider.clearCompleted,
                          child: const Text('Clear Done'),
                        ),
                      ),
                    if (provider.doneCount > 0) const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: provider.clearAll,
                        style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                        child: const Text('Clear All'),
                      ),
                    ),
                  ],
                ),
              )
            : null,
        );
      },
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final int count;
  final Color color;
  const _StatChip(this.label, this.count, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text('$count $label', style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600)),
    );
  }
}

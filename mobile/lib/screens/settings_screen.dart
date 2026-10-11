import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import '../providers/conversion_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ConversionProvider>(
      builder: (ctx, provider, _) => ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _Section(
            title: 'Output',
            children: [
              ListTile(
                title: const Text('Output folder'),
                subtitle: Text(provider.outputDir, style: const TextStyle(fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                trailing: TextButton(
                  onPressed: () async {
                    final result = await FilePicker.platform.getDirectoryPath();
                    if (result != null) provider.setOutputDir(result);
                  },
                  child: const Text('Change'),
                ),
              ),
              ListTile(
                title: const Text('Max concurrent conversions'),
                trailing: DropdownButton<int>(
                  value: provider.maxConcurrent,
                  underline: const SizedBox(),
                  items: [1, 2, 3, 4].map((v) => DropdownMenuItem(value: v, child: Text('$v'))).toList(),
                  onChanged: (v) => provider.setMaxConcurrent(v ?? 2),
                ),
              ),
            ],
          ),

          _Section(
            title: 'Behavior',
            children: [
              SwitchListTile(
                title: const Text('Delete source file after conversion'),
                subtitle: const Text('⚠️ Permanently deletes original', style: TextStyle(fontSize: 11, color: Colors.red)),
                value: provider.deleteSourceAfter,
                onChanged: provider.setDeleteSourceAfter,
              ),
            ],
          ),

          _Section(
            title: 'About',
            children: [
              const ListTile(
                title: Text('Format Factory'),
                subtitle: Text('Open-source multimedia converter powered by FFmpeg\nNo ads • No telemetry • Privacy-focused'),
                isThreeLine: true,
              ),
              ListTile(
                title: const Text('Version'),
                trailing: const Text('1.0.0', style: TextStyle(color: Colors.grey)),
              ),
              ListTile(
                title: const Text('FFmpeg'),
                subtitle: const Text('Full GPL build — supports all formats'),
                trailing: const Text('6.x', style: TextStyle(color: Colors.grey)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _Section({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(0, 16, 0, 8),
          child: Text(title, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary, letterSpacing: 0.5)),
        ),
        Card(
          child: Column(children: children),
        ),
      ],
    );
  }
}

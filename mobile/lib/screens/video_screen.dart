import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import '../utils/formats.dart';
import '../widgets/format_grid.dart';
import '../widgets/output_settings_sheet.dart';
import '../providers/conversion_provider.dart';

class VideoScreen extends StatefulWidget {
  const VideoScreen({super.key});
  @override
  State<VideoScreen> createState() => _VideoScreenState();
}

class _VideoScreenState extends State<VideoScreen> {
  FormatOption? _selectedFormat;
  ConversionSettings _settings = const ConversionSettings();

  Future<void> _pickFiles() async {
    if (_selectedFormat == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an output format first')),
      );
      return;
    }

    final result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      type: FileType.custom,
      allowedExtensions: videoExtensions,
    );

    if (result != null && mounted) {
      final paths = result.files.map((f) => f.path!).where((p) => p.isNotEmpty).toList();
      if (paths.isEmpty) return;
      context.read<ConversionProvider>().addTasks(paths, _selectedFormat!, _settings);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${paths.length} file(s) added to queue')),
      );
    }
  }

  void _openSettings() {
    if (_selectedFormat == null) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => OutputSettingsSheet(
        category: 'video',
        format: _selectedFormat!,
        initialSettings: _settings,
        onApply: (s) => setState(() => _settings = s),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Select output format:', style: Theme.of(context).textTheme.titleSmall?.copyWith(color: Colors.grey.shade700)),
            const SizedBox(height: 12),
            FormatGrid(
              formats: videoFormats,
              onFormatSelected: (fmt) {
                setState(() => _selectedFormat = fmt);
                _openSettings();
              },
            ),

            if (_selectedFormat != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Theme.of(context).colorScheme.primary.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Text(_selectedFormat!.icon, style: const TextStyle(fontSize: 24)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Convert to ${_selectedFormat!.label}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text(_selectedFormat!.description, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                        ],
                      ),
                    ),
                    TextButton(onPressed: _openSettings, child: const Text('Settings')),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 100,
              child: OutlinedButton.icon(
                onPressed: _selectedFormat != null ? _pickFiles : null,
                icon: const Icon(Icons.add_circle_outline),
                label: Text(_selectedFormat == null ? 'Select a format above first' : 'Add video files'),
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  side: BorderSide(
                    color: _selectedFormat != null ? Theme.of(context).colorScheme.primary : Colors.grey.shade300,
                    style: BorderStyle.solid,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),
            Text(
              '💡 Supports: ${videoExtensions.take(8).join(", ")}...',
              style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
            ),
          ],
        ),
      ),
    );
  }
}

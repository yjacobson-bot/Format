import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import '../utils/formats.dart';
import '../widgets/format_grid.dart';
import '../widgets/output_settings_sheet.dart';
import '../providers/conversion_provider.dart';

class ImageScreen extends StatefulWidget {
  const ImageScreen({super.key});
  @override
  State<ImageScreen> createState() => _ImageScreenState();
}

class _ImageScreenState extends State<ImageScreen> {
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
      type: FileType.image,
    );

    if (result != null && mounted) {
      final paths = result.files.map((f) => f.path!).where((p) => p.isNotEmpty).toList();
      if (paths.isEmpty) return;
      context.read<ConversionProvider>().addTasks(paths, _selectedFormat!, _settings);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${paths.length} image(s) added to queue')),
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
        category: 'image',
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
            Text('Select output image format:', style: Theme.of(context).textTheme.titleSmall?.copyWith(color: Colors.grey.shade700)),
            const SizedBox(height: 12),
            FormatGrid(
              formats: imageFormats,
              onFormatSelected: (fmt) {
                setState(() => _selectedFormat = fmt);
                _openSettings();
              },
            ),

            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.purple.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.purple.shade100),
              ),
              child: Row(
                children: [
                  const Text('💡', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Batch convert hundreds of images at once. Supports JPG, PNG, BMP, GIF, WebP, TIFF and more.',
                      style: TextStyle(fontSize: 12, color: Colors.purple.shade700),
                    ),
                  ),
                ],
              ),
            ),

            if (_selectedFormat != null) ...[
              const SizedBox(height: 12),
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
                      child: Text('Convert to ${_selectedFormat!.label}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                    TextButton(onPressed: _openSettings, child: const Text('Settings')),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 80,
              child: OutlinedButton.icon(
                onPressed: _selectedFormat != null ? _pickFiles : null,
                icon: const Icon(Icons.image),
                label: Text(_selectedFormat == null ? 'Select a format above first' : 'Add image files'),
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

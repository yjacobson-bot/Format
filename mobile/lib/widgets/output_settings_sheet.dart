import 'package:flutter/material.dart';
import '../utils/formats.dart';

class OutputSettingsSheet extends StatefulWidget {
  final String category;
  final FormatOption format;
  final ConversionSettings initialSettings;
  final void Function(ConversionSettings) onApply;

  const OutputSettingsSheet({
    super.key,
    required this.category,
    required this.format,
    required this.initialSettings,
    required this.onApply,
  });

  @override
  State<OutputSettingsSheet> createState() => _OutputSettingsSheetState();
}

class _OutputSettingsSheetState extends State<OutputSettingsSheet> with SingleTickerProviderStateMixin {
  late ConversionSettings _settings;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _settings = widget.initialSettings;
    final tabs = _getTabs();
    _tabController = TabController(length: tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<String> _getTabs() {
    if (widget.category == 'audio') return ['Audio', 'Trim'];
    if (widget.category == 'image') return ['Image'];
    return ['Video', 'Audio', 'Trim'];
  }

  Widget _buildDropdown(String label, String? value, List<String> options, void Function(String?) onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey)),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: options.contains(value) ? value : null,
            decoration: InputDecoration(
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              isDense: true,
            ),
            hint: Text(options.first, style: const TextStyle(fontSize: 13)),
            items: options.map((o) => DropdownMenuItem(value: o == options.first ? null : o, child: Text(o, style: const TextStyle(fontSize: 13)))).toList(),
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tabs = _getTabs();
    return DraggableScrollableSheet(
      initialChildSize: 0.8,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      expand: false,
      builder: (ctx, scroll) => Column(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 16, 0),
            child: Row(
              children: [
                Text('${widget.format.icon} ${widget.format.label} Settings',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const Spacer(),
                IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
              ],
            ),
          ),
          TabBar(
            controller: _tabController,
            labelPadding: const EdgeInsets.symmetric(horizontal: 12),
            tabs: tabs.map((t) => Tab(text: t)).toList(),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: tabs.map((tab) {
                if (tab == 'Video') return _buildVideoTab(scroll);
                if (tab == 'Audio') return _buildAudioTab(scroll);
                if (tab == 'Trim') return _buildTrimTab(scroll);
                if (tab == 'Image') return _buildImageTab(scroll);
                return const SizedBox();
              }).toList(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () { widget.onApply(_settings); Navigator.pop(context); },
                child: const Text('Apply Settings'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVideoTab(ScrollController scroll) => ListView(
    controller: scroll,
    padding: const EdgeInsets.all(16),
    children: [
      _buildDropdown('Resolution', _settings.resolution, resolutions, (v) => setState(() => _settings = _settings.copyWith(resolution: v))),
      _buildDropdown('Video Bitrate', _settings.videoBitrate, videoBitrates, (v) => setState(() => _settings = _settings.copyWith(videoBitrate: v))),
      _buildDropdown('Frame Rate', _settings.fps, frameRates, (v) => setState(() => _settings = _settings.copyWith(fps: v))),
      Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Rotation', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [null, 90, 180, 270].map((r) => ChoiceChip(
                label: Text(r == null ? 'None' : '${r}°'),
                selected: _settings.rotate == r,
                onSelected: (_) => setState(() => _settings = _settings.copyWith(rotate: r)),
              )).toList(),
            ),
          ],
        ),
      ),
    ],
  );

  Widget _buildAudioTab(ScrollController scroll) => ListView(
    controller: scroll,
    padding: const EdgeInsets.all(16),
    children: [
      _buildDropdown('Audio Bitrate', _settings.audioBitrate, audioBitrates, (v) => setState(() => _settings = _settings.copyWith(audioBitrate: v))),
      _buildDropdown('Sample Rate', _settings.sampleRate, sampleRates, (v) => setState(() => _settings = _settings.copyWith(sampleRate: v))),
      _buildDropdown('Channels', _settings.channels, audioChannels, (v) => setState(() => _settings = _settings.copyWith(channels: v))),
      SwitchListTile(
        title: const Text('Normalize loudness', style: TextStyle(fontSize: 14)),
        value: _settings.normalize,
        onChanged: (v) => setState(() => _settings = _settings.copyWith(normalize: v)),
      ),
    ],
  );

  Widget _buildTrimTab(ScrollController scroll) => ListView(
    controller: scroll,
    padding: const EdgeInsets.all(16),
    children: [
      _buildNumberField('Start time (seconds)', _settings.trimStart, (v) => setState(() => _settings = _settings.copyWith(trimStart: v))),
      _buildNumberField('End time (seconds)', _settings.trimEnd, (v) => setState(() => _settings = _settings.copyWith(trimEnd: v))),
    ],
  );

  Widget _buildImageTab(ScrollController scroll) => ListView(
    controller: scroll,
    padding: const EdgeInsets.all(16),
    children: [
      _buildNumberField('Width (px)', double.tryParse(_settings.width ?? ''), (v) => setState(() => _settings = _settings.copyWith(width: v?.toInt().toString()))),
      _buildNumberField('Height (px)', double.tryParse(_settings.height ?? ''), (v) => setState(() => _settings = _settings.copyWith(height: v?.toInt().toString()))),
      _buildNumberField('Quality (1-100)', double.tryParse(_settings.quality ?? ''), (v) => setState(() => _settings = _settings.copyWith(quality: v?.toInt().toString()))),
      SwitchListTile(
        title: const Text('Grayscale', style: TextStyle(fontSize: 14)),
        value: _settings.grayscale,
        onChanged: (v) => setState(() => _settings = _settings.copyWith(grayscale: v)),
      ),
    ],
  );

  Widget _buildNumberField(String label, double? value, void Function(double?) onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey)),
          const SizedBox(height: 6),
          TextFormField(
            initialValue: value?.toString() ?? '',
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              isDense: true,
              hintText: 'Leave empty for default',
            ),
            style: const TextStyle(fontSize: 13),
            onChanged: (v) => onChanged(double.tryParse(v)),
          ),
        ],
      ),
    );
  }
}

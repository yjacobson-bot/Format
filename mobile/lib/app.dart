import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'utils/app_theme.dart';
import 'providers/conversion_provider.dart';
import 'screens/video_screen.dart';
import 'screens/audio_screen.dart';
import 'screens/image_screen.dart';
import 'screens/queue_screen.dart';
import 'screens/settings_screen.dart';

class FormatFactoryApp extends StatelessWidget {
  const FormatFactoryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ConversionProvider()..init(),
      child: MaterialApp(
        title: 'Format Factory',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        home: const _HomeShell(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

class _HomeShell extends StatefulWidget {
  const _HomeShell();
  @override
  State<_HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<_HomeShell> {
  int _selectedIndex = 0;

  static const _tabs = [
    _TabConfig(label: 'Video', icon: Icons.videocam, screen: VideoScreen()),
    _TabConfig(label: 'Audio', icon: Icons.audiotrack, screen: AudioScreen()),
    _TabConfig(label: 'Image', icon: Icons.image, screen: ImageScreen()),
    _TabConfig(label: 'Queue', icon: Icons.queue_play_next, screen: QueueScreen()),
    _TabConfig(label: 'Settings', icon: Icons.settings, screen: SettingsScreen()),
  ];

  @override
  Widget build(BuildContext context) {
    return Consumer<ConversionProvider>(
      builder: (ctx, provider, _) => Scaffold(
        appBar: AppBar(
          title: Row(
            children: [
              const Text('🔄 ', style: TextStyle(fontSize: 20)),
              const Text('Format Factory', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            ],
          ),
          actions: [
            if (provider.pendingCount > 0)
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ElevatedButton.icon(
                  onPressed: () {
                    provider.startAll();
                    setState(() => _selectedIndex = 3);
                  },
                  icon: const Icon(Icons.play_arrow, size: 16),
                  label: Text('Start (${provider.pendingCount})'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green.shade600,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    textStyle: const TextStyle(fontSize: 13),
                  ),
                ),
              ),
          ],
        ),
        body: IndexedStack(
          index: _selectedIndex,
          children: _tabs.map((t) => t.screen).toList(),
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (i) => setState(() => _selectedIndex = i),
          items: _tabs.asMap().entries.map((entry) {
            final tab = entry.value;
            int? badge;
            if (tab.label == 'Queue') {
              final total = provider.pendingCount + provider.runningCount;
              if (total > 0) badge = total;
            }
            return BottomNavigationBarItem(
              icon: badge != null
                ? Badge(label: Text('$badge'), child: Icon(tab.icon))
                : Icon(tab.icon),
              label: tab.label,
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _TabConfig {
  final String label;
  final IconData icon;
  final Widget screen;
  const _TabConfig({required this.label, required this.icon, required this.screen});
}

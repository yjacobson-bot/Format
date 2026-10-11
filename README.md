# Format Factory Clone

A fully offline multimedia converter — desktop (Windows EXE) + mobile (Android APK) — inspired by Format Factory. Built with Electron + React for desktop and Flutter for Android.

## Features

- **Video** — convert between MP4, AVI, MKV, MOV, WMV, FLV, WebM, 3GP, MPEG, TS, H.265, GIF and more
- **Audio** — MP3, AAC, WAV, FLAC, OGG, WMA, M4A, OPUS, AC3, AMR, AIFF, APE; extract audio from video
- **Image** — JPG, PNG, BMP, GIF, WebP, TIFF, ICO
- **DVD/ISO** — convert ISO/VOB disc images to video files
- **Tools** — merge videos, split video by duration, add image watermark
- **Batch queue** — drop multiple files, set concurrent conversion slots
- **Output settings** — codec, bitrate, resolution, framerate, audio channels, trim, device presets
- **100% offline** — FFmpeg binary is bundled; no internet required

---

## Desktop (Windows EXE)

### Prerequisites

- Node.js 18+ and npm
- Windows (for building the EXE); Linux/macOS for development

### Install

```bash
cd desktop
npm install
```

### Development

```bash
npm run dev
```

### Build Windows installer (EXE)

```bash
npm run build:win
```

Output: `desktop/dist/Format Factory Setup x.x.x.exe`

### Build for current platform

```bash
npm run build
```

---

## Mobile (Android APK)

### Prerequisites

- Flutter 3.10+ (`flutter --version`)
- Android SDK with NDK 25.1.8937393
- A device/emulator running Android 7.0+ (API 24+)

### Install dependencies

```bash
cd mobile
flutter pub get
```

### Run on device/emulator

```bash
flutter run
```

### Build release APK

```bash
flutter build apk --release
```

Output: `mobile/build/app/outputs/flutter-apk/app-release.apk`

### Build split APKs (smaller download per ABI)

```bash
flutter build apk --split-per-abi --release
```

---

## Project structure

```
Format/
├── desktop/                  # Electron + React app
│   ├── electron/
│   │   ├── main/
│   │   │   ├── index.js          # BrowserWindow + app menu
│   │   │   ├── ipcHandlers.js    # All IPC handlers
│   │   │   └── ffmpegService.js  # FFmpeg wrapper
│   │   └── preload/
│   │       └── index.js          # contextBridge API
│   └── src/
│       ├── components/           # Sidebar, Header, FormatCard, Queue...
│       ├── pages/                # VideoPage, AudioPage, ImagePage, DVDPage...
│       ├── store/useStore.js     # Zustand state
│       └── utils/
│           ├── formats.js        # All format definitions + FFmpeg args
│           └── presets.js        # Quality presets
└── mobile/                   # Flutter app
    ├── lib/
    │   ├── main.dart
    │   ├── app.dart
    │   ├── providers/
    │   │   └── conversion_provider.dart
    │   ├── services/
    │   │   └── ffmpeg_service.dart
    │   └── utils/
    │       └── formats.dart
    └── android/
        └── app/
            ├── build.gradle
            └── src/main/AndroidManifest.xml
```

## Offline guarantee

- **Desktop**: `@ffmpeg-installer/ffmpeg` bundles a static FFmpeg binary inside the npm package — no download at runtime.
- **Mobile**: `ffmpeg_kit_flutter_full_gpl` compiles FFmpeg (with all codecs) directly into the APK — no network access needed.

## License

MIT — free to use, modify and distribute.

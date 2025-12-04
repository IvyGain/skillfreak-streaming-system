# HLS Stream Player Component

## Overview

A production-ready HLS (HTTP Live Streaming) video player component built with HLS.js and React. Provides adaptive bitrate streaming with quality selection, fullscreen support, and graceful fallback for Safari's native HLS support.

## Features

- **HLS.js Integration**: Supports HLS streaming in all modern browsers
- **Native Fallback**: Automatically uses native HLS support in Safari
- **Adaptive Quality**: Automatic and manual quality level selection
- **Fullscreen Mode**: Native fullscreen API support
- **Buffering Indicators**: Visual feedback during buffering
- **Error Handling**: Graceful error recovery for network and media errors
- **Custom Controls**: Hover-based overlay with play/pause and quality controls
- **TypeScript**: Full TypeScript support with strict mode
- **Responsive**: Works on desktop and mobile devices

## Installation

The required dependency `hls.js` is already installed in this project:

```json
{
  "dependencies": {
    "hls.js": "^1.6.14"
  }
}
```

## Usage

### Basic Usage

```tsx
import HLSPlayer from '@/components/stream/HLSPlayer';

export default function MyPage() {
  return (
    <HLSPlayer
      src="https://example.com/stream/playlist.m3u8"
      autoPlay={true}
      muted={false}
    />
  );
}
```

### With Event Handlers

```tsx
import HLSPlayer from '@/components/stream/HLSPlayer';

export default function MyPage() {
  const handleReady = () => {
    console.log('Stream is ready to play');
  };

  const handleError = (error: Error) => {
    console.error('Stream error:', error.message);
  };

  return (
    <HLSPlayer
      src="https://example.com/stream/playlist.m3u8"
      autoPlay={true}
      muted={false}
      onReady={handleReady}
      onError={handleError}
      className="max-w-4xl mx-auto"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | **Required** | URL to HLS manifest (.m3u8) |
| `autoPlay` | `boolean` | `false` | Auto-play video on load |
| `muted` | `boolean` | `false` | Start with audio muted |
| `onReady` | `() => void` | `undefined` | Callback when stream is ready |
| `onError` | `(error: Error) => void` | `undefined` | Callback when error occurs |
| `className` | `string` | `''` | Additional CSS classes |

## Browser Support

| Browser | Support | Method |
|---------|---------|--------|
| Chrome/Edge | ✅ Full | HLS.js |
| Firefox | ✅ Full | HLS.js |
| Safari | ✅ Full | Native HLS |
| Mobile Safari | ✅ Full | Native HLS |
| Mobile Chrome | ✅ Full | HLS.js |

## Features Deep Dive

### Quality Selection

The player automatically detects available quality levels from the HLS manifest and provides a quality selector in the top-right corner. Users can choose:

- **Auto**: Adaptive bitrate streaming (default)
- **Specific Quality**: 1080p, 720p, 480p, etc. (based on manifest)

### Error Recovery

The component includes automatic error recovery for common issues:

- **Network Errors**: Automatically retries loading
- **Media Errors**: Attempts to recover media pipeline
- **Fatal Errors**: Displays error message to user

### Controls

The player includes custom controls that appear on hover:

- **Play/Pause**: Click center button or bottom-left control
- **Quality**: Top-right menu for quality selection
- **Fullscreen**: Bottom-right button
- **Live Indicator**: Shows when streaming live content

## Test Page

A comprehensive test page is available at `/test-hls` with:

- Multiple public test streams
- Real-time event logging
- Stream switching
- Feature documentation

Visit: `http://localhost:3000/test-hls` (when dev server is running)

## HLS Stream Requirements

Your HLS stream should:

1. Have a valid `.m3u8` manifest file
2. Include CORS headers if hosted on different domain
3. Optionally include multiple quality levels for adaptive streaming
4. Use proper segment naming and duration

### Example HLS Manifest Structure

```
playlist.m3u8           # Master playlist
├── 1080p.m3u8         # 1080p quality playlist
├── 720p.m3u8          # 720p quality playlist
├── 480p.m3u8          # 480p quality playlist
└── segments/
    ├── 1080p_00001.ts
    ├── 1080p_00002.ts
    ├── 720p_00001.ts
    └── ...
```

## Styling

The component uses Tailwind CSS for styling. The container uses aspect ratio 16:9 by default and includes:

- Dark theme with semi-transparent overlays
- Smooth transitions on hover
- Responsive design
- Accessible button states

You can customize appearance via the `className` prop.

## Performance Considerations

- **Low Latency Mode**: Enabled by default for real-time streaming
- **Buffer Management**: 90-second back buffer for smooth playback
- **Worker Thread**: HLS.js uses Web Workers for better performance
- **Lazy Loading**: Video element loads content on demand

## Troubleshooting

### Stream Not Playing

1. Check console for errors
2. Verify HLS URL is accessible
3. Check CORS headers on your server
4. Try with public test streams first

### Quality Switching Not Working

- Ensure your HLS manifest includes multiple quality levels
- Check that variants have different resolutions

### Safari-Specific Issues

- Safari uses native HLS, so some HLS.js features may not be available
- Quality switching works differently in Safari

## Development

To modify the component:

```bash
# Edit component
vim components/stream/HLSPlayer.tsx

# Test changes
npm run dev

# Navigate to test page
open http://localhost:3000/test-hls
```

## Related Components

- `LiveStreamPlayer.tsx` - Playlist-based 24/7 stream player
- `VODStreamPlayer.tsx` - VOD playlist player with multiple sources
- `LarkVideoPlayer.tsx` - Lark Drive video player

## References

- [HLS.js Documentation](https://github.com/video-dev/hls.js/)
- [HLS Protocol Specification](https://developer.apple.com/streaming/)
- [MDN Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)

## License

MIT

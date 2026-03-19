# SecureAudioPlayer Component

A production-ready React component for streaming audio with enterprise-level security, Web Audio API integration, and automatic reconnection capabilities.

## Features

- ✅ **Secure URL Proxy** - Stream URLs never exposed to client-side JavaScript
- ✅ **Web Audio API Integration** - Real-time frequency analysis for visualizations
- ✅ **Automatic Reconnection** - Up to 3 retry attempts with exponential backoff
- ✅ **React Strict Mode Compatible** - Handles double-mounting without issues
- ✅ **Autoplay Policy Compliant** - Imperative play control via ref
- ✅ **Rate Limiting** - Server-side protection (50 requests/minute per IP)
- ✅ **TypeScript Support** - Fully typed with exported interfaces

## Quick Start

```tsx
import { useRef, useState } from 'react';
import SecureAudioPlayer, { type SecureAudioPlayerHandle } from '@/components/secureplayer/SecureAudioPlayer';

function MyRadioApp() {
  const playerRef = useRef<SecureAudioPlayerHandle>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div>
      <button onClick={() => {
        playerRef.current?.play();
        setIsPlaying(true);
      }}>
        Play
      </button>

      <SecureAudioPlayer
        ref={playerRef}
        stationId="1"
        isActive={true}
        isPoweredOn={isPlaying}
        onError={(error) => console.error('Error:', error)}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `stationId` | `string` | ✅ | Unique identifier for the radio station |
| `isActive` | `boolean` | ✅ | Controls whether the component is actively managing audio |
| `isPoweredOn` | `boolean` | ✅ | Controls whether audio should be playing |
| `onPlay` | `() => void` | ❌ | Callback fired when playback starts |
| `onError` | `(error: string) => void` | ❌ | Callback fired when an error occurs |
| `onAudioData` | `(dataArray: Uint8Array) => void` | ❌ | Callback providing real-time frequency data for visualization |

## Exposed Methods (via Ref)

```tsx
interface SecureAudioPlayerHandle {
  play: () => void;   // Start playback
  pause: () => void;  // Pause playback
}
```

## Examples

### Basic Usage

See the "Basic Audio Player" example in the component library storybook.

### With Audio Visualizer

```tsx
const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(128));

<SecureAudioPlayer
  ref={playerRef}
  stationId="1"
  isActive={true}
  isPoweredOn={isPlaying}
  onAudioData={setAudioData}
/>

{/* Visualizer */}
<div style={{ display: 'flex', gap: '2px' }}>
  {Array.from(audioData).slice(0, 64).map((value, i) => (
    <div
      key={i}
      style={{
        height: `${(value / 255) * 100}px`,
        width: '4px',
        backgroundColor: '#FF1744'
      }}
    />
  ))}
</div>
```

### Multiple Stations

```tsx
const [selectedStation, setSelectedStation] = useState(radioStations[0]);

<SecureAudioPlayer
  ref={playerRef}
  key={selectedStation.id}  // Important: Forces remount on station change
  stationId={selectedStation.id}
  isActive={true}
  isPoweredOn={isPlaying}
/>
```

## Configuration

### Adding New Stations

Edit `src/components/secureplayer/radio-stations.ts`:

```tsx
export const radioStations: RadioStation[] = [
  {
    id: '1',
    name: 'My Station',
    frequency: '88.5',
    genre: 'Electronic • Ambient',
    color: '#FF1744',
    url: 'https://your-stream-url.com/stream.mp3',
    description: 'Your station description',
    tagline: 'Optional tagline'
  },
  // Add more stations...
];
```

### API Route

The component requires a server-side API route at `/api/stream/[stationId]` which is automatically created at:
- `src/app/api/stream/[stationId]/route.ts`

This route:
- Proxies the stream to hide the source URL
- Implements rate limiting
- Validates allowed domains
- Handles CORS

## Architecture

```
Client (SecureAudioPlayer)
    ↓
    GET /api/stream/[stationId]
    ↓
Server API Route (Next.js)
    ↓
    Fetch from actual stream URL
    ↓
Stream to client
```

## Files

- `SecureAudioPlayer.tsx` - Main component
- `radio-stations.ts` - Station configuration
- `index.ts` - Exports
- `COMPONENT_DOCUMENTATION.md` - Comprehensive documentation
- `page.tsx` - Original example page
- `route.ts` - Legacy route file (use `/api/stream/[stationId]/route.ts` instead)

## Browser Support

- ✅ Chrome 66+
- ✅ Firefox 61+
- ✅ Safari 14.1+
- ✅ Edge 79+

## Security Considerations

1. **URL Protection**: Stream URLs are never sent to the client
2. **Rate Limiting**: 50 requests per minute per IP
3. **Domain Validation**: Only allows whitelisted stream sources
4. **CORS**: Configured for cross-origin streaming
5. **Security Headers**: XSS protection, frame denial, content-type sniffing prevention

## Troubleshooting

### Audio doesn't play
- Ensure `isPoweredOn` is `true`
- Check that `play()` is called from a user interaction (not `useEffect`)
- Verify the station ID exists in `radio-stations.ts`

### Stream stops after 5 minutes
- This is a Vercel serverless timeout issue
- Add `export const runtime = 'edge';` to the API route

### No audio visualization
- Ensure `onAudioData` callback is provided
- Check that audio is actually playing
- Verify `isActive` and `isPoweredOn` are both `true`

## Full Documentation

See `COMPONENT_DOCUMENTATION.md` for comprehensive documentation including:
- Detailed architecture diagrams
- Advanced usage examples
- Portability guide
- Known issues and limitations
- Security best practices


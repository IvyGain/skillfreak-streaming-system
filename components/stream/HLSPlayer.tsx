'use client';

/**
 * HLS Stream Player
 * Uses HLS.js for browsers without native HLS support
 * Falls back to native HLS for Safari
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface HLSPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  onReady?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

interface QualityLevel {
  height: number;
  bitrate: number;
  name: string;
}

export default function HLSPlayer({
  src,
  autoPlay = false,
  muted = false,
  onReady,
  onError,
  className = '',
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 means auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize HLS player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if native HLS is supported (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      setIsLoading(false);
      onReady?.();
      return;
    }

    // Use HLS.js for other browsers
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      // HLS.js events
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);

        // Get quality levels
        const levels: QualityLevel[] = hls.levels.map((level, index) => ({
          height: level.height,
          bitrate: level.bitrate,
          name: `${level.height}p`,
        }));
        setQualityLevels(levels);

        onReady?.();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          const errorMessage = `HLS Error: ${data.type} - ${data.details}`;
          setError(errorMessage);
          onError?.(new Error(errorMessage));

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover network error
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              // Try to recover media error
              hls.recoverMediaError();
              break;
            default:
              // Cannot recover
              hls.destroy();
              break;
          }
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level);
      });

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    } else {
      const errorMsg = 'HLS is not supported in this browser';
      setError(errorMsg);
      onError?.(new Error(errorMsg));
    }
  }, [src, onReady, onError]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setBuffering(true);
    const handleCanPlay = () => setBuffering(false);
    const handlePlaying = () => setBuffering(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  // Change quality level
  const changeQuality = useCallback((level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentQuality(level);
      setShowQualityMenu(false);
    }
  }, []);

  if (error) {
    return (
      <div className={`bg-black rounded-lg aspect-video flex items-center justify-center ${className}`}>
        <div className="text-center text-red-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="font-semibold">Error Loading Stream</p>
          <p className="text-sm mt-2 text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        className="w-full h-full object-contain"
        style={{ aspectRatio: '16/9' }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white mt-4">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Buffering Indicator */}
      {buffering && !isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
            <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="text-white text-sm font-semibold">LIVE</span>
          </div>

          {/* Quality Selector */}
          {qualityLevels.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm hover:bg-black/70 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {currentQuality === -1 ? 'Auto' : `${qualityLevels[currentQuality]?.name || 'Auto'}`}
              </button>

              {showQualityMenu && (
                <div className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden min-w-[120px]">
                  <button
                    onClick={() => changeQuality(-1)}
                    className={`w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors ${
                      currentQuality === -1 ? 'bg-white/20' : ''
                    }`}
                  >
                    Auto
                  </button>
                  {qualityLevels.map((level, index) => (
                    <button
                      key={index}
                      onClick={() => changeQuality(index)}
                      className={`w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors ${
                        currentQuality === index ? 'bg-white/20' : ''
                      }`}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlayPause}
            className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
          >
            {isPlaying ? (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center">
          <button
            onClick={togglePlayPause}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * VOD Stream Player
 * Lark Drive files or YouTube URLs playlist with auto-loop
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import LarkVideoPlayer from '../LarkVideoPlayer';

interface Video {
  fileToken?: string;
  youtubeUrl?: string;
  archiveUrl?: string;  // Direct MP4 URL
  title: string;
  id: string;
}

interface VODStreamPlayerProps {
  playlist: Video[];
}

/**
 * Extract YouTube video ID from URL
 */
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function VODStreamPlayer({ playlist }: VODStreamPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef<HTMLIFrameElement>(null);

  const currentVideo = playlist[currentIndex];

  // Next video
  const nextVideo = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
    setProgress(0);
  }, [playlist.length]);

  // Previous video
  const prevVideo = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setProgress(0);
  }, [playlist.length]);

  // Auto progress timer (for demo - in production, use video ended events)
  useEffect(() => {
    if (!isPlaying || playlist.length <= 1) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextVideo();
          return 0;
        }
        return prev + 0.2; // ~8 minutes per video for demo
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, nextVideo, playlist.length]);

  if (!currentVideo) {
    return (
      <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
        <p className="text-gray-400">No videos in playlist</p>
      </div>
    );
  }

  // Determine video source type
  const hasLarkFile = !!currentVideo.fileToken;
  const hasYouTube = !!currentVideo.youtubeUrl;
  const hasDirectUrl = !!currentVideo.archiveUrl;
  const youtubeId = hasYouTube ? getYouTubeVideoId(currentVideo.youtubeUrl!) : null;

  return (
    <div className="space-y-4">
      {/* Player */}
      <div className="relative">
        {hasLarkFile ? (
          // Lark Drive Player
          <LarkVideoPlayer
            fileToken={currentVideo.fileToken!}
            className="w-full"
          />
        ) : youtubeId ? (
          // YouTube Embed Player
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <iframe
              ref={playerRef}
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none' }}
            />
          </div>
        ) : hasDirectUrl ? (
          // Direct MP4 Player
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <video
              key={currentVideo.archiveUrl}
              autoPlay
              controls
              playsInline
              className="absolute inset-0 w-full h-full object-contain"
              onEnded={nextVideo}
            >
              <source src={currentVideo.archiveUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          // Fallback - no video source
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p>Video unavailable</p>
            </div>
          </div>
        )}

        {/* Now Playing Overlay */}
        <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-sm px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2 text-white">
            <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            <span className="font-semibold">LIVE 24/7</span>
          </div>
          <div className="text-white text-sm mt-1 max-w-[200px] truncate">{currentVideo.title}</div>
        </div>

        {/* Playlist Position */}
        <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-sm px-4 py-2 rounded-lg">
          <div className="text-white text-sm">
            {currentIndex + 1} / {playlist.length}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {hasLarkFile ? 'Lark' : hasYouTube ? 'YouTube' : hasDirectUrl ? 'Archive' : 'N/A'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Progress: {Math.round(progress)}%</span>
            <span>
              Next in: ~{Math.round((100 - progress) * 5)}s
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prevVideo}
            className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
            title="Previous"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={nextVideo}
            className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
            title="Next"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Current Info */}
        <div className="mt-4 text-center">
          <div className="text-white font-medium truncate">{currentVideo.title}</div>
          <div className="text-gray-400 text-sm mt-1 flex items-center justify-center gap-2">
            {isPlaying ? (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Streaming
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                Paused
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

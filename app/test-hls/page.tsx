'use client';

/**
 * HLS Player Test Page
 * Demo page to test HLS.js player functionality
 */

import { useState } from 'react';
import HLSPlayer from '@/components/stream/HLSPlayer';

// Public test HLS streams
const TEST_STREAMS = [
  {
    id: '1',
    name: 'Big Buck Bunny',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    description: 'Classic test video - Big Buck Bunny',
  },
  {
    id: '2',
    name: 'Apple Test Stream',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
    description: 'Apple HLS example stream with multiple quality levels',
  },
  {
    id: '3',
    name: 'Sintel',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    description: 'Sintel movie test stream',
  },
];

export default function TestHLSPage() {
  const [selectedStream, setSelectedStream] = useState(TEST_STREAMS[0]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const handleReady = () => {
    addLog(`✅ Stream ready: ${selectedStream.name}`);
  };

  const handleError = (error: Error) => {
    addLog(`❌ Error: ${error.message}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">HLS Player Test</h1>
          <p className="text-gray-400">
            Test HLS.js streaming player with public test streams
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Player */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-1">{selectedStream.name}</h2>
                <p className="text-gray-400 text-sm">{selectedStream.description}</p>
              </div>

              <HLSPlayer
                src={selectedStream.url}
                autoPlay={true}
                muted={true}
                onReady={handleReady}
                onError={handleError}
                className="w-full"
              />

              <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Stream Info
                </h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>
                    <span className="text-gray-400">URL:</span>{' '}
                    <code className="text-xs bg-gray-800 px-2 py-1 rounded">
                      {selectedStream.url}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-400">Format:</span> HLS (HTTP Live Streaming)
                  </div>
                  <div>
                    <span className="text-gray-400">Player:</span> HLS.js with native fallback
                  </div>
                </div>
              </div>
            </div>

            {/* Event Logs */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Event Logs
                </h3>
                <button
                  onClick={() => setLogs([])}
                  className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">No events yet</div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className="py-1 border-b border-gray-800 last:border-0"
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Stream Selection */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                Test Streams
              </h3>
              <div className="space-y-3">
                {TEST_STREAMS.map((stream) => (
                  <button
                    key={stream.id}
                    onClick={() => {
                      setSelectedStream(stream);
                      addLog(`🔄 Switching to: ${stream.name}`);
                    }}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedStream.id === stream.id
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-semibold mb-1">{stream.name}</div>
                    <div className="text-xs text-gray-300">{stream.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features List */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>HLS.js integration with native fallback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Adaptive quality selection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Fullscreen support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Buffering indicators</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Error handling & recovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Custom controls overlay</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>TypeScript strict mode</span>
                </li>
              </ul>
            </div>

            {/* Browser Support */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Browser Support
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Chrome / Edge (HLS.js)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Firefox (HLS.js)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Safari (Native HLS)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Mobile browsers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

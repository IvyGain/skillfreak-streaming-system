'use client';

import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0F23] via-[#1F1F3A] to-[#2D1B69] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">
          <span role="img" aria-label="offline">&#128268;</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">
          Offline
        </h1>
        <p className="text-gray-400 mb-8">
          Sorry, it looks like you're not connected to the internet. Please check your network connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
        <div className="mt-6">
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

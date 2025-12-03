import type { NextConfig } from "next";
// @ts-ignore - next-pwa lacks type definitions
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ivygain-project.jp.larksuite.com',
      },
      {
        protocol: 'https',
        hostname: 'lf3-static.bytednsdoc.com',
      },
      {
        protocol: 'https',
        hostname: 'open.larksuite.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/**',
      },
      {
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  fallbacks: {
    document: '/offline',
  },
});

export default pwaConfig(nextConfig);

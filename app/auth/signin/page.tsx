/**
 * Discord OAuth2 サインインページ
 */

'use client';

import { signIn } from 'next-auth/react';
import { FaDiscord } from 'react-icons/fa';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            SkillFreak Portal
          </h1>
          <p className="text-gray-300">
            Discordアカウントでログイン
          </p>
        </div>

        <button
          onClick={() => signIn('discord', { callbackUrl: '/events' })}
          className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105"
        >
          <FaDiscord className="text-2xl" />
          <span>Discordでログイン</span>
        </button>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>ログインすることで、以下に同意したものとみなされます：</p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• 利用規約</li>
            <li>• プライバシーポリシー</li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
          <p className="text-sm text-blue-200">
            <strong>会員限定コンテンツ:</strong>
          </p>
          <ul className="mt-2 text-xs text-blue-300 space-y-1">
            <li>• アーカイブ動画視聴</li>
            <li>• 特典受け取り</li>
            <li>• 会員限定イベント参加</li>
          </ul>
          <a
            href="https://skillfreak.jp/join"
            className="mt-3 block text-center text-sm text-yellow-300 hover:text-yellow-200 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            SkillFreak会員登録はこちら →
          </a>
        </div>
      </div>
    </div>
  );
}

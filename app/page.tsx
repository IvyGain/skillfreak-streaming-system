import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダー */}
        <header className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              src="/skillfreak-logo.png"
              alt="SkillFreak Logo"
              width={600}
              height={120}
              priority
              className="dark:brightness-110"
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Streaming System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            24時間ライブアーカイブ配信プラットフォーム
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            YouTubeライブのアーカイブを自動収集し、24時間連続で配信
          </p>
        </header>

        {/* 主要機能 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            主要機能
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🎥</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                自動アーカイブ収集
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                YouTubeライブ終了後、自動でダウンロード・保存
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">📡</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                24時間連続配信
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                アーカイブをループ再生で24時間配信
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                会員限定視聴
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                ログインユーザーのみが視聴可能なセキュア環境
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              今すぐ視聴を開始
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              過去のライブ配信アーカイブを24時間いつでも視聴できます
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/stream"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                配信を視聴する
              </Link>
              <Link
                href="/admin/stream"
                className="inline-flex items-center justify-center px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                管理画面
              </Link>
              <Link
                href="/manual"
                className="inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                📚 使い方マニュアル
              </Link>
            </div>
          </div>
        </section>

        {/* 技術スタック */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            技術スタック
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                フロントエンド
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Next.js 14+ (App Router)</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• HLS.js / Video.js</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                バックエンド
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Vercel Functions</li>
                <li>• Hetzner VPS (配信サーバー)</li>
                <li>• FFmpeg (HLSエンコード)</li>
                <li>• Nginx</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                ストレージ & DB
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Backblaze B2 (動画保存)</li>
                <li>• Supabase (PostgreSQL)</li>
                <li>• Supabase Auth (認証)</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                自動化
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Lark Automation</li>
                <li>• GitHub Actions</li>
                <li>• Miyabi Framework</li>
              </ul>
            </div>
          </div>
        </section>

        {/* フッター */}
        <footer className="text-center text-gray-500 dark:text-gray-400">
          <p className="mb-2">
            IvyGain Development Team
          </p>
          <p className="text-sm">
            Powered by Miyabi Framework - Beauty in Autonomous Development
          </p>
        </footer>
      </div>
    </div>
  );
}

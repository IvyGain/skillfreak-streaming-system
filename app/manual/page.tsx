import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: '使い方マニュアル - SkillFreak Streaming System',
  description: 'SkillFreak Streaming Systemの使い方、セットアップ、運用方法の完全ガイド',
};

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
          <Image
            src="/skillfreak-logo.png"
            alt="SkillFreak Logo"
            width={300}
            height={60}
            className="dark:brightness-110"
          />
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          📚 使い方マニュアル
        </h1>

        {/* 目次 */}
        <nav className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">目次</h2>
          <ul className="space-y-2 text-blue-600 dark:text-blue-400">
            <li><a href="#overview" className="hover:underline">1. システム概要</a></li>
            <li><a href="#user-guide" className="hover:underline">2. 視聴者向けガイド</a></li>
            <li><a href="#admin-guide" className="hover:underline">3. 管理者向けガイド</a></li>
            <li><a href="#manual-upload" className="hover:underline">4. アーカイブ動画の手動アップロード</a></li>
            <li><a href="#vps-setup" className="hover:underline">5. VPSセットアップ</a></li>
            <li><a href="#automation" className="hover:underline">6. 自動化設定</a></li>
            <li><a href="#troubleshooting" className="hover:underline">7. トラブルシューティング</a></li>
          </ul>
        </nav>

        {/* 1. システム概要 */}
        <section id="overview" className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              1. システム概要
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              SkillFreak Streaming Systemは、YouTubeライブのアーカイブを自動収集し、24時間連続で配信する会員専用ストリーミングプラットフォームです。
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">自動収集</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  YouTubeライブ終了後、1時間後に自動でダウンロード・保存
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="font-bold text-green-900 dark:text-green-300 mb-2">24時間配信</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  保存されたアーカイブを24時間ループ配信
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2">会員限定</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ログインユーザーのみが視聴可能
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 視聴者向けガイド */}
        <section id="user-guide" className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              2. 視聴者向けガイド
            </h2>

            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">配信を視聴する</h3>
            <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-600 dark:text-gray-300">
              <li>トップページにアクセス</li>
              <li>「配信を視聴する」ボタンをクリック</li>
              <li>プレイヤーで24時間配信を楽しむ</li>
            </ol>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">💡 視聴のヒント</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>配信は24時間休まず続きます</li>
                <li>右側のアーカイブ一覧で過去の配信を確認できます</li>
                <li>モバイルでも快適に視聴可能</li>
                <li>視聴者数はリアルタイムで表示されます</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. 管理者向けガイド */}
        <section id="admin-guide" className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              3. 管理者向けガイド
            </h2>

            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">管理画面へのアクセス</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              管理画面URL: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/admin/stream</code>
            </p>

            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">管理画面でできること</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">📊 配信ステータス監視</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>配信状態（LIVE/OFFLINE）</li>
                  <li>現在の視聴者数</li>
                  <li>システム稼働時間</li>
                  <li>今日の帯域幅使用量</li>
                </ul>
              </div>
              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">📹 アーカイブ管理</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>全アーカイブの一覧表示</li>
                  <li>視聴回数の確認</li>
                  <li>動画の状態確認</li>
                  <li>ページネーション対応</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. アーカイブ動画の手動アップロード */}
        <section id="manual-upload" className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              4. アーカイブ動画の手動アップロード
            </h2>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">⚠️ 事前準備</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Backblaze B2アカウント</li>
                <li>Supabaseプロジェクト</li>
                <li>環境変数の設定完了</li>
              </ul>
            </div>

            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">方法1: APIを使用したアップロード</h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 overflow-x-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-200">
{`curl -X POST http://localhost:3000/api/youtube-archive \\
  -H "Content-Type: application/json" \\
  -d '{
    "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "video_id": "VIDEO_ID",
    "title": "ライブ配信タイトル",
    "speaker": "講師名",
    "event_date": "2025-11-19T10:00:00Z"
  }'`}
              </pre>
            </div>

            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">方法2: Backblaze B2への直接アップロード</h3>
            <ol className="list-decimal list-inside space-y-3 mb-6 text-gray-600 dark:text-gray-300">
              <li>
                <strong>rcloneの設定</strong>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mt-2 ml-6 overflow-x-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-200">
{`rclone config
# 1. n (新規リモート作成)
# 2. 名前: b2
# 3. Storage: Backblaze B2
# 4. Account ID: [B2 Key ID]
# 5. Application Key: [B2 Application Key]`}
                  </pre>
                </div>
              </li>
              <li>
                <strong>動画ファイルのアップロード</strong>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mt-2 ml-6 overflow-x-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-200">
{`rclone copy video.mp4 b2:skillfreak-archives/videos/`}
                  </pre>
                </div>
              </li>
              <li>
                <strong>Supabaseにメタデータを登録</strong>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mt-2 ml-6 overflow-x-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-200">
{`-- Supabase SQL Editor で実行
INSERT INTO archives (
  video_id, title, speaker, event_date,
  file_path, file_size, duration, status
) VALUES (
  'VIDEO_ID',
  'ライブ配信タイトル',
  '講師名',
  '2025-11-19 10:00:00+00',
  'videos/VIDEO_ID.mp4',
  1234567890,
  3600,
  'ready'
);`}
                  </pre>
                </div>
              </li>
            </ol>

            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">方法3: 管理スクリプト（推奨）</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              便利な管理スクリプトを作成して一括処理:
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-200">
{`#!/bin/bash
# upload-archive.sh

VIDEO_FILE="$1"
VIDEO_ID="$2"
TITLE="$3"
SPEAKER="$4"

# 1. B2にアップロード
rclone copy "$VIDEO_FILE" b2:skillfreak-archives/videos/ --progress

# 2. メタデータをAPIに送信
curl -X POST http://localhost:3000/api/youtube-archive \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"video_id\\": \\"$VIDEO_ID\\",
    \\"title\\": \\"$TITLE\\",
    \\"speaker\\": \\"$SPEAKER\\",
    \\"event_date\\": \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\"
  }"

echo "アップロード完了！"`}
              </pre>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              使用例: <code>./upload-archive.sh video.mp4 VIDEO_ID "タイトル" "講師名"</code>
            </p>
          </div>
        </section>

        {/* 5. VPSセットアップ */}
        <section id="vps-setup" className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              5. VPSセットアップ
            </h2>

            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">自動セットアップスクリプト</h3>
            <ol className="list-decimal list-inside space-y-3 mb-6 text-gray-600 dark:text-gray-300">
              <li>
                <strong>VPSにSSH接続</strong>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mt-2 ml-6">
                  <code className="text-sm text-gray-800 dark:text-gray-200">ssh root@YOUR_VPS_IP</code>
                </div>
              </li>
              <li>
                <strong>セットアップスクリプトをアップロード</strong>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mt-2 ml-6">
                  <code className="text-sm text-gray-800 dark:text-gray-200">scp vps/scripts/setup-vps.sh root@YOUR_VPS_IP:/root/</code>
                </div>
              </li>
              <li>
                <strong>スクリプトを実行</strong>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mt-2 ml-6 overflow-x-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-200">
{`chmod +x setup-vps.sh
sudo ./setup-vps.sh`}
                  </pre>
                </div>
              </li>
              <li>
                <strong>rcloneを設定</strong>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mt-2 ml-6">
                  <code className="text-sm text-gray-800 dark:text-gray-200">sudo -u streamuser rclone config</code>
                </div>
              </li>
              <li>
                <strong>配信を開始</strong>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mt-2 ml-6">
                  <code className="text-sm text-gray-800 dark:text-gray-200">sudo systemctl start skillfreak-stream</code>
                </div>
              </li>
            </ol>

            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">配信の管理コマンド</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm flex-1">
                  sudo systemctl status skillfreak-stream
                </code>
                <span className="text-sm text-gray-600 dark:text-gray-400">状態確認</span>
              </div>
              <div className="flex items-center gap-3">
                <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm flex-1">
                  sudo systemctl start skillfreak-stream
                </code>
                <span className="text-sm text-gray-600 dark:text-gray-400">配信開始</span>
              </div>
              <div className="flex items-center gap-3">
                <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm flex-1">
                  sudo systemctl stop skillfreak-stream
                </code>
                <span className="text-sm text-gray-600 dark:text-gray-400">配信停止</span>
              </div>
              <div className="flex items-center gap-3">
                <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm flex-1">
                  sudo systemctl restart skillfreak-stream
                </code>
                <span className="text-sm text-gray-600 dark:text-gray-400">配信再起動</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. 自動化設定 */}
        <section id="automation" className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              6. 自動化設定（Lark Automation）
            </h2>

            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">YouTubeライブ終了時の自動アーカイブ</h3>
            <ol className="list-decimal list-inside space-y-3 mb-6 text-gray-600 dark:text-gray-300">
              <li>Larkでオートメーションを作成</li>
              <li>
                <strong>トリガー設定:</strong> レコード作成時（YouTube Live Eventsテーブル）
              </li>
              <li>
                <strong>条件:</strong> ステータス = "終了"
              </li>
              <li>
                <strong>アクション1:</strong> 待機（終了時刻 + 1時間）
              </li>
              <li>
                <strong>アクション2:</strong> HTTPリクエスト送信
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mt-2 ml-6 overflow-x-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-200">
{`URL: https://your-app.vercel.app/api/youtube-archive
Method: POST
Headers:
  Content-Type: application/json
  x-lark-signature: {{HMAC_SIGNATURE}}
Body:
{
  "youtube_url": "{{YouTube URL}}",
  "video_id": "{{Video ID}}",
  "title": "{{タイトル}}",
  "speaker": "{{講師名}}",
  "event_date": "{{開催日時}}",
  "lark_record_id": "{{Record ID}}"
}`}
                  </pre>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* 7. トラブルシューティング */}
        <section id="troubleshooting" className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              7. トラブルシューティング
            </h2>

            <div className="space-y-6">
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Q: 配信が途切れる
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">A: 以下を確認:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                  <li>VPSの帯域制限チェック</li>
                  <li>FFmpegのメモリ使用量確認: <code>free -h</code></li>
                  <li>ログ確認: <code>tail -f /opt/skillfreak-stream/logs/ffmpeg.log</code></li>
                  <li>配信再起動: <code>sudo systemctl restart skillfreak-stream</code></li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Q: 新しい動画が配信に追加されない
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">A: 確認手順:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                  <li>Backblaze B2にファイルがアップロードされているか確認</li>
                  <li>Supabaseのarchivesテーブルを確認</li>
                  <li>VPSでプレイリスト更新: <code>/opt/skillfreak-stream/scripts/stream-manager.sh update-playlist</code></li>
                </ol>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Q: 管理画面で「データがありません」と表示される
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">A: 原因と対処:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                  <li>Supabase環境変数が正しく設定されているか確認</li>
                  <li>データベースにアーカイブが登録されているか確認</li>
                  <li>ブラウザのコンソールでエラーを確認</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Q: ダウンロードジョブが失敗する
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">A: 確認項目:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                  <li>yt-dlpがインストールされているか確認</li>
                  <li>YouTube URLが正しいか確認</li>
                  <li>YouTubeのクッキーファイルが必要な場合は設定</li>
                  <li>Vercel Functionsのログを確認</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* サポート情報 */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            💬 サポート・お問い合わせ
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <div className="flex gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              トップページへ
            </Link>
            <Link
              href="/admin/stream"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              管理画面へ
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

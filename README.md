# SkillFreak Streaming System

24時間自動アーカイブ配信システム - 会員専用ストリーミングプラットフォーム

## 概要

YouTubeライブのアーカイブを自動収集し、24時間連続で配信する会員専用ストリーミングシステムです。

### 主要機能

- 🎥 YouTubeライブ終了後の自動アーカイブ収集
- 📡 24時間連続ループ配信（HLS形式）
- 🔐 会員認証システム
- 📊 リアルタイム視聴統計
- 🎛️ 管理ダッシュボード
- 📱 PWA対応（モバイル/デスクトップ）

## 技術スタック

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- HLS.js / Video.js

### Backend
- Vercel Functions (Webhook受信)
- Hetzner VPS (配信サーバー)
- FFmpeg (動画処理・HLSエンコード)

### Storage & Database
- Backblaze B2 (アーカイブ保管)
- Supabase (PostgreSQL)

### Automation
- Lark Automation
- GitHub Actions

### Auth
- Supabase Auth

## プロジェクト構造

```
skillfreak-streaming-system/
├── app/                    # Next.js App Router
│   ├── stream/            # ストリーム視聴ページ
│   ├── admin/             # 管理画面
│   └── api/               # API Routes
├── components/            # Reactコンポーネント
│   ├── stream/           # ストリーム関連
│   ├── admin/            # 管理画面関連
│   └── embed/            # 埋め込み用
├── lib/                   # ユーティリティ
│   ├── supabase/
│   ├── backblaze/
│   └── youtube/
├── types/                 # TypeScript型定義
├── vps/                   # VPSサーバー設定
│   ├── scripts/          # 配信スクリプト
│   ├── config/           # Nginx設定
│   └── systemd/          # Systemdサービス
└── docs/                  # ドキュメント
    └── SYSTEM_DESIGN.md  # 詳細設計書
```

## セットアップ

### 必要な環境

- Node.js 20+
- npm または yarn
- Supabaseアカウント
- Backblaze B2アカウント
- Hetzner VPS (CPX11推奨)

### 環境変数

`.env.local`を作成し、以下を設定:

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Backblaze B2
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
B2_KEY_ID=your_key_id
B2_APP_KEY=your_app_key

# VPS
VPS_WEBHOOK_URL=https://stream.skillfreak.com/api/webhook

# Lark
LARK_WEBHOOK_URL=your_lark_webhook
WEBHOOK_SECRET=your_webhook_secret

# JWT
JWT_SECRET=your_jwt_secret

# Stream
NEXT_PUBLIC_STREAM_URL=https://stream.skillfreak.com
```

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## デプロイ

### Vercelへのデプロイ

```bash
vercel deploy --prod
```

### VPSセットアップ

詳細は [docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md) を参照してください。

## 開発フロー（Miyabi）

このプロジェクトはMiyabi自律開発フレームワークを使用しています。

### Issue作成

```bash
gh issue create --title "機能追加: ○○" --body "説明"
```

### 自動実行

Issueを作成すると、Miyabi Agentsが自動的に:
1. タスクを分析
2. コードを実装
3. テストを実行
4. PRを作成

## ドキュメント

- [システム設計書](docs/SYSTEM_DESIGN.md)
- [API仕様](docs/API.md) (WIP)
- [デプロイガイド](docs/DEPLOYMENT.md) (WIP)
- [統合ガイド](docs/INTEGRATION.md) (WIP)

## ライセンス

MIT

## 作成者

IvyGain Development Team

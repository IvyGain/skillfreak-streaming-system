# skillfreak-streaming-system - Claude Code Context

## プロジェクト概要

**SkillFreak 24時間VOD配信システム** - Lark/Feishuエコシステム統合型ストリーミングポータル

YouTube Liveアーカイブを自動でLark Driveに保存し、LarkBaseで管理、24時間リピート配信するシステム

## 🎯 システムフロー（重要！）

```
YouTube Live
  ↓ yt-dlp自動ダウンロード
Lark Drive（アーカイブストレージ）
  ↓ メタデータ登録
LarkBase（多元表 - DB代わり）
  ↓ API経由でデータ取得
Portal イベントページ（Next.js）
  ↓ Lark Drive動画を埋め込み再生
24時間VOD（Lark Driveフォルダを順次リピート）
```

**技術スタック:**
- **ストレージ**: Lark Drive（Backblaze B2は使わない）
- **データベース**: LarkBase多元表（Supabaseは使わない）
- **認証**: Lark/Feishu認証
- **フロントエンド**: Next.js 15 + React 19
- **自動化**: yt-dlp + Lark API

## 🌸 Miyabi Framework

### 7つの自律エージェント

1. **CoordinatorAgent** - タスク統括・並列実行制御
   - DAG（Directed Acyclic Graph）ベースのタスク分解
   - Critical Path特定と並列実行最適化

2. **IssueAgent** - Issue分析・ラベル管理
   - 識学理論65ラベル体系による自動分類
   - タスク複雑度推定（小/中/大/特大）

3. **CodeGenAgent** - AI駆動コード生成
   - Claude Sonnet 4による高品質コード生成
   - TypeScript strict mode完全対応

4. **ReviewAgent** - コード品質判定
   - 静的解析・セキュリティスキャン
   - 品質スコアリング（100点満点、80点以上で合格）

5. **PRAgent** - Pull Request自動作成
   - Conventional Commits準拠
   - Draft PR自動生成

6. **DeploymentAgent** - CI/CDデプロイ自動化
   - 自動デプロイ・ヘルスチェック
   - 自動Rollback機能

7. **TestAgent** - テスト自動実行
   - テスト実行・カバレッジレポート
   - 80%+カバレッジ目標

## GitHub OS Integration

このプロジェクトは「GitHubをOSとして扱う」設計思想で構築されています:

### 自動化されたワークフロー

1. **Issue作成** → IssueAgentが自動ラベル分類
2. **CoordinatorAgent** → タスクをDAG分解、並列実行プラン作成
3. **CodeGenAgent** → コード実装、テスト生成
4. **ReviewAgent** → 品質チェック（80点以上で次へ）
5. **TestAgent** → テスト実行（カバレッジ確認）
6. **PRAgent** → Draft PR作成
7. **DeploymentAgent** → マージ後に自動デプロイ

**全工程が自律実行、人間の介入は最小限。**

## ラベル体系（識学理論準拠）

### 10カテゴリー、53ラベル

- **type:** bug, feature, refactor, docs, test, chore, security
- **priority:** P0-Critical, P1-High, P2-Medium, P3-Low
- **state:** pending, analyzing, implementing, reviewing, testing, deploying, done
- **agent:** codegen, review, deployment, test, coordinator, issue, pr
- **complexity:** small, medium, large, xlarge
- **phase:** planning, design, implementation, testing, deployment
- **impact:** breaking, major, minor, patch
- **category:** frontend, backend, infra, dx, security
- **effort:** 1h, 4h, 1d, 3d, 1w, 2w
- **blocked:** waiting-review, waiting-deployment, waiting-feedback

## 開発ガイドライン

### TypeScript設定

```json
{
  "compilerOptions": {
    "strict": true,
    "module": "ESNext",
    "target": "ES2022"
  }
}
```

### セキュリティ

- **機密情報は環境変数で管理**: `GITHUB_TOKEN`, `ANTHROPIC_API_KEY`
- **.env を .gitignore に含める**
- **Webhook検証**: HMAC-SHA256署名検証

### テスト

```bash
npm test                    # 全テスト実行
npm run test:watch          # Watch mode
npm run test:coverage       # カバレッジレポート
```

目標: 80%+ カバレッジ

## 使用方法

### Issue作成（Claude Code推奨）

```bash
# Claude Code から直接実行
gh issue create --title "機能追加: ユーザー認証" --body "JWT認証を実装"
```

または Claude Code のスラッシュコマンド:

```
/create-issue
```

### 状態確認

```bash
npx miyabi status          # 現在の状態
npx miyabi status --watch  # リアルタイム監視
```

### Agent実行

```bash
/agent-run                 # Claude Code から実行
```

## プロジェクト構造

```
skillfreak-streaming-system/
├── .claude/               # Claude Code設定
│   ├── agents/           # Agent定義
│   ├── commands/         # カスタムコマンド
│   └── settings.json     # Claude設定
├── .github/
│   └── workflows/        # 26+ GitHub Actions
├── src/                  # ソースコード
├── tests/                # テストコード
├── CLAUDE.md             # このファイル
└── package.json
```

## カスタムスラッシュコマンド

Claude Code で以下のコマンドが使用可能:

- `/test` - プロジェクト全体のテストを実行
- `/generate-docs` - コードからドキュメント自動生成
- `/create-issue` - Agent実行用Issueを対話的に作成
- `/deploy` - デプロイ実行
- `/verify` - システム動作確認（環境・コンパイル・テスト）
- `/security-scan` - セキュリティ脆弱性スキャン実行
- `/agent-run` - Autonomous Agent実行（Issue自動処理パイプライン）

## 識学理論（Shikigaku Theory）5原則

1. **責任の明確化** - 各AgentがIssueに対する責任を負う
2. **権限の委譲** - Agentは自律的に判断・実行可能
3. **階層の設計** - CoordinatorAgent → 各専門Agent
4. **結果の評価** - 品質スコア、カバレッジ、実行時間で評価
5. **曖昧性の排除** - DAGによる依存関係明示、状態ラベルで進捗可視化

## 環境変数

```bash
# Lark/Feishu API（必須）
LARK_APP_ID=cli_xxxxx
LARK_APP_SECRET=xxxxx
LARK_BASE_ID=xxxxx          # LarkBase多元表ID
LARK_TABLE_ID=xxxxx         # イベント管理テーブルID
LARK_DRIVE_FOLDER_ID=xxxxx  # アーカイブ保存フォルダID

# GitHub Personal Access Token（Miyabi Agent用）
GITHUB_TOKEN=ghp_xxxxx

# Anthropic API Key（Miyabi Agent用）
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

## 📋 実装ステータス（最終更新: 2025-01-19）

### ✅ 完成（100%）

**コアシステム:**
1. ✅ YouTube→Lark Drive自動アーカイブ (`scripts/youtube-to-lark-drive.ts`)
2. ✅ LarkBase多元表統合 (`lib/larkbase-client.ts`)
3. ✅ Lark Drive動画再生 (`components/LarkVideoPlayer.tsx`)
4. ✅ イベント一覧ページ (`app/events/page.tsx`)
5. ✅ イベント詳細ページ (`app/events/[id]/page.tsx`)
6. ✅ 24時間VOD配信 (`app/live/page.tsx`)
7. ✅ プレイリストプレイヤー (`components/stream/LiveStreamPlayer.tsx`)

**技術構成:**
- データベース: LarkBase多元表
- ストレージ: Lark Drive
- フロントエンド: Next.js 15 + React 19 + Tailwind CSS
- バックエンド: Next.js API Routes + Lark SDK

## 🚀 使い方

### 1. YouTube動画をLark Driveにアーカイブ
```bash
# .envに環境変数設定
LARK_APP_ID=cli_xxxxx
LARK_APP_SECRET=xxxxx
LARK_DRIVE_FOLDER_ID=xxxxx
LARKBASE_APP_TOKEN=xxxxx
LARKBASE_TABLE_ID=xxxxx

# YouTube URLを指定して実行
npx ts-node scripts/youtube-to-lark-drive.ts "https://www.youtube.com/watch?v=xxxxx"
```

### 2. Portalでイベント確認
```bash
npm run dev
# http://localhost:3000/events - イベント一覧
# http://localhost:3000/events/[id] - 詳細ページ
# http://localhost:3000/live - 24時間配信
```

## 📝 会話ログ要約（メモリ節約版）

**2025-01-19 セッション - 前半:**
1. GitHub Issues確認（11 Issues）
2. 実装方針変更: Supabase→LarkBase, B2→Lark Drive
3. CLAUDE.md更新（正しいロードマップ記録）
4. YouTube→Lark Drive統合スクリプト作成
5. Portal イベントページ実装（一覧・詳細）
6. 24時間VODプレイヤー実装
7. 全機能コミット（2コミット）

**2025-01-19 セッション - 後半（実装テスト）:**
1. ✅ LarkBase本番設定完了（App Token/Table ID/Folder ID）
2. ✅ YouTube動画ダウンロード成功（507MB, 1時間動画）
3. ✅ Lark Drive分割アップロードAPI実装
   - uploadPrepare/uploadPart/uploadFinish
   - 4MBパート分割（127パート）
   - Buffer→Stream変換対応
4. ❌ uploadPart API nullレスポンス問題発見
   - Lark SDK APIの実装課題
   - 次セッションで解決必要

**実装ファイル:**
- `lib/lark-client.ts` - 分割アップロード実装
- `scripts/youtube-to-lark-drive.ts` - 統合スクリプト
- `scripts/test-upload.ts` - テストスクリプト
- `app/events/` - Portalイベントページ
- `app/live/` - 24時間VOD
- `.env` - 本番認証情報設定

**次のステップ:**
1. Lark SDK uploadPart API問題解決
2. 代替アプローチ検討（直接HTTP API呼び出し）
3. 小さなファイルでテスト
4. LarkBase自動登録機能テスト

**完成度: 85%** - アップロード以外は完成

## 🔮 次フェーズ: PortalApp統合ロードマップ

### 統合先プロジェクト
- **GitHub**: https://github.com/IvyGain/SkillFreak-PortalApp
- **統合方針**: LarkBaseイベント管理DBを中核にした会員制ポータル

### アーキテクチャ設計

```
┌─────────────────────────────────────────────┐
│         LarkBase イベント管理DB              │
│         （中核データベース）                  │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼─────┐  ┌─────▼──────┐
│クラウドストレージ│  │PortalApp   │
│(アーカイブ)  │  │(Next.js)    │
│・動画保存    │  │・イベント一覧│
│・URL発行     │◄─┤・アーカイブ再生│
└──────────────┘  │・Discord認証│
                  └─────┬──────┘
                        │
                  ┌─────▼──────┐
                  │Discord認証  │
                  │・会員: 視聴OK│
                  │・非会員: 一覧のみ│
                  └────────────┘
```

### 実装タスク

#### Phase 1: Discord認証統合
- [ ] Discord OAuth2実装
- [ ] SkillFreak Discordサーバー連携
- [ ] メンバーロール確認API
- [ ] 会員/非会員の権限管理

#### Phase 2: LarkBase統合
- [ ] PortalAppとLarkBaseの双方向同期
- [ ] イベント情報マッピング
- [ ] クラウドストレージURL ↔ LarkBase連携
- [ ] アーカイブURL自動登録

#### Phase 3: 会員制機能
- [ ] 会員: アーカイブ動画埋め込み再生
- [ ] 会員: 特典受け取り機能
- [ ] 非会員: イベント一覧表示のみ
- [ ] 非会員: SkillFreak入会導線

#### Phase 4: クラウドストレージ連携
- [ ] アーカイブ動画クラウド保存
- [ ] 視聴用URL発行（ダウンロード不可）
- [ ] LarkBaseへのURL自動登録
- [ ] PortalAppでの埋め込み再生

### Lark App認証情報

```bash
# 本番用（統合時に使用）
LARK_APP_ID=cli_a85cf9e496f8de1c
LARK_APP_SECRET=dVj86A5gl12OBQl0tX5FDfR5FoDvsJLq

# LarkBase イベント管理DB
LARKBASE_APP_TOKEN=PxvIwd2fniGE5pkiC0YjHCNEpad
LARKBASE_TABLE_ID=tblnPssJqIBXNi6a
LARKBASE_VIEW_ID=vewdrMdlvD  # デフォルトビュー

# LarkBase URL
# https://ivygain-project.jp.larksuite.com/wiki/PxvIwd2fniGE5pkiC0YjHCNEpad?table=tblnPssJqIBXNi6a&view=vewdrMdlvD

# Lark Drive アーカイブフォルダ
LARK_DRIVE_FOLDER_ID=R2oWfpO5wlLEwBd5dMIjGRwvp2g
# https://ivygain-project.jp.larksuite.com/drive/folder/R2oWfpO5wlLEwBd5dMIjGRwvp2g

# Discord OAuth2（追加予定）
DISCORD_CLIENT_ID=xxxxx
DISCORD_CLIENT_SECRET=xxxxx
DISCORD_GUILD_ID=xxxxx  # SkillFreakサーバーID
```

### データフロー

1. **イベント作成**: LarkBaseでイベント登録
2. **YouTube配信**: Live配信実施
3. **自動アーカイブ**: YouTube→クラウドストレージ
4. **URL発行**: クラウド→視聴用URL生成
5. **LarkBase更新**: アーカイブURL登録
6. **PortalApp同期**: LarkBase→PortalAppデータ同期
7. **会員視聴**: Discord認証→アーカイブ再生

## サポート

- **Framework**: [Miyabi](https://github.com/ShunsukeHayashi/Autonomous-Operations)
- **Documentation**: README.md
- **Issues**: GitHub Issues で管理

---

🌸 **Miyabi** - Beauty in Autonomous Development

*このファイルは Claude Code が自動的に参照します。プロジェクトの変更に応じて更新してください。*

# API ドキュメント

## Lark Drive HTTP API

### uploadVideoToLarkHTTP

```typescript
import { uploadVideoToLarkHTTP } from '@/lib/lark-drive-http';

const fileToken = await uploadVideoToLarkHTTP(
  '/path/to/video.mp4',
  'FOLDER_TOKEN'
);
```

**パラメータ:**
- `filePath`: ローカルファイルパス
- `folderToken`: Lark Driveフォルダトークン

**戻り値:**
- `Promise<string>`: アップロードされたファイルトークン

## LarkBase Sync API

### getAllEvents

```typescript
import { getAllEvents } from '@/lib/portalapp-sync';

const events = await getAllEvents();
```

**戻り値:**
- `Promise<Event[]>`: イベント一覧

### getEvent

```typescript
import { getEvent } from '@/lib/portalapp-sync';

const event = await getEvent('record_id');
```

**パラメータ:**
- `recordId`: LarkBase レコードID

**戻り値:**
- `Promise<Event>`: イベント詳細

### createEvent

```typescript
import { createEvent } from '@/lib/portalapp-sync';

const recordId = await createEvent({
  title: 'イベントタイトル',
  description: '説明',
  scheduled_at: new Date().toISOString(),
  youtube_url: 'https://youtube.com/watch?v=xxxxx',
  status: 'draft',
  visibility: 'public',
});
```

**パラメータ:**
- `event`: イベント情報（`id`, `created_at` 除く）

**戻り値:**
- `Promise<string>`: 作成されたレコードID

### updateEvent

```typescript
import { updateEvent } from '@/lib/portalapp-sync';

await updateEvent('record_id', {
  status: 'published',
  archive_file_token: 'FILE_TOKEN',
});
```

**パラメータ:**
- `recordId`: LarkBase レコードID
- `updates`: 更新内容（部分更新）

### registerArchiveUrl

```typescript
import { registerArchiveUrl } from '@/lib/portalapp-sync';

await registerArchiveUrl('record_id', 'FILE_TOKEN');
```

**パラメータ:**
- `recordId`: LarkBase レコードID
- `fileToken`: Lark Drive ファイルトークン

**動作:**
- `archive_file_token` を設定
- `status` を `published` に変更
- `published_at` を現在時刻に設定

## Discord Auth API

### getDiscordAuthUrl

```typescript
import { getDiscordAuthUrl } from '@/lib/discord-auth';

const url = getDiscordAuthUrl('http://localhost:3000/callback');
```

**パラメータ:**
- `redirectUri`: OAuth2コールバックURL

**戻り値:**
- `string`: Discord認証URL

### authenticateUser

```typescript
import { authenticateUser } from '@/lib/discord-auth';

const { user, isMember } = await authenticateUser(
  code,
  'http://localhost:3000/callback'
);
```

**パラメータ:**
- `code`: OAuth2認証コード
- `redirectUri`: コールバックURL

**戻り値:**
- `user`: Discordユーザー情報
- `isMember`: SkillFreak会員かどうか

### isSkillFreakMember

```typescript
import { isSkillFreakMember } from '@/lib/discord-auth';

const isMember = await isSkillFreakMember(
  accessToken,
  guildId,
  memberRoleId
);
```

**パラメータ:**
- `accessToken`: Discord アクセストークン
- `guildId`: Discord サーバーID
- `memberRoleId`: 会員ロールID

**戻り値:**
- `Promise<boolean>`: 会員の場合 `true`

## Auth Middleware API

### requireAuth

```typescript
import { requireAuth } from '@/lib/auth-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await requireAuth(req, res);
  if (!user) return; // 401 Unauthorized

  // 処理続行
}
```

**動作:**
- 未認証の場合: `401 Unauthorized` レスポンス
- 認証済みの場合: ユーザー情報を返す

### requireMember

```typescript
import { requireMember } from '@/lib/auth-middleware';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await requireMember(req, res);
  if (!user) return; // 403 Forbidden (非会員)

  // 会員限定処理
}
```

**動作:**
- 未認証の場合: `401 Unauthorized`
- 非会員の場合: `403 Forbidden` + 入会URL
- 会員の場合: ユーザー情報を返す

### getAuthUser (Server Component)

```typescript
import { getAuthUser } from '@/lib/auth-middleware';

export default async function Page() {
  const user = await getAuthUser();

  if (!user) {
    return <div>未ログイン</div>;
  }

  return <div>ようこそ {user.name} さん</div>;
}
```

### getMemberUser (Server Component)

```typescript
import { getMemberUser } from '@/lib/auth-middleware';

export default async function MemberPage() {
  const user = await getMemberUser();

  if (!user) {
    return <div>会員限定ページです</div>;
  }

  return <div>会員コンテンツ</div>;
}
```

## Event型定義

```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  scheduled_at: string; // ISO 8601
  youtube_url: string;
  archive_file_token?: string;
  status: 'draft' | 'scheduled' | 'live' | 'published';
  visibility: 'public' | 'members_only' | 'private';
  published_at?: string; // ISO 8601
  created_at: string; // ISO 8601
  updated_at?: string; // ISO 8601
}
```

## AuthUser型定義

```typescript
interface AuthUser {
  id: string;
  name: string;
  email?: string;
  isMember: boolean;
}
```

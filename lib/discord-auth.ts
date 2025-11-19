/**
 * Discord OAuth2認証システム
 * SkillFreak会員/非会員の判定
 */

import axios from 'axios';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email?: string;
}

export interface DiscordMember {
  user: DiscordUser;
  roles: string[];
  joined_at: string;
}

/**
 * Discord OAuth2 認証URLを生成
 */
export function getDiscordAuthUrl(redirectUri: string): string {
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const scopes = ['identify', 'email', 'guilds', 'guilds.members.read'];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * 認証コードからアクセストークンを取得
 */
export async function getAccessToken(code: string, redirectUri: string): Promise<string> {
  const response = await axios.post(
    `${DISCORD_API_BASE}/oauth2/token`,
    new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

/**
 * アクセストークンからユーザー情報を取得
 */
export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await axios.get(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

/**
 * ユーザーがSkillFreakサーバーのメンバーかチェック
 */
export async function checkGuildMembership(
  accessToken: string,
  guildId: string
): Promise<DiscordMember | null> {
  try {
    const response = await axios.get(
      `${DISCORD_API_BASE}/users/@me/guilds/${guildId}/member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // サーバーメンバーではない
    }
    throw error;
  }
}

/**
 * ユーザーがSkillFreak会員かチェック（ロール確認）
 */
export async function isSkillFreakMember(
  accessToken: string,
  guildId: string,
  memberRoleId: string
): Promise<boolean> {
  const member = await checkGuildMembership(accessToken, guildId);

  if (!member) {
    return false; // サーバーメンバーではない
  }

  return member.roles.includes(memberRoleId);
}

/**
 * OAuth2フル認証フロー
 */
export async function authenticateUser(code: string, redirectUri: string): Promise<{
  user: DiscordUser;
  isMember: boolean;
}> {
  const guildId = process.env.DISCORD_GUILD_ID!;
  const memberRoleId = process.env.DISCORD_MEMBER_ROLE_ID!;

  // 1. アクセストークン取得
  const accessToken = await getAccessToken(code, redirectUri);

  // 2. ユーザー情報取得
  const user = await getDiscordUser(accessToken);

  // 3. 会員チェック
  const isMember = await isSkillFreakMember(accessToken, guildId, memberRoleId);

  return { user, isMember };
}

export default {
  getDiscordAuthUrl,
  authenticateUser,
  isSkillFreakMember,
};

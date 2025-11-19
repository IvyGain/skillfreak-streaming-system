/**
 * 会員/非会員権限管理ミドルウェア
 * Next.js API Routes用
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  isMember: boolean;
}

/**
 * 認証チェックミドルウェア
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthUser | null> {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return session.user as AuthUser;
}

/**
 * 会員専用ミドルウェア
 */
export async function requireMember(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthUser | null> {
  const user = await requireAuth(req, res);

  if (!user) {
    return null;
  }

  if (!user.isMember) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'SkillFreak会員限定コンテンツです',
      joinUrl: 'https://skillfreak.jp/join',
    });
    return null;
  }

  return user;
}

/**
 * React Server Component用認証チェック
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  return session.user as AuthUser;
}

/**
 * React Server Component用会員チェック
 */
export async function getMemberUser(): Promise<AuthUser | null> {
  const user = await getAuthUser();

  if (!user || !user.isMember) {
    return null;
  }

  return user;
}

export default {
  requireAuth,
  requireMember,
  getAuthUser,
  getMemberUser,
};

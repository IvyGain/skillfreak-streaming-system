/**
 * 会員限定コンテンツ表示コンポーネント
 */

'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface MemberOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function MemberOnly({ children, fallback }: MemberOnlyProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          ログインが必要です
        </h3>
        <p className="text-gray-300 mb-4">
          このコンテンツを表示するにはログインしてください
        </p>
        <Link
          href="/auth/signin"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
        >
          ログイン
        </Link>
      </div>
    );
  }

  const user = session.user as any;

  if (!user?.isMember) {
    return (
      fallback || (
        <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            会員限定コンテンツ
          </h3>
          <p className="text-gray-300 mb-4">
            このコンテンツはSkillFreak会員限定です
          </p>
          <a
            href="https://skillfreak.jp/join"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            会員登録する
          </a>
        </div>
      )
    );
  }

  return <>{children}</>;
}

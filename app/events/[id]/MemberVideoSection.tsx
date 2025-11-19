/**
 * 会員向けアーカイブ動画セクション
 */

'use client';

import MemberOnly from '@/components/MemberOnly';
import LarkVideoPlayer from '@/components/LarkVideoPlayer';

interface MemberVideoSectionProps {
  fileToken: string;
  title: string;
}

export default function MemberVideoSection({ fileToken, title }: MemberVideoSectionProps) {
  return (
    <MemberOnly
      fallback={
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              会員限定コンテンツ
            </h3>
            <p className="text-gray-300 mb-6">
              このアーカイブ動画を視聴するには<br />
              SkillFreak会員登録が必要です
            </p>
            <div className="space-y-3">
              <a
                href="https://skillfreak.jp/join"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105"
              >
                会員登録する
              </a>
              <div className="text-sm text-gray-400">
                月額 1,980円（税込）
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
        <LarkVideoPlayer fileToken={fileToken} title={title} />
      </div>
    </MemberOnly>
  );
}

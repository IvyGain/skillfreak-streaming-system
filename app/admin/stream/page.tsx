import StreamDashboard from '@/components/admin/StreamDashboard';
import PlaylistManager from '@/components/admin/PlaylistManager';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: '配信管理 - SkillFreak Admin',
  description: '24時間配信の管理画面',
};

export default function AdminStreamPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
          <Image
            src="/skillfreak-logo.png"
            alt="SkillFreak Logo"
            width={300}
            height={60}
            className="dark:brightness-110"
          />
        </Link>
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          配信管理
        </h1>

        <div className="space-y-8">
          <StreamDashboard />
          <PlaylistManager />
        </div>
      </div>
    </div>
  );
}

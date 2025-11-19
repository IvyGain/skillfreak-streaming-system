import LivePlayer from '@/components/stream/LivePlayer';
import UpcomingVideos from '@/components/stream/UpcomingVideos';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'SkillFreak 24時間ライブ配信',
  description: '24時間連続で過去のライブ配信アーカイブを視聴できます',
};

export default function StreamPage() {
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
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          24時間ライブ配信
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          過去のライブ配信アーカイブを24時間連続でお楽しみいただけます
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LivePlayer />
          </div>
          <div>
            <UpcomingVideos />
          </div>
        </div>
      </div>
    </div>
  );
}

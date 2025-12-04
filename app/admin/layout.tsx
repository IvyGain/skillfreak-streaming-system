import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AdminSidebar from '@/components/admin/AdminSidebar';

/**
 * Admin layout with authentication check and sidebar navigation
 * Only authenticated members can access admin pages
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const session = await getServerSession(authOptions);

  // Redirect to sign-in if not authenticated
  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/admin');
  }

  // Optional: Check if user is a member (uncomment to enable member-only access)
  // if (!(session.user as any).isMember) {
  //   redirect('/auth/signin?error=MemberOnly');
  // }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

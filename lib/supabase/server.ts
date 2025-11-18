/**
 * Supabase Server Client
 *
 * サーバーサイド（Server Components, Route Handlers, Server Actions）で使用
 * Next.js App Routerに対応
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server Component用Supabaseクライアント作成
 *
 * @returns Supabaseクライアントインスタンス
 *
 * @example
 * ```tsx
 * // app/page.tsx (Server Component)
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function Page() {
 *   const supabase = createClient();
 *
 *   const { data: archives } = await supabase
 *     .from('archives')
 *     .select('*');
 *
 *   return <div>{archives?.map(...)}</div>;
 * }
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // クッキー設定エラーを無視（ミドルウェアで処理）
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // クッキー削除エラーを無視
          }
        },
      },
    }
  );
}

/**
 * Service Role用Supabaseクライアント作成
 * 管理者権限が必要な操作に使用（RLS bypass）
 *
 * ⚠️ 注意: サーバーサイドでのみ使用してください
 *
 * @returns Service Role権限のSupabaseクライアント
 *
 * @example
 * ```tsx
 * // app/api/admin/route.ts
 * import { createAdminClient } from '@/lib/supabase/server';
 *
 * export async function POST() {
 *   const supabase = createAdminClient();
 *
 *   // RLSをバイパスして直接データ操作
 *   const { data } = await supabase
 *     .from('download_jobs')
 *     .insert({ ... });
 * }
 * ```
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!, // Service Role Key使用
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignore
          }
        },
      },
    }
  );
}

/**
 * Supabase Client (Browser)
 *
 * クライアントサイド（ブラウザ）で使用するSupabaseクライアント
 * Next.js App Routerに対応
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * ブラウザ用Supabaseクライアント作成
 *
 * @returns Supabaseクライアントインスタンス
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { createClient } from '@/lib/supabase/client';
 *
 * export default function MyComponent() {
 *   const supabase = createClient();
 *
 *   async function fetchData() {
 *     const { data, error } = await supabase
 *       .from('archives')
 *       .select('*');
 *   }
 * }
 * ```
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

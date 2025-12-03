/**
 * カテゴリ定義（共有データ）
 * サーバーコンポーネントとクライアントコンポーネントの両方から使用可能
 */

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// UIキット準拠のカテゴリ定義（日本語 + アイコン）
export const categories: Category[] = [
  { id: 'all', name: 'すべて', icon: '✨', color: '#8B5CF6' },
  { id: 'tech', name: 'テクノロジー', icon: '💻', color: '#3B82F6' },
  { id: 'design', name: 'デザイン', icon: '🎨', color: '#8B5CF6' },
  { id: 'business', name: 'ビジネス', icon: '📊', color: '#10B981' },
  { id: 'marketing', name: 'マーケティング', icon: '📈', color: '#F59E0B' },
  { id: 'career', name: 'キャリア', icon: '🚀', color: '#EF4444' },
];

// カテゴリIDから情報を取得
export function getCategoryById(id: string | undefined | null): Category {
  if (!id) return categories[0];
  return categories.find(c => c.id === id) || categories[0];
}

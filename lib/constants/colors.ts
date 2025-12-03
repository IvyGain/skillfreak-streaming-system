/**
 * SkillFreak カラーパレット
 * ダークテーマ対応
 */

export const skillFreakColors = {
  // メインカラー
  primary: '#8B5CF6',      // 紫
  secondary: '#06B6D4',    // シアン
  accent: '#F59E0B',       // オレンジ

  // ステータス
  success: '#10B981',      // 緑
  warning: '#F59E0B',      // オレンジ
  error: '#EF4444',        // 赤
  live: '#EF4444',         // ライブバッジ

  // 背景
  background: {
    main: '#0F0F23',       // メイン背景
    card: '#1A1A2E',       // カード背景
    hover: '#252542',      // ホバー時
  },

  // ボーダー
  border: {
    default: '#2D1B69',
    subtle: 'rgba(45, 27, 105, 0.4)',
  },

  // テキスト
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',
    muted: '#9CA3AF',
  },

  // グラデーション
  gradient: {
    primary: ['#0F0F23', '#1F1F3A', '#2D1B69'],
    card: ['transparent', 'rgba(0,0,0,0.8)'],
  },
};

// カテゴリ定義
export const categories = [
  { id: 'tech', name: 'テクノロジー', color: '#3B82F6', icon: '💻' },
  { id: 'design', name: 'デザイン', color: '#8B5CF6', icon: '🎨' },
  { id: 'business', name: 'ビジネス', color: '#10B981', icon: '📊' },
  { id: 'marketing', name: 'マーケティング', color: '#F59E0B', icon: '📈' },
  { id: 'career', name: 'キャリア', color: '#EF4444', icon: '🚀' },
];

// Tailwind CSS クラスマッピング
export const tailwindColors = {
  background: 'bg-[#0F0F23]',
  card: 'bg-[#1A1A2E]',
  border: 'border-[#2D1B69]',
  text: 'text-white',
  textMuted: 'text-gray-400',
  primary: 'text-purple-500',
  primaryBg: 'bg-purple-500',
};

export default skillFreakColors;

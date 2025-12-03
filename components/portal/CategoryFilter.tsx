'use client';

import { categories, type Category } from '@/lib/constants/categories';

// 再エクスポート（後方互換性のため）
export { categories, type Category };

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {categories.map((category) => {
          const isActive = selectedCategory === category.id ||
            (category.id === 'all' && !selectedCategory);

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id === 'all' ? null : category.id)}
              className={`filter-pill ${isActive ? 'active' : ''}`}
              style={isActive ? { backgroundColor: category.color, borderColor: category.color } : {}}
            >
              {category.icon && <span className="mr-1">{category.icon}</span>}
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

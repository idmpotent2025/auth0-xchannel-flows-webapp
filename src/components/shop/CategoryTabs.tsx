import { CategoryKey, CATEGORY_LABELS } from '@/lib/constants/products';

interface CategoryTabsProps {
  activeCategory: CategoryKey | 'all';
  onCategoryChange: (category: CategoryKey | 'all') => void;
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const categories: Array<CategoryKey | 'all'> = ['all', 'dresses', 'petFood', 'burritos', 'cpgGoods'];

  const getCategoryLabel = (category: CategoryKey | 'all'): string => {
    if (category === 'all') return 'All Products';
    return CATEGORY_LABELS[category];
  };

  const getCategoryIcon = (category: CategoryKey | 'all'): string => {
    switch (category) {
      case 'all': return '🛍️';
      case 'dresses': return '👗';
      case 'petFood': return '🐾';
      case 'burritos': return '🌯';
      case 'cpgGoods': return '📦';
      default: return '📦';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-2 mb-6 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-xl">{getCategoryIcon(category)}</span>
            <span>{getCategoryLabel(category)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { Category } from '@/types/pos';
import { cn } from '@/lib/utils';

interface QuickCategoriesProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function QuickCategories({
  categories,
  selectedCategory,
  onSelectCategory,
}: QuickCategoriesProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          'category-btn shrink-0',
          selectedCategory === null && 'active'
        )}
      >
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            'category-btn shrink-0',
            selectedCategory === category.id && 'active'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

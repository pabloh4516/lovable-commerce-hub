import { Category } from '@/types/pos';

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
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selectedCategory === null
            ? 'bg-primary text-primary-foreground shadow-glow'
            : 'bg-secondary text-foreground hover:bg-muted'
        }`}
      >
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === category.id
              ? 'bg-primary text-primary-foreground shadow-glow'
              : 'bg-secondary text-foreground hover:bg-muted'
          }`}
        >
          <span>{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}

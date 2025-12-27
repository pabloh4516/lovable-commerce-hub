import { User, Tag, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Customer, Category, Product, CartItem } from '@/types/pos';
import { QuickCategories } from './QuickCategories';
import { QuickProductsBar } from './QuickProductsBar';

interface SidePanelProps {
  customer: Customer | null;
  customerCpf?: string;
  categories: Category[];
  quickProducts: Product[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectProduct: (product: Product) => void;
  onOpenCustomer: () => void;
  onOpenDiscount: () => void;
  onCheckout: () => void;
  total: number;
  itemCount: number;
  isRegisterOpen: boolean;
}

export function SidePanel({
  customer,
  customerCpf,
  categories,
  quickProducts,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onOpenCustomer,
  onOpenDiscount,
  onCheckout,
  total,
  itemCount,
  isRegisterOpen,
}: SidePanelProps) {
  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Customer Info */}
      <div className="p-4 border-b border-border">
        <button
          onClick={onOpenCustomer}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-muted transition-colors duration-100"
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 text-left">
            {customer ? (
              <>
                <p className="font-medium text-sm">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.cpf || customerCpf || 'Sem CPF'}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-sm">Cliente não identificado</p>
                <p className="text-xs text-muted-foreground">F7 para identificar</p>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Quick Categories */}
      <div className="p-4 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Categorias</h3>
        <QuickCategories
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
      </div>

      {/* Quick Products */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Produtos Rápidos</h3>
        <div className="grid grid-cols-2 gap-2">
          {quickProducts.slice(0, 8).map((product) => (
            <button
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="flex flex-col items-start p-3 rounded-lg bg-secondary hover:bg-muted transition-colors duration-100 text-left"
            >
              <span className="text-[10px] font-mono text-muted-foreground">{product.code}</span>
              <span className="text-sm font-medium truncate w-full">{product.name}</span>
              <span className="text-sm font-semibold tabular-nums mt-1">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Discount Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full"
          onClick={onOpenDiscount}
          disabled={itemCount === 0}
        >
          <Tag className="w-4 h-4 mr-2" />
          Desconto na Venda (F6)
        </Button>
      </div>

      {/* Checkout Button */}
      <div className="p-4 pt-0">
        <Button
          variant="success"
          size="xl"
          className="w-full h-16"
          onClick={onCheckout}
          disabled={!isRegisterOpen || itemCount === 0}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <span className="font-semibold">FINALIZAR VENDA</span>
              <span className="text-xs opacity-80">(F12)</span>
            </div>
            <span className="text-xl font-bold tabular-nums mt-0.5">
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </Button>
      </div>
    </div>
  );
}

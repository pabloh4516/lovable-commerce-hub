import { useCallback, useState, useEffect } from 'react';
import { QuickModeSearch } from './QuickModeSearch';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Product, Customer } from '@/types/pos';
import { CartItemWithPromotion } from '@/hooks/useCartWithPromotions';
import { 
  User, 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  LogOut,
  Maximize,
  HelpCircle,
  Search,
  Percent,
  Hash,
  UserPlus,
  XCircle,
  Receipt,
  Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFullscreen } from '@/hooks/useFullscreen';

interface POSQuickModeProps {
  products: Product[];
  cartItems: CartItemWithPromotion[];
  selectedItem: CartItemWithPromotion | null;
  setSelectedItem: (item: CartItemWithPromotion | null) => void;
  addToCart: (product: Product) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  customer: Customer | null;
  customerCpf?: string;
  subtotal: number;
  discountValue: number;
  total: number;
  isRegisterOpen: boolean;
  openCustomerModal: () => void;
  openPaymentModal: () => void;
  openShortcutsModal: () => void;
  openPriceCheckModal: () => void;
  openDiscountModal: () => void;
  openQuantityModal: () => void;
}

const SHORTCUTS = [
  { key: 'F1', label: 'Ajuda', icon: HelpCircle },
  { key: 'F2', label: 'Nova Venda', icon: ShoppingCart },
  { key: 'F3', label: 'Quantidade', icon: Hash },
  { key: 'F4', label: 'Consulta', icon: Search },
  { key: 'F5', label: 'Desconto Item', icon: Percent },
  { key: 'F6', label: 'Desconto Total', icon: Percent },
  { key: 'F7', label: 'Cliente', icon: UserPlus },
  { key: 'F8', label: 'Excluir Item', icon: XCircle },
  { key: 'F9', label: 'Cancelar Venda', icon: Trash2 },
  { key: 'F10', label: 'Cupom', icon: Receipt },
  { key: 'F11', label: 'Tela Cheia', icon: Maximize },
  { key: 'F12', label: 'Finalizar', icon: CreditCard },
];

export function POSQuickMode({
  products,
  cartItems,
  selectedItem,
  setSelectedItem,
  addToCart,
  removeItem,
  clearCart,
  customer,
  subtotal,
  discountValue,
  total,
  isRegisterOpen,
  openCustomerModal,
  openPaymentModal,
  openShortcutsModal,
  openPriceCheckModal,
  openDiscountModal,
  openQuantityModal,
}: POSQuickModeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toggleNativeFullscreen } = useFullscreen();

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0 || !isRegisterOpen) return;
    openPaymentModal();
  }, [cartItems.length, isRegisterOpen, openPaymentModal]);

  const handleNewSale = useCallback(() => {
    clearCart();
  }, [clearCart]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onF1: openShortcutsModal,
    onF2: handleNewSale,
    onF3: () => selectedItem && openQuantityModal(),
    onF4: openPriceCheckModal,
    onF5: () => selectedItem && openDiscountModal(),
    onF6: () => cartItems.length > 0 && openDiscountModal(),
    onF7: openCustomerModal,
    onF8: () => selectedItem && removeItem(selectedItem.id),
    onF9: () => cartItems.length > 0 && clearCart(),
    onF11: toggleNativeFullscreen,
    onF12: handleCheckout,
  }, true);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
      {/* Header - Dark Blue with Clock */}
      <div className="bg-sidebar border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">PDV Rápido</h1>
              <p className="text-sm text-sidebar-foreground/70 capitalize">{formatDate(currentTime)}</p>
            </div>
          </div>
          
          {/* Digital Clock */}
          <div className="text-right">
            <div className="text-4xl font-mono font-bold tracking-wider text-primary">
              {formatTime(currentTime)}
            </div>
            {!isRegisterOpen && (
              <p className="text-sm text-warning mt-1">Caixa Fechado</p>
            )}
          </div>
        </div>

        {/* Customer indicator */}
        {customer && (
          <div className="mt-3 px-3 py-2 bg-primary/10 rounded-lg flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">{customer.name}</span>
            {customer.cpf && (
              <span className="text-xs text-sidebar-foreground/70">CPF: {customer.cpf}</span>
            )}
          </div>
        )}
      </div>

      {/* Idle State or Active Sale */}
      {cartItems.length === 0 && isRegisterOpen ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Caixa Livre</h2>
              <p className="text-sidebar-foreground/70">
                Pressione <kbd className="px-2 py-1 bg-primary/20 rounded text-primary font-mono text-sm">F2</kbd> ou escaneie um produto para iniciar
              </p>
            </div>
            
            {/* Search in idle */}
            <div className="w-full max-w-md mx-auto mt-6">
              <QuickModeSearch
                products={products}
                onSelectProduct={addToCart}
                disabled={!isRegisterOpen}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="p-4 border-b border-sidebar-border">
            <QuickModeSearch
              products={products}
              onSelectProduct={addToCart}
              disabled={!isRegisterOpen}
            />
          </div>

          {/* Items List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedItem?.id === item.id
                      ? 'bg-primary/20 border border-primary/50'
                      : 'bg-sidebar-accent/50 hover:bg-sidebar-accent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-sidebar-foreground/70">
                          {item.quantity}x {formatCurrency(item.product.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(item.subtotal)}</p>
                      {item.discount > 0 && (
                        <p className="text-xs text-success">-{formatCurrency(item.discount)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Totals */}
          <div className="p-4 bg-sidebar-accent/50 border-t border-sidebar-border">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-sidebar-foreground/70 uppercase">Itens</p>
                <p className="text-xl font-bold">{cartItems.length}</p>
              </div>
              <div>
                <p className="text-xs text-sidebar-foreground/70 uppercase">Subtotal</p>
                <p className="text-xl font-bold">{formatCurrency(subtotal)}</p>
              </div>
              <div>
                <p className="text-xs text-sidebar-foreground/70 uppercase">Desconto</p>
                <p className="text-xl font-bold text-success">{formatCurrency(discountValue)}</p>
              </div>
            </div>
            
            {/* Total */}
            <div className="bg-primary rounded-xl p-4 text-primary-foreground">
              <div className="flex items-center justify-between">
                <span className="text-lg uppercase font-medium">Total</span>
                <span className="text-4xl font-bold font-mono">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Shortcuts Bar */}
      <div className="p-3 bg-sidebar border-t border-sidebar-border">
        <div className="grid grid-cols-6 gap-2">
          {SHORTCUTS.slice(0, 6).map(shortcut => (
            <button
              key={shortcut.key}
              onClick={() => {
                if (shortcut.key === 'F1') openShortcutsModal();
                if (shortcut.key === 'F2') handleNewSale();
                if (shortcut.key === 'F3' && selectedItem) openQuantityModal();
                if (shortcut.key === 'F4') openPriceCheckModal();
                if (shortcut.key === 'F5' && selectedItem) openDiscountModal();
                if (shortcut.key === 'F6' && cartItems.length > 0) openDiscountModal();
              }}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors text-xs"
            >
              <span className="font-mono font-bold text-primary">{shortcut.key}</span>
              <shortcut.icon className="w-4 h-4" />
              <span className="text-[10px] text-sidebar-foreground/70">{shortcut.label}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-2 mt-2">
          {SHORTCUTS.slice(6).map(shortcut => (
            <button
              key={shortcut.key}
              onClick={() => {
                if (shortcut.key === 'F7') openCustomerModal();
                if (shortcut.key === 'F8' && selectedItem) removeItem(selectedItem.id);
                if (shortcut.key === 'F9' && cartItems.length > 0) clearCart();
                if (shortcut.key === 'F11') toggleNativeFullscreen();
                if (shortcut.key === 'F12') handleCheckout();
              }}
              disabled={
                (shortcut.key === 'F8' && !selectedItem) ||
                (shortcut.key === 'F9' && cartItems.length === 0) ||
                (shortcut.key === 'F12' && (cartItems.length === 0 || !isRegisterOpen))
              }
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-xs ${
                shortcut.key === 'F12'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : shortcut.key === 'F9'
                  ? 'bg-destructive/20 text-destructive hover:bg-destructive/30'
                  : 'bg-sidebar-accent/50 hover:bg-sidebar-accent'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="font-mono font-bold">{shortcut.key}</span>
              <shortcut.icon className="w-4 h-4" />
              <span className="text-[10px]">{shortcut.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

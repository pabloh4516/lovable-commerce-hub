import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onOpenPDV?: () => void;
  showPDVButton?: boolean;
}

export function PageHeader({ title, subtitle, onOpenPDV, showPDVButton = true }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {showPDVButton && onOpenPDV && (
        <Button 
          onClick={onOpenPDV}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Abrir PDV
        </Button>
      )}
    </div>
  );
}
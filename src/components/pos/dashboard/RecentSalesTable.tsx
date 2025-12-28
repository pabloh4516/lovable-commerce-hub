import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Receipt, User, CreditCard, ArrowUpRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface RecentSale {
  id: string;
  number: number;
  total: number;
  status: 'completed' | 'cancelled' | 'pending';
  created_at: string;
  customer?: { name: string } | null;
  payments?: { method: string; amount: number }[];
}

interface RecentSalesTableProps {
  sales: RecentSale[];
}

const statusConfig = {
  completed: { label: 'Concluída', className: 'bg-success/15 text-success border-success/30' },
  pending: { label: 'Pendente', className: 'bg-warning/15 text-warning border-warning/30' },
  cancelled: { label: 'Cancelada', className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  credit: 'Crédito',
  debit: 'Débito',
  cash: 'Dinheiro',
  fiado: 'Fiado',
};

const paymentIcons: Record<string, string> = {
  pix: '⚡',
  credit: '💳',
  debit: '💳',
  cash: '💵',
  fiado: '📝',
};

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  return (
    <div className="group rounded-2xl border border-border/50 bg-card overflow-hidden shadow-md hover:shadow-glow transition-all duration-500 animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-border/30 bg-gradient-to-r from-success/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Receipt className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Últimas Vendas</h3>
              <p className="text-sm text-muted-foreground">Transações em tempo real</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors">
            <Eye className="w-4 h-4" />
            Ver todas
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30 bg-muted/30">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                Venda
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                Cliente
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                Pagamento
              </th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                Total
              </th>
              <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {sales.map((sale, index) => {
              const config = statusConfig[sale.status];
              const primaryPayment = sale.payments?.[0];
              const paymentIcon = primaryPayment ? paymentIcons[primaryPayment.method] : '💳';
              const paymentLabel = primaryPayment ? paymentLabels[primaryPayment.method] : '-';
              
              return (
                <tr 
                  key={sale.id}
                  className="hover:bg-muted/30 transition-all duration-200 animate-slide-up cursor-pointer group/row"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                        <span className="text-xs font-bold text-primary">#{sale.number}</span>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        {format(new Date(sale.created_at), "HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium">
                        {sale.customer?.name || 'Cliente avulso'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{paymentIcon}</span>
                      <span className="text-sm font-medium">{paymentLabel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-bold text-lg tabular-nums">
                        R$ {sale.total.toFixed(2).replace('.', ',')}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-success opacity-0 group-hover/row:opacity-100 transition-opacity" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs font-semibold', config.className)}
                    >
                      {config.label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sales.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground font-medium">Nenhuma venda registrada hoje</p>
          <p className="text-sm text-muted-foreground/70 mt-1">As vendas aparecerão aqui em tempo real</p>
        </div>
      )}
    </div>
  );
}

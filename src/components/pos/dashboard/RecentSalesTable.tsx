import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Receipt, User, CreditCard } from 'lucide-react';
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
  completed: { label: 'Concluída', className: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'Pendente', className: 'bg-warning/10 text-warning border-warning/20' },
  cancelled: { label: 'Cancelada', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  credit: 'Crédito',
  debit: 'Débito',
  cash: 'Dinheiro',
  fiado: 'Fiado',
};

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Últimas Vendas</h3>
            <p className="text-sm text-muted-foreground">Transações recentes</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/30">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Venda
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Cliente
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Pagamento
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Total
              </th>
              <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {sales.map((sale, index) => {
              const config = statusConfig[sale.status];
              const paymentMethods = sale.payments?.map(p => paymentLabels[p.method] || p.method).join(', ') || '-';
              
              return (
                <tr 
                  key={sale.id}
                  className="hover:bg-secondary/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">#{sale.number}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(sale.created_at), "HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {sale.customer?.name || 'Cliente avulso'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{paymentMethods}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-semibold tabular-nums">
                      R$ {sale.total.toFixed(2).replace('.', ',')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', config.className)}
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
        <div className="p-8 text-center text-muted-foreground">
          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma venda registrada hoje</p>
        </div>
      )}
    </div>
  );
}

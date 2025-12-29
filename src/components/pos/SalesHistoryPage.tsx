import { useState } from 'react';
import { History, Eye, Printer, Download, Calendar, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSales } from '@/hooks/useSales';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModernPageHeader, ModernStatCard, ModernSearchBar, ModernCard, ModernEmptyState } from './common';

export function SalesHistoryPage() {
  const { data: sales, isLoading } = useSales();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSales = sales?.filter(sale => {
    const matchesSearch = sale.number.toString().includes(search) ||
      sale.customer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      completed: { label: 'Concluída', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      pending: { label: 'Pendente', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
      cancelled: { label: 'Cancelada', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
    };
    const variant = variants[status] || { label: status, className: '' };
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const completedSales = filteredSales.filter(s => s.status === 'completed').length;
  const pendingSales = filteredSales.filter(s => s.status === 'pending').length;

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-auto">
      <ModernPageHeader
        title="Histórico de Vendas"
        subtitle="Consulte todas as vendas realizadas"
        icon={History}
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatCard
          title="Total de Vendas"
          value={filteredSales.length}
          icon={ShoppingBag}
          variant="blue"
        />
        <ModernStatCard
          title="Vendas Concluídas"
          value={completedSales}
          icon={ShoppingBag}
          variant="green"
        />
        <ModernStatCard
          title="Valor Total"
          value={formatCurrency(totalSales)}
          icon={ShoppingBag}
          variant="purple"
        />
        <ModernStatCard
          title="Ticket Médio"
          value={formatCurrency(filteredSales.length > 0 ? totalSales / filteredSales.length : 0)}
          icon={ShoppingBag}
          variant="amber"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <ModernSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por número ou cliente..."
          className="flex-1 max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales Table */}
      <ModernCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Nº</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Data/Hora</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Cliente</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Subtotal</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Desconto</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Total</th>
                <th className="text-center p-4 font-medium text-muted-foreground text-sm">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <ModernEmptyState
                      icon={ShoppingBag}
                      title="Nenhuma venda encontrada"
                    />
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale, index) => (
                  <tr 
                    key={sale.id} 
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="p-4">
                      <span className="font-mono font-medium text-primary">#{sale.number}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{sale.customer?.name || 'Cliente não identificado'}</td>
                    <td className="p-4 text-right tabular-nums">{formatCurrency(sale.subtotal)}</td>
                    <td className="p-4 text-right tabular-nums text-red-500">
                      {sale.discount > 0 ? `-${formatCurrency(sale.discount)}` : '-'}
                    </td>
                    <td className="p-4 text-right font-semibold tabular-nums">{formatCurrency(sale.total)}</td>
                    <td className="p-4 text-center">{getStatusBadge(sale.status)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ModernCard>
    </div>
  );
}

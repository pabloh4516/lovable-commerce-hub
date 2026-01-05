import { useState } from 'react';
import { Search, Filter, Calendar, User, FileText, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuditLogs } from '@/hooks/useAuditLog';
import { useStoreContext } from '@/contexts/StoreContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModernPageHeader, ModernStatCard, ModernCard, ModernEmptyState } from './common';

export function AuditPage() {
  const { currentStore } = useStoreContext();
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  
  const { data: logs = [], isLoading, refetch } = useAuditLogs({
    storeId: currentStore?.id,
    action: actionFilter !== 'all' ? actionFilter : undefined,
    entityType: entityFilter !== 'all' ? entityFilter : undefined,
    limit: 100,
  });

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('login')) {
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
    if (action.includes('delete') || action.includes('cancel')) {
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    }
    if (action.includes('update')) {
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
    return 'bg-muted text-muted-foreground';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'sale.create': 'Venda Criada',
      'sale.complete': 'Venda Finalizada',
      'sale.cancel': 'Venda Cancelada',
      'product.create': 'Produto Criado',
      'product.update': 'Produto Atualizado',
      'product.delete': 'Produto Removido',
      'stock.adjust': 'Ajuste de Estoque',
      'stock.transfer': 'Transferência',
      'register.open': 'Caixa Aberto',
      'register.close': 'Caixa Fechado',
      'cash.deposit': 'Suprimento',
      'cash.withdrawal': 'Sangria',
      'user.login': 'Login',
      'user.logout': 'Logout',
      'customer.create': 'Cliente Criado',
      'customer.update': 'Cliente Atualizado',
      'discount.apply': 'Desconto Aplicado',
      'promotion.create': 'Promoção Criada',
      'promotion.update': 'Promoção Atualizada',
    };
    return labels[action] || action;
  };

  const getEntityLabel = (entity: string) => {
    const labels: Record<string, string> = {
      'sale': 'Venda',
      'product': 'Produto',
      'stock': 'Estoque',
      'register': 'Caixa',
      'cash': 'Movimentação',
      'user': 'Usuário',
      'customer': 'Cliente',
      'promotion': 'Promoção',
    };
    return labels[entity] || entity;
  };

  // Get unique actions and entities for filters
  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueEntities = [...new Set(logs.map(l => l.entity_type))];

  // Stats
  const todayLogs = logs.filter(l => {
    const logDate = new Date(l.created_at || '');
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-auto">
      <ModernPageHeader
        title="Auditoria do Sistema"
        subtitle="Histórico de ações e eventos do sistema"
        icon={Shield}
        actions={
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModernStatCard
          title="Total de Registros"
          value={logs.length}
          icon={FileText}
          variant="blue"
        />
        <ModernStatCard
          title="Registros Hoje"
          value={todayLogs}
          icon={Calendar}
          variant="green"
        />
        <ModernStatCard
          title="Usuários Ativos"
          value={new Set(logs.map(l => l.user_id).filter(Boolean)).size}
          icon={User}
          variant="purple"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            {uniqueActions.map(action => (
              <SelectItem key={action} value={action}>
                {getActionLabel(action)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por entidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as entidades</SelectItem>
            {uniqueEntities.map(entity => (
              <SelectItem key={entity} value={entity}>
                {getEntityLabel(entity)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <ModernCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Data/Hora</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Ação</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Entidade</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Detalhes</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">IP</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando registros...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <ModernEmptyState
                      icon={FileText}
                      title="Nenhum registro encontrado"
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr 
                    key={log.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <td className="p-4 text-sm text-muted-foreground">
                      {log.created_at && format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                    </td>
                    <td className="p-4">
                      <Badge className={getActionColor(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">
                        {getEntityLabel(log.entity_type)}
                      </Badge>
                    </td>
                    <td className="p-4 max-w-[300px]">
                      {log.reason && (
                        <p className="text-sm text-muted-foreground truncate">{log.reason}</p>
                      )}
                      {log.entity_id && (
                        <p className="text-xs font-mono text-muted-foreground">
                          ID: {log.entity_id.slice(0, 8)}...
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground font-mono">
                      {log.ip_address || '-'}
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

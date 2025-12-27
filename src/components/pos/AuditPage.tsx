import { useState } from 'react';
import { Search, Filter, Calendar, User, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuditLogs } from '@/hooks/useAuditLog';
import { useStoreContext } from '@/contexts/StoreContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
      return 'bg-emerald-500/10 text-emerald-500';
    }
    if (action.includes('delete') || action.includes('cancel')) {
      return 'bg-red-500/10 text-red-500';
    }
    if (action.includes('update')) {
      return 'bg-blue-500/10 text-blue-500';
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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Auditoria do Sistema</h1>
            <p className="text-muted-foreground">Histórico de ações e eventos do sistema</p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{logs.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Registros</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayLogs}</p>
                  <p className="text-sm text-muted-foreground">Registros Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(logs.map(l => l.user_id).filter(Boolean)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 flex gap-4 flex-wrap">
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
      <div className="flex-1 overflow-auto px-6 pb-6">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando registros...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {log.created_at && format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getEntityLabel(log.entity_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      {log.reason && (
                        <p className="text-sm text-muted-foreground truncate">{log.reason}</p>
                      )}
                      {log.entity_id && (
                        <p className="text-xs font-mono text-muted-foreground">
                          ID: {log.entity_id.slice(0, 8)}...
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {log.ip_address || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

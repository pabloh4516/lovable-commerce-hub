import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  FileText,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  User,
  Clock,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useAuditLogs, AuditLog } from '@/hooks/useAuditLog';
import { cn } from '@/lib/utils';

const actionLabels: Record<string, { label: string; color: string }> = {
  'sale.create': { label: 'Venda Criada', color: 'bg-success/10 text-success' },
  'sale.cancel': { label: 'Venda Cancelada', color: 'bg-destructive/10 text-destructive' },
  'sale.item_cancel': { label: 'Item Cancelado', color: 'bg-warning/10 text-warning' },
  'sale.discount': { label: 'Desconto Aplicado', color: 'bg-blue-500/10 text-blue-500' },
  'register.open': { label: 'Caixa Aberto', color: 'bg-success/10 text-success' },
  'register.close': { label: 'Caixa Fechado', color: 'bg-primary/10 text-primary' },
  'register.withdrawal': { label: 'Sangria', color: 'bg-warning/10 text-warning' },
  'register.deposit': { label: 'Suprimento', color: 'bg-success/10 text-success' },
  'product.create': { label: 'Produto Criado', color: 'bg-success/10 text-success' },
  'product.update': { label: 'Produto Atualizado', color: 'bg-blue-500/10 text-blue-500' },
  'product.delete': { label: 'Produto Excluído', color: 'bg-destructive/10 text-destructive' },
  'product.price_change': { label: 'Preço Alterado', color: 'bg-warning/10 text-warning' },
  'stock.adjust': { label: 'Estoque Ajustado', color: 'bg-purple-500/10 text-purple-500' },
  'stock.transfer': { label: 'Transferência', color: 'bg-blue-500/10 text-blue-500' },
  'stock.receive': { label: 'Mercadoria Recebida', color: 'bg-success/10 text-success' },
  'user.login': { label: 'Login', color: 'bg-primary/10 text-primary' },
  'user.logout': { label: 'Logout', color: 'bg-muted text-muted-foreground' },
};

interface AuditLogRowProps {
  log: AuditLog;
}

function AuditLogRow({ log }: AuditLogRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const actionInfo = actionLabels[log.action] || { 
    label: log.action, 
    color: 'bg-muted text-muted-foreground' 
  };

  const hasDetails = log.old_values || log.new_values || log.reason || log.metadata;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="w-10">
          {hasDetails && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          )}
        </TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground">
          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className={cn('font-normal', actionInfo.color)}>
            {actionInfo.label}
          </Badge>
        </TableCell>
        <TableCell className="text-sm">{log.entity_type}</TableCell>
        <TableCell className="text-sm">
          {(log.metadata as any)?.operator_name || 'Sistema'}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {log.reason || '-'}
        </TableCell>
      </TableRow>

      {hasDetails && (
        <CollapsibleContent asChild>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableCell colSpan={6} className="py-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {log.old_values && (
                  <div>
                    <div className="font-medium text-muted-foreground mb-1">
                      Valores Anteriores
                    </div>
                    <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(log.old_values, null, 2)}
                    </pre>
                  </div>
                )}
                {log.new_values && (
                  <div>
                    <div className="font-medium text-muted-foreground mb-1">
                      Novos Valores
                    </div>
                    <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(log.new_values, null, 2)}
                    </pre>
                  </div>
                )}
                {log.metadata && !log.old_values && !log.new_values && (
                  <div className="col-span-2">
                    <div className="font-medium text-muted-foreground mb-1">
                      Detalhes
                    </div>
                    <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export function AuditViewer() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const { data: logs, isLoading } = useAuditLogs({
    action: actionFilter !== 'all' ? actionFilter : undefined,
    entityType: entityFilter !== 'all' ? entityFilter : undefined,
    limit: 200,
  });

  const filteredLogs = logs?.filter((log) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.entity_type.toLowerCase().includes(searchLower) ||
      (log.metadata as any)?.operator_name?.toLowerCase().includes(searchLower) ||
      log.reason?.toLowerCase().includes(searchLower)
    );
  });

  const uniqueActions = [...new Set(logs?.map((l) => l.action) || [])];
  const uniqueEntities = [...new Set(logs?.map((l) => l.entity_type) || [])];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Logs de Auditoria
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nos logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {actionLabels[action]?.label || action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as entidades</SelectItem>
                {uniqueEntities.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead className="w-44">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Data/Hora
                      </div>
                    </TableHead>
                    <TableHead className="w-40">Ação</TableHead>
                    <TableHead className="w-32">Entidade</TableHead>
                    <TableHead className="w-40">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Operador
                      </div>
                    </TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum log encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs?.map((log) => (
                      <AuditLogRow key={log.id} log={log} />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              Exibindo {filteredLogs?.length || 0} de {logs?.length || 0} registros
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

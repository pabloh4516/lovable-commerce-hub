import { useState } from 'react';
import { Receipt, Calendar, DollarSign, Wallet, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCashRegister } from '@/hooks/useCashRegister';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OpenRegisterModal } from './OpenRegisterModal';
import { CloseRegisterModal } from './CloseRegisterModal';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ModernPageHeader, ModernStatCard, ModernCard, ModernEmptyState } from './common';

export function CashManagementPage() {
  const { register, isOpen } = useCashRegister();
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const { data: registers = [] } = useQuery({
    queryKey: ['cash_registers_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .order('opened_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    return status === 'open' 
      ? <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Aberto</Badge>
      : <Badge variant="secondary">Fechado</Badge>;
  };

  const todayRegisters = registers.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.opened_at.startsWith(today);
  });

  const totalSalesToday = todayRegisters.reduce((sum, r) => sum + (r.total_sales || 0), 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-auto">
      <ModernPageHeader
        title="Gestão de Caixa"
        subtitle="Controle de abertura e fechamento de caixa"
        icon={Receipt}
        actions={
          isOpen ? (
            <Button variant="destructive" onClick={() => setShowCloseModal(true)}>
              Fechar Caixa
            </Button>
          ) : (
            <Button onClick={() => setShowOpenModal(true)}>
              Abrir Caixa
            </Button>
          )
        }
      />

      {/* Status atual do caixa */}
      {isOpen && register && (
        <ModernCard className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-600">Caixa Atual - #{register.number}</h3>
              <p className="text-sm text-muted-foreground">Aberto às {format(new Date(register.openedAt), "HH:mm", { locale: ptBR })}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground mb-1">Saldo Inicial</p>
              <p className="font-semibold">{formatCurrency(register.openingBalance)}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground mb-1">Total Vendas</p>
              <p className="font-semibold text-emerald-600">{formatCurrency(register.totalSales)}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Wallet className="w-3 h-3" /> Dinheiro</p>
              <p className="font-semibold">{formatCurrency(register.totalCash)}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Cartão</p>
              <p className="font-semibold">{formatCurrency(register.totalCredit + register.totalDebit)}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Smartphone className="w-3 h-3" /> PIX</p>
              <p className="font-semibold">{formatCurrency(register.totalPix)}</p>
            </div>
          </div>
        </ModernCard>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatCard
          title="Status Atual"
          value={isOpen ? 'Aberto' : 'Fechado'}
          icon={Receipt}
          variant={isOpen ? 'green' : 'blue'}
        />
        <ModernStatCard
          title="Vendas Hoje"
          value={formatCurrency(totalSalesToday)}
          icon={DollarSign}
          variant="green"
        />
        <ModernStatCard
          title="Caixas Hoje"
          value={todayRegisters.length}
          icon={Receipt}
          variant="amber"
        />
        <ModernStatCard
          title="Total Histórico"
          value={registers.length}
          icon={Receipt}
          variant="purple"
        />
      </div>

      {/* History Table */}
      <ModernCard noPadding>
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Histórico de Caixas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Nº</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Abertura</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Fechamento</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Saldo Inicial</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Total Vendas</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Saldo Final</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Diferença</th>
                <th className="text-center p-4 font-medium text-muted-foreground text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {registers.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <ModernEmptyState
                      icon={Receipt}
                      title="Nenhum caixa registrado"
                    />
                  </td>
                </tr>
              ) : (
                registers.map((reg, index) => (
                  <tr 
                    key={reg.id} 
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="p-4">
                      <span className="font-mono font-medium text-primary">#{reg.number}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {format(new Date(reg.opened_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {reg.closed_at 
                        ? format(new Date(reg.closed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : '-'}
                    </td>
                    <td className="p-4 text-right tabular-nums">{formatCurrency(reg.opening_balance)}</td>
                    <td className="p-4 text-right tabular-nums font-medium text-emerald-600">
                      {formatCurrency(reg.total_sales)}
                    </td>
                    <td className="p-4 text-right tabular-nums">
                      {reg.closing_balance !== null ? formatCurrency(reg.closing_balance) : '-'}
                    </td>
                    <td className={`p-4 text-right tabular-nums font-medium ${
                      reg.difference === null ? '' : 
                      reg.difference === 0 ? 'text-emerald-600' : 
                      reg.difference > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {reg.difference !== null ? formatCurrency(reg.difference) : '-'}
                    </td>
                    <td className="p-4 text-center">{getStatusBadge(reg.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ModernCard>

      <OpenRegisterModal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        onConfirm={() => setShowOpenModal(false)}
      />
      
      {register && (
        <CloseRegisterModal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          onConfirm={() => setShowCloseModal(false)}
          register={register}
        />
      )}
    </div>
  );
}

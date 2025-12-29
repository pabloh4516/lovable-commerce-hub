import { useState } from 'react';
import { Receipt, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCashRegister } from '@/hooks/useCashRegister';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OpenRegisterModal } from './OpenRegisterModal';
import { CloseRegisterModal } from './CloseRegisterModal';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
      ? <Badge className="bg-green-100 text-green-800">Aberto</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Fechado</Badge>;
  };

  const todayRegisters = registers.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.opened_at.startsWith(today);
  });

  const totalSalesToday = todayRegisters.reduce((sum, r) => sum + (r.total_sales || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-7 w-7" />
            Gestão de Caixa
          </h1>
          <p className="text-muted-foreground">Controle de abertura e fechamento de caixa</p>
        </div>
        {isOpen ? (
          <Button variant="destructive" onClick={() => setShowCloseModal(true)}>
            Fechar Caixa
          </Button>
        ) : (
          <Button onClick={() => setShowOpenModal(true)}>
            Abrir Caixa
          </Button>
        )}
      </div>

      {/* Status atual do caixa */}
      {isOpen && register && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
              <DollarSign className="h-5 w-5" />
              Caixa Atual - #{register.number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Abertura</p>
                <p className="font-medium">{format(new Date(register.openedAt), "dd/MM HH:mm", { locale: ptBR })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                <p className="font-medium">{formatCurrency(register.openingBalance)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Vendas</p>
                <p className="font-medium text-green-600">{formatCurrency(register.totalSales)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dinheiro</p>
                <p className="font-medium">{formatCurrency(register.totalCash)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cartão</p>
                <p className="font-medium">{formatCurrency(register.totalCredit + register.totalDebit)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PIX</p>
                <p className="font-medium">{formatCurrency(register.totalPix)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isOpen ? (
                <span className="text-green-600">Aberto</span>
              ) : (
                <span className="text-muted-foreground">Fechado</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vendas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSalesToday)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Caixas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayRegisters.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Histórico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Caixas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Fechamento</TableHead>
                <TableHead className="text-right">Saldo Inicial</TableHead>
                <TableHead className="text-right">Total Vendas</TableHead>
                <TableHead className="text-right">Saldo Final</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum caixa registrado
                  </TableCell>
                </TableRow>
              ) : (
                registers.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-mono font-medium">#{reg.number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(reg.opened_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {reg.closed_at 
                        ? format(new Date(reg.closed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(reg.opening_balance)}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">
                      {formatCurrency(reg.total_sales)}
                    </TableCell>
                    <TableCell className="text-right">
                      {reg.closing_balance !== null ? formatCurrency(reg.closing_balance) : '-'}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      reg.difference === null ? '' : 
                      reg.difference === 0 ? 'text-green-600' : 
                      reg.difference > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {reg.difference !== null ? formatCurrency(reg.difference) : '-'}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(reg.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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

import { useState } from 'react';
import { Clock, Search, Phone, Mail, Eye, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCustomers } from '@/hooks/useCustomers';
import { formatCurrency } from '@/lib/utils';

export function OverdueCustomersPage() {
  const { customers, isLoading } = useCustomers();
  const [search, setSearch] = useState('');

  // Filter customers with debt
  const overdueCustomers = customers?.filter(c => 
    c.current_debt > 0 && 
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
     c.cpf?.includes(search) ||
     c.phone?.includes(search))
  ) || [];

  const totalDebt = overdueCustomers.reduce((sum, c) => sum + c.current_debt, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-7 w-7 text-red-600" />
            Clientes em Atraso
          </h1>
          <p className="text-muted-foreground">Clientes com débitos pendentes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes em Débito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCustomers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total a Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média por Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overdueCustomers.length > 0 ? totalDebt / overdueCustomers.length : 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="text-right">Limite</TableHead>
                <TableHead className="text-right">Débito</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : overdueCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {search.length > 0 ? 'Nenhum cliente encontrado' : 'Nenhum cliente em atraso'}
                  </TableCell>
                </TableRow>
              ) : (
                overdueCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="font-mono">{customer.cpf || customer.cnpj || '-'}</TableCell>
                    <TableCell>
                      {customer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {customer.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(customer.credit_limit)}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatCurrency(customer.current_debt)}
                    </TableCell>
                    <TableCell className="text-center">
                      {customer.is_blocked ? (
                        <Badge variant="destructive">Bloqueado</Badge>
                      ) : customer.current_debt > customer.credit_limit ? (
                        <Badge className="bg-red-100 text-red-800">Limite Excedido</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Em Débito</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-green-600">
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

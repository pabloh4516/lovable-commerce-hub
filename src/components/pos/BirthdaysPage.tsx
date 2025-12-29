import { useState, useMemo } from 'react';
import { Cake, Search, Phone, Mail, Gift, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomers } from '@/hooks/useCustomers';
import { format, parseISO, isToday, isSameMonth, getMonth, getDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function BirthdaysPage() {
  const { customers, isLoading } = useCustomers();
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>((new Date().getMonth() + 1).toString());

  const birthdayCustomers = useMemo(() => {
    const currentMonth = parseInt(monthFilter);
    
    return customers?.filter(c => {
      if (!c.birth_date) return false;
      const birthDate = parseISO(c.birth_date);
      const birthMonth = getMonth(birthDate) + 1;
      const matchesMonth = currentMonth === 0 || birthMonth === currentMonth;
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search);
      return matchesMonth && matchesSearch;
    }).sort((a, b) => {
      const dayA = getDate(parseISO(a.birth_date!));
      const dayB = getDate(parseISO(b.birth_date!));
      return dayA - dayB;
    }) || [];
  }, [customers, monthFilter, search]);

  const todayBirthdays = customers?.filter(c => {
    if (!c.birth_date) return false;
    const birthDate = parseISO(c.birth_date);
    const today = new Date();
    return getDate(birthDate) === getDate(today) && getMonth(birthDate) === getMonth(today);
  }) || [];

  const thisMonthBirthdays = customers?.filter(c => {
    if (!c.birth_date) return false;
    const birthDate = parseISO(c.birth_date);
    return isSameMonth(birthDate, new Date());
  }) || [];

  const months = [
    { value: '0', label: 'Todos os meses' },
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const isBirthdayToday = (birthDate: string) => {
    const date = parseISO(birthDate);
    const today = new Date();
    return getDate(date) === getDate(today) && getMonth(date) === getMonth(today);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cake className="h-7 w-7 text-pink-600" />
            Aniversariantes
          </h1>
          <p className="text-muted-foreground">Clientes que fazem aniversário</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-pink-200 bg-pink-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-pink-800 flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Aniversariantes Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{todayBirthdays.length}</div>
            {todayBirthdays.length > 0 && (
              <div className="mt-2 text-sm text-pink-700">
                {todayBirthdays.slice(0, 3).map(c => c.name).join(', ')}
                {todayBirthdays.length > 3 && ` +${todayBirthdays.length - 3}`}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aniversariantes do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthBirthdays.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total com Data de Nascimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers?.filter(c => c.birth_date).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Data de Nascimento</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : birthdayCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum aniversariante encontrado
                  </TableCell>
                </TableRow>
              ) : (
                birthdayCustomers.map((customer) => (
                  <TableRow key={customer.id} className={isBirthdayToday(customer.birth_date!) ? 'bg-pink-50' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {customer.name}
                        {isBirthdayToday(customer.birth_date!) && (
                          <Cake className="h-4 w-4 text-pink-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(parseISO(customer.birth_date!), "dd 'de' MMMM", { locale: ptBR })}
                      </div>
                    </TableCell>
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
                    <TableCell className="text-center">
                      {isBirthdayToday(customer.birth_date!) ? (
                        <Badge className="bg-pink-100 text-pink-800">
                          <Gift className="h-3 w-3 mr-1" />
                          Hoje!
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {format(parseISO(customer.birth_date!), "dd/MM", { locale: ptBR })}
                        </Badge>
                      )}
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

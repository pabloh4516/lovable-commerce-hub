import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageHeader } from '@/components/pos/common';
import { useStoreSettings, useStoreSettingsMutations } from '@/hooks/useStoreSettings';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { 
  Settings, 
  Store, 
  Save, 
  Loader2, 
  Receipt, 
  Settings2, 
  Bell,
  Printer,
  CreditCard,
  Users,
  UserCircle,
  Building2,
  Tag,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

export function SettingsUnifiedPage() {
  const { data: settings, isLoading } = useStoreSettings();
  const { updateSettings } = useStoreSettingsMutations();
  const { isAdmin } = useAuth();
  const { data: users } = useUsers();
  const { paymentMethods } = usePaymentMethods();
  
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
  });

  const [receiptSettings, setReceiptSettings] = useState({
    showLogo: true,
    showAddress: true,
    showPhone: true,
    footerMessage: 'Obrigado pela preferência!',
    printAutomatically: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    lowStockAlert: 10,
    autoLogoutMinutes: 30,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || '',
        cnpj: settings.cnpj || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      default: return 'Operador';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Configurações"
          subtitle="Gerencie todas as configurações do sistema"
          icon={Settings}
        />
      </div>

      <Tabs defaultValue="empresa" className="flex-1 flex flex-col overflow-hidden p-6 pt-4">
        <TabsList className="w-full justify-start gap-1 h-auto flex-wrap bg-transparent p-0 mb-4">
          <TabsTrigger value="empresa" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building2 className="w-4 h-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="w-4 h-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="recibos" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Receipt className="w-4 h-4" />
            Recibos
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings2 className="w-4 h-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Empresa */}
          <TabsContent value="empresa" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Dados da Empresa</CardTitle>
                    <CardDescription>Informações que aparecem nos comprovantes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="name">Nome da Empresa</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Minha Loja"
                        disabled={!isAdmin}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                        placeholder="00.000.000/0001-00"
                        disabled={!isAdmin}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        disabled={!isAdmin}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Rua das Flores, 123 - Centro"
                        disabled={!isAdmin}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contato@loja.com"
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>

                  {isAdmin && (
                    <Button type="submit" disabled={updateSettings.isPending} className="gap-2">
                      {updateSettings.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  )}

                  {!isAdmin && (
                    <p className="text-sm text-muted-foreground">
                      Apenas administradores podem editar as configurações.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="usuarios" className="mt-0 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Usuários do Sistema</CardTitle>
                    <CardDescription>Gerencie os usuários e permissões</CardDescription>
                  </div>
                </div>
                {isAdmin && (
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Usuário
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="font-mono text-sm">{user.code}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Operador</Badge>
                        </TableCell>
                        <TableCell>
                          {user.is_active ? (
                            <Badge className="bg-success/10 text-success border-success/20">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!users || users.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhum usuário cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pagamentos */}
          <TabsContent value="pagamentos" className="mt-0 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Formas de Pagamento</CardTitle>
                    <CardDescription>Configure as formas de pagamento aceitas</CardDescription>
                  </div>
                </div>
                {isAdmin && (
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Forma
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Taxa</TableHead>
                      <TableHead>Parcelas</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods?.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell className="font-mono text-sm uppercase">{method.code}</TableCell>
                        <TableCell>
                          {method.fee_percent ? `${method.fee_percent}%` : '-'}
                        </TableCell>
                        <TableCell>{method.installments_max || 1}x</TableCell>
                        <TableCell>
                          {method.is_active ? (
                            <Badge className="bg-success/10 text-success border-success/20">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!paymentMethods || paymentMethods.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhuma forma de pagamento cadastrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recibos */}
          <TabsContent value="recibos" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Configurações de Recibo</CardTitle>
                    <CardDescription>Personalize os comprovantes de venda</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Informações no Recibo</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Exibir Logo</Label>
                      <p className="text-sm text-muted-foreground">Mostrar logotipo da loja no topo</p>
                    </div>
                    <Switch
                      checked={receiptSettings.showLogo}
                      onCheckedChange={(checked) => 
                        setReceiptSettings({ ...receiptSettings, showLogo: checked })
                      }
                      disabled={!isAdmin}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Exibir Endereço</Label>
                      <p className="text-sm text-muted-foreground">Mostrar endereço completo</p>
                    </div>
                    <Switch
                      checked={receiptSettings.showAddress}
                      onCheckedChange={(checked) => 
                        setReceiptSettings({ ...receiptSettings, showAddress: checked })
                      }
                      disabled={!isAdmin}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Exibir Telefone</Label>
                      <p className="text-sm text-muted-foreground">Mostrar número de contato</p>
                    </div>
                    <Switch
                      checked={receiptSettings.showPhone}
                      onCheckedChange={(checked) => 
                        setReceiptSettings({ ...receiptSettings, showPhone: checked })
                      }
                      disabled={!isAdmin}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Impressão
                  </h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Imprimir Automaticamente</Label>
                      <p className="text-sm text-muted-foreground">Imprimir recibo após cada venda</p>
                    </div>
                    <Switch
                      checked={receiptSettings.printAutomatically}
                      onCheckedChange={(checked) => 
                        setReceiptSettings({ ...receiptSettings, printAutomatically: checked })
                      }
                      disabled={!isAdmin}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="footer">Mensagem de Rodapé</Label>
                  <Input
                    id="footer"
                    value={receiptSettings.footerMessage}
                    onChange={(e) => 
                      setReceiptSettings({ ...receiptSettings, footerMessage: e.target.value })
                    }
                    placeholder="Obrigado pela preferência!"
                    disabled={!isAdmin}
                  />
                </div>

                {isAdmin && (
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Configurações
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sistema */}
          <TabsContent value="sistema" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Configurações do Sistema</CardTitle>
                    <CardDescription>Ajuste o comportamento do PDV</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Interface</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sons do Sistema</Label>
                      <p className="text-sm text-muted-foreground">Sons ao adicionar itens e finalizar vendas</p>
                    </div>
                    <Switch
                      checked={systemSettings.soundEnabled}
                      onCheckedChange={(checked) => 
                        setSystemSettings({ ...systemSettings, soundEnabled: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notificações
                  </h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertas de Sistema</Label>
                      <p className="text-sm text-muted-foreground">Notificações de estoque baixo e outros alertas</p>
                    </div>
                    <Switch
                      checked={systemSettings.notificationsEnabled}
                      onCheckedChange={(checked) => 
                        setSystemSettings({ ...systemSettings, notificationsEnabled: checked })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lowStock">Alerta de Estoque Baixo</Label>
                      <Input
                        id="lowStock"
                        type="number"
                        value={systemSettings.lowStockAlert}
                        onChange={(e) => 
                          setSystemSettings({ ...systemSettings, lowStockAlert: parseInt(e.target.value) || 0 })
                        }
                        min={0}
                      />
                      <p className="text-xs text-muted-foreground">Quantidade mínima para alertar</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="autoLogout">Logout Automático (min)</Label>
                      <Input
                        id="autoLogout"
                        type="number"
                        value={systemSettings.autoLogoutMinutes}
                        onChange={(e) => 
                          setSystemSettings({ ...systemSettings, autoLogoutMinutes: parseInt(e.target.value) || 0 })
                        }
                        min={0}
                      />
                      <p className="text-xs text-muted-foreground">0 = desativado</p>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Configurações
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

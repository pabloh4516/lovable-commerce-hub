import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useStoreSettings, useStoreSettingsMutations } from '@/hooks/useStoreSettings';
import { useAuth } from '@/hooks/useAuth';
import { 
  Store, 
  Save, 
  Loader2, 
  Receipt, 
  Settings2, 
  Palette, 
  Bell,
  Printer,
  CreditCard
} from 'lucide-react';

export function SettingsPage() {
  const { data: settings, isLoading } = useStoreSettings();
  const { updateSettings } = useStoreSettingsMutations();
  const { isAdmin } = useAuth();
  
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

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua loja e sistema
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="store" className="gap-2">
            <Store className="w-4 h-4" />
            Loja
          </TabsTrigger>
          <TabsTrigger value="receipt" className="gap-2">
            <Receipt className="w-4 h-4" />
            Recibos
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6 max-w-3xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Dados da Loja</CardTitle>
                  <CardDescription>Informações que aparecem nos comprovantes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name">Nome da Loja</Label>
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

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Rua das Flores, 123 - Centro"
                      disabled={!isAdmin}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
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

        {/* Receipt Settings */}
        <TabsContent value="receipt" className="space-y-6 max-w-3xl">
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

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6 max-w-3xl">
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
                <h3 className="font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Interface
                </h3>

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

                <div className="grid grid-cols-2 gap-4">
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

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6 max-w-3xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Formas de Pagamento</CardTitle>
                  <CardDescription>Configure as formas de pagamento aceitas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      💵
                    </div>
                    <div>
                      <Label className="text-base">Dinheiro</Label>
                      <p className="text-sm text-muted-foreground">Pagamento em espécie</p>
                    </div>
                  </div>
                  <Switch checked disabled />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#32BCAD]/10 flex items-center justify-center">
                      📱
                    </div>
                    <div>
                      <Label className="text-base">PIX</Label>
                      <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                    </div>
                  </div>
                  <Switch checked disabled={!isAdmin} />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      💳
                    </div>
                    <div>
                      <Label className="text-base">Cartão de Crédito</Label>
                      <p className="text-sm text-muted-foreground">Parcelado ou à vista</p>
                    </div>
                  </div>
                  <Switch checked disabled={!isAdmin} />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      💳
                    </div>
                    <div>
                      <Label className="text-base">Cartão de Débito</Label>
                      <p className="text-sm text-muted-foreground">Débito à vista</p>
                    </div>
                  </div>
                  <Switch checked disabled={!isAdmin} />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      📝
                    </div>
                    <div>
                      <Label className="text-base">Fiado</Label>
                      <p className="text-sm text-muted-foreground">Venda a prazo para clientes</p>
                    </div>
                  </div>
                  <Switch checked disabled={!isAdmin} />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Todas as formas de pagamento estão ativas. A configuração de taxas e integrações 
                com operadoras será adicionada em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

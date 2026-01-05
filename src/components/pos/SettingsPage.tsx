import { useState, useEffect } from 'react';
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
  CreditCard,
  Settings
} from 'lucide-react';
import { ModernPageHeader, ModernCard } from './common';

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-auto">
      <ModernPageHeader
        title="Configurações"
        subtitle="Gerencie as configurações da sua loja e sistema"
        icon={Settings}
      />

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
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
          <ModernCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Dados da Loja</h3>
                <p className="text-sm text-muted-foreground">Informações que aparecem nos comprovantes</p>
              </div>
            </div>
            
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
          </ModernCard>
        </TabsContent>

        {/* Receipt Settings */}
        <TabsContent value="receipt" className="space-y-6 max-w-3xl">
          <ModernCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Configurações de Recibo</h3>
                <p className="text-sm text-muted-foreground">Personalize os comprovantes de venda</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Informações no Recibo</h4>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
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

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
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

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
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
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Impressão
                </h4>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
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
            </div>
          </ModernCard>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6 max-w-3xl">
          <ModernCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Configurações do Sistema</h3>
                <p className="text-sm text-muted-foreground">Ajuste o comportamento do PDV</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Interface
                </h4>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
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
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notificações
                </h4>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
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
            </div>
          </ModernCard>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6 max-w-3xl">
          <ModernCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Formas de Pagamento</h3>
                <p className="text-sm text-muted-foreground">Configure as formas de pagamento aceitas</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    💵
                  </div>
                  <div>
                    <Label className="text-base">Dinheiro</Label>
                    <p className="text-sm text-muted-foreground">Pagamento em espécie</p>
                  </div>
                </div>
                <Switch checked disabled />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    📱
                  </div>
                  <div>
                    <Label className="text-base">PIX</Label>
                    <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                  </div>
                </div>
                <Switch checked disabled={!isAdmin} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    💳
                  </div>
                  <div>
                    <Label className="text-base">Cartão de Crédito</Label>
                    <p className="text-sm text-muted-foreground">Até 12x sem juros</p>
                  </div>
                </div>
                <Switch checked disabled={!isAdmin} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    💳
                  </div>
                  <div>
                    <Label className="text-base">Cartão de Débito</Label>
                    <p className="text-sm text-muted-foreground">Aprovação imediata</p>
                  </div>
                </div>
                <Switch checked disabled={!isAdmin} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    📝
                  </div>
                  <div>
                    <Label className="text-base">Fiado</Label>
                    <p className="text-sm text-muted-foreground">Requer cliente cadastrado</p>
                  </div>
                </div>
                <Switch checked={false} disabled={!isAdmin} />
              </div>
            </div>
          </ModernCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

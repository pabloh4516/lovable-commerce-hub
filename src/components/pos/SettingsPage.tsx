import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStoreSettings, useStoreSettingsMutations } from '@/hooks/useStoreSettings';
import { useAuth } from '@/hooks/useAuth';
import { Store, Save, Loader2 } from 'lucide-react';

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
    <div className="p-6 space-y-6 overflow-auto h-full max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua loja
        </p>
      </div>

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
            <div className="space-y-2">
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
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua das Flores, 123 - Centro"
                disabled={!isAdmin}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
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
    </div>
  );
}

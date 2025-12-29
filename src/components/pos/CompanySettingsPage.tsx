import { useState } from 'react';
import { Building2, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStoreSettings, useStoreSettingsMutations } from '@/hooks/useStoreSettings';

export function CompanySettingsPage() {
  const { data: settings, isLoading } = useStoreSettings();
  const { updateSettings } = useStoreSettingsMutations();
  const [formData, setFormData] = useState({
    name: settings?.name || '',
    cnpj: settings?.cnpj || '',
    phone: settings?.phone || '',
    email: settings?.email || '',
    address: settings?.address || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    updateSettings.mutate(formData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-7 w-7" />
            Dados da Empresa
          </h1>
          <p className="text-muted-foreground">Configure as informações da sua empresa</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading || updateSettings.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
          <CardDescription>Dados básicos da empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Razão Social / Nome</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome da Empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ/CPF</Label>
              <Input
                id="cnpj"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contato@empresa.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Endereço completo"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Label className="mb-2 block">Logotipo da Empresa</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Enviar Logo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

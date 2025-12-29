import { useState } from 'react';
import { Plus, Search, FileSpreadsheet, Eye, Printer, ShoppingCart, Trash2, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useQuotes } from '@/hooks/useQuotes';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QuoteItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

export function QuotesPage() {
  const { quotes, createQuote, updateQuote, deleteQuote, convertToSale, isLoading } = useQuotes();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    valid_until: '',
    notes: '',
    discount: 0,
    discount_type: 'value' as 'value' | 'percent',
  });
  
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.number?.toString().includes(search) ||
      quote.customer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendente', variant: 'secondary' },
      approved: { label: 'Aprovado', variant: 'default' },
      rejected: { label: 'Rejeitado', variant: 'destructive' },
      converted: { label: 'Convertido', variant: 'outline' },
      expired: { label: 'Expirado', variant: 'destructive' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleAddItem = () => {
    if (!selectedProductId) return;
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    const existingItem = quoteItems.find(item => item.product_id === selectedProductId);
    if (existingItem) {
      setQuoteItems(items => 
        items.map(item => 
          item.product_id === selectedProductId 
            ? { ...item, quantity: item.quantity + itemQuantity, subtotal: (item.quantity + itemQuantity) * item.unit_price }
            : item
        )
      );
    } else {
      setQuoteItems([...quoteItems, {
        product_id: product.id,
        product_name: product.name,
        quantity: itemQuantity,
        unit_price: product.price,
        discount: 0,
        subtotal: itemQuantity * product.price,
      }]);
    }
    
    setSelectedProductId('');
    setItemQuantity(1);
  };

  const handleRemoveItem = (productId: string) => {
    setQuoteItems(items => items.filter(item => item.product_id !== productId));
  };

  const calculateTotal = () => {
    const subtotal = quoteItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = formData.discount_type === 'percent' 
      ? (subtotal * formData.discount) / 100 
      : formData.discount;
    return subtotal - discount;
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }
    
    if (quoteItems.length === 0) {
      toast.error('Adicione pelo menos um item ao orçamento');
      return;
    }
    
    try {
      const subtotal = quoteItems.reduce((sum, item) => sum + item.subtotal, 0);
      const discount = formData.discount_type === 'percent' 
        ? (subtotal * formData.discount) / 100 
        : formData.discount;
      
      await createQuote({
        seller_id: user.id,
        customer_id: formData.customer_id || null,
        valid_until: formData.valid_until || null,
        notes: formData.notes || null,
        discount: formData.discount,
        discount_type: formData.discount_type,
        subtotal,
        total: subtotal - discount,
        status: 'pending',
      }, quoteItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        subtotal: item.subtotal,
      })));
      
      toast.success('Orçamento criado com sucesso!');
      handleCloseModal();
    } catch (error) {
      toast.error('Erro ao criar orçamento');
    }
  };

  const handleConvertToSale = async (quote: any) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }
    
    try {
      await convertToSale(quote.id);
      toast.success('Orçamento convertido em venda!');
    } catch (error) {
      toast.error('Erro ao converter orçamento');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await deleteQuote(id);
        toast.success('Orçamento excluído!');
      } catch (error) {
        toast.error('Erro ao excluir orçamento');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      customer_id: '',
      valid_until: '',
      notes: '',
      discount: 0,
      discount_type: 'value',
    });
    setQuoteItems([]);
    setSelectedProductId('');
    setItemQuantity(1);
  };

  const handleViewQuote = (quote: any) => {
    setSelectedQuote(quote);
    setIsViewModalOpen(true);
  };

  const handlePrint = (quote: any) => {
    const printContent = `
      <html>
        <head>
          <title>Orçamento #${quote.number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; text-align: right; font-size: 18px; }
            .header { margin-bottom: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Orçamento #${quote.number}</h1>
          <div class="header">
            <p><strong>Cliente:</strong> ${quote.customer?.name || 'Não informado'}</p>
            <p><strong>Data:</strong> ${format(new Date(quote.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            <p><strong>Válido até:</strong> ${quote.valid_until ? format(new Date(quote.valid_until), 'dd/MM/yyyy', { locale: ptBR }) : 'Não definido'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Preço Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items?.map((item: any) => `
                <tr>
                  <td>${item.product?.name || 'Produto'}</td>
                  <td>${item.quantity}</td>
                  <td>R$ ${item.unit_price.toFixed(2)}</td>
                  <td>R$ ${item.subtotal.toFixed(2)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          <p class="total">Total: R$ ${quote.total?.toFixed(2) || '0.00'}</p>
          ${quote.notes ? `<p><strong>Observações:</strong> ${quote.notes}</p>` : ''}
          <div class="footer">
            <p>Este orçamento é válido conforme as condições descritas.</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie orçamentos e propostas comerciais</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
            <SelectItem value="converted">Convertido</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{quotes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{quotes.filter(q => q.status === 'pending').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{quotes.filter(q => q.status === 'approved').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Convertidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{quotes.filter(q => q.status === 'converted').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">#{quote.number}</TableCell>
                  <TableCell>{quote.customer?.name || 'Sem cliente'}</TableCell>
                  <TableCell>{format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>
                    {quote.valid_until 
                      ? format(new Date(quote.valid_until), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell>R$ {quote.total?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{getStatusBadge(quote.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleViewQuote(quote)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handlePrint(quote)}>
                        <Printer className="w-4 h-4" />
                      </Button>
                      {quote.status === 'pending' || quote.status === 'approved' ? (
                        <Button variant="ghost" size="icon" onClick={() => handleConvertToSale(quote)}>
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      ) : null}
                      {quote.status !== 'converted' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(quote.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredQuotes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum orçamento encontrado</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Quote Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={formData.customer_id} onValueChange={(v) => setFormData({...formData, customer_id: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Válido até</Label>
              <Input 
                type="date" 
                value={formData.valid_until} 
                onChange={(e) => setFormData({...formData, valid_until: e.target.value})} 
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Itens do Orçamento</h3>
            
            <div className="flex gap-2">
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.filter(p => p.is_active).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - R$ {product.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                type="number" 
                min={1} 
                value={itemQuantity} 
                onChange={(e) => setItemQuantity(Number(e.target.value))} 
                className="w-24"
                placeholder="Qtd"
              />
              <Button onClick={handleAddItem} disabled={!selectedProductId}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="w-24">Qtd</TableHead>
                  <TableHead className="w-32">Preço Unit.</TableHead>
                  <TableHead className="w-32">Subtotal</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quoteItems.map((item) => (
                  <TableRow key={item.product_id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>R$ {item.unit_price.toFixed(2)}</TableCell>
                    <TableCell>R$ {item.subtotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.product_id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {quoteItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                      Adicione produtos ao orçamento
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Desconto</Label>
              <Select 
                value={formData.discount_type} 
                onValueChange={(v: 'value' | 'percent') => setFormData({...formData, discount_type: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="value">Valor (R$)</SelectItem>
                  <SelectItem value="percent">Percentual (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Desconto</Label>
              <Input 
                type="number" 
                min={0} 
                value={formData.discount} 
                onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <div className="h-10 px-3 py-2 bg-muted rounded-md font-bold text-lg">
                R$ {calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Observações do orçamento..."
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              Criar Orçamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Quote Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Orçamento #{selectedQuote?.number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{selectedQuote.customer?.name || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">
                    {format(new Date(selectedQuote.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedQuote.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product?.name || 'Produto'}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">R$ {item.unit_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">R$ {item.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  {getStatusBadge(selectedQuote.status)}
                </div>
                <div className="text-right">
                  {selectedQuote.discount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Desconto: R$ {selectedQuote.discount.toFixed(2)}
                    </p>
                  )}
                  <p className="text-xl font-bold">Total: R$ {selectedQuote.total?.toFixed(2)}</p>
                </div>
              </div>

              {selectedQuote.notes && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">{selectedQuote.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
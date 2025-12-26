import { useState, useEffect } from 'react';
import { X, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Customer } from '@/types/pos';
import { customers as mockCustomers } from '@/data/mockData';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer | null, cpf?: string) => void;
  currentCustomer?: Customer | null;
}

export function CustomerModal({ isOpen, onClose, onSelect, currentCustomer }: CustomerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cpfOnly, setCpfOnly] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(mockCustomers);

  useEffect(() => {
    if (searchQuery) {
      const filtered = mockCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.cpf?.includes(searchQuery) ||
          c.phone?.includes(searchQuery)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(mockCustomers);
    }
  }, [searchQuery]);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleCpfChange = (value: string) => {
    const formatted = formatCPF(value);
    if (formatted.length <= 14) {
      setCpfOnly(formatted);
    }
  };

  const handleCpfOnly = () => {
    if (cpfOnly.length === 14) {
      onSelect(null, cpfOnly);
      setCpfOnly('');
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    onSelect(customer);
  };

  const handleRemoveCustomer = () => {
    onSelect(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Identificar Cliente
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {currentCustomer && (
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{currentCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">{currentCustomer.cpf}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRemoveCustomer}>
                  Remover
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">CPF na Nota (sem cadastro)</label>
            <div className="flex gap-2">
              <Input
                value={cpfOnly}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                className="bg-secondary font-mono text-lg"
              />
              <Button onClick={handleCpfOnly} disabled={cpfOnly.length !== 14}>
                Usar
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <label className="text-sm font-medium">Ou buscar cliente cadastrado</label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, CPF ou telefone..."
                className="pl-10 bg-secondary"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-muted transition-colors text-left"
              >
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.cpf} • {customer.phone}
                  </p>
                </div>
                {customer.currentDebt > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Débito</p>
                    <p className="text-sm font-medium text-warning">
                      R$ {customer.currentDebt.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

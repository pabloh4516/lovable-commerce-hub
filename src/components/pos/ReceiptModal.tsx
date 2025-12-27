import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Receipt } from './Receipt';
import { CartItem, Payment, Customer } from '@/types/pos';
import { Printer, X, Check } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: {
    saleNumber: number;
    items: CartItem[];
    payments: Payment[];
    subtotal: number;
    discount: number;
    discountType: 'percent' | 'value';
    total: number;
    customer?: Customer | null;
    customerCpf?: string;
    operatorName: string;
    storeName: string;
    storeAddress?: string;
    storeCnpj?: string;
    storePhone?: string;
    createdAt: Date;
  } | null;
}

export function ReceiptModal({ isOpen, onClose, saleData }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!receiptRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir o cupom.');
      return;
    }

    const receiptContent = receiptRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cupom - Venda #${saleData?.saleNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              line-height: 1.4;
              background: white;
              color: black;
              padding: 10px;
            }
            .receipt-content {
              width: 280px;
              margin: 0 auto;
            }
            .text-center { text-align: center; }
            .text-lg { font-size: 16px; }
            .font-bold { font-weight: bold; }
            .text-base { font-size: 14px; }
            .text-\\[10px\\] { font-size: 10px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .flex-1 { flex: 1; }
            .truncate { 
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .border-b { border-bottom: 1px dashed #000; }
            .border-t { border-top: 1px dashed #000; }
            .border-dashed { border-style: dashed; }
            .border-black { border-color: #000; }
            .pb-3 { padding-bottom: 12px; }
            .mb-3 { margin-bottom: 12px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-1 { margin-bottom: 4px; }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
            .mt-4 { margin-top: 16px; }
            .pt-2 { padding-top: 8px; }
            .pl-4 { padding-left: 16px; }
            .p-4 { padding: 16px; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            @media print {
              body { padding: 0; }
              .receipt-content { width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-content">
            ${receiptContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!saleData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            Venda Finalizada!
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-muted rounded-lg p-2">
          <Receipt
            ref={receiptRef}
            saleNumber={saleData.saleNumber}
            items={saleData.items}
            payments={saleData.payments}
            subtotal={saleData.subtotal}
            discount={saleData.discount}
            discountType={saleData.discountType}
            total={saleData.total}
            customer={saleData.customer}
            customerCpf={saleData.customerCpf}
            operatorName={saleData.operatorName}
            storeName={saleData.storeName}
            storeAddress={saleData.storeAddress}
            storeCnpj={saleData.storeCnpj}
            storePhone={saleData.storePhone}
            createdAt={saleData.createdAt}
          />
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

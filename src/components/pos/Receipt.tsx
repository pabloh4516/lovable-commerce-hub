import { forwardRef } from 'react';
import { CartItem, Payment, Customer } from '@/types/pos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReceiptProps {
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
}

const paymentMethodNames: Record<string, string> = {
  cash: 'Dinheiro',
  pix: 'PIX',
  credit: 'Crédito',
  debit: 'Débito',
  fiado: 'Fiado',
};

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({
  saleNumber,
  items,
  payments,
  subtotal,
  discount,
  discountType,
  total,
  customer,
  customerCpf,
  operatorName,
  storeName,
  storeAddress,
  storeCnpj,
  storePhone,
  createdAt,
}, ref) => {
  const discountValue = discountType === 'percent' ? (subtotal * discount / 100) : discount;
  const cashPayment = payments.find(p => p.method === 'cash');
  const change = cashPayment ? cashPayment.amount - total : 0;

  return (
    <div ref={ref} className="receipt-content bg-white text-black p-4 font-mono text-xs w-[300px] mx-auto">
      {/* Header */}
      <div className="text-center border-b border-dashed border-black pb-3 mb-3">
        <h1 className="text-lg font-bold">{storeName}</h1>
        {storeAddress && <p className="text-[10px]">{storeAddress}</p>}
        {storeCnpj && <p className="text-[10px]">CNPJ: {storeCnpj}</p>}
        {storePhone && <p className="text-[10px]">Tel: {storePhone}</p>}
      </div>

      {/* Sale Info */}
      <div className="border-b border-dashed border-black pb-3 mb-3">
        <div className="flex justify-between">
          <span>CUPOM NÃO FISCAL</span>
        </div>
        <div className="flex justify-between">
          <span>Venda Nº:</span>
          <span className="font-bold">{String(saleNumber).padStart(6, '0')}</span>
        </div>
        <div className="flex justify-between">
          <span>Data:</span>
          <span>{format(createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
        </div>
        <div className="flex justify-between">
          <span>Operador:</span>
          <span>{operatorName}</span>
        </div>
        {(customer || customerCpf) && (
          <div className="flex justify-between mt-1">
            <span>Cliente:</span>
            <span>{customer?.name || 'CPF: ' + customerCpf}</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="border-b border-dashed border-black pb-3 mb-3">
        <div className="font-bold mb-2">ITENS</div>
        {items.map((item, index) => (
          <div key={item.id} className="mb-2">
            <div className="flex justify-between">
              <span className="flex-1 truncate">
                {String(index + 1).padStart(3, '0')} {item.product.code} - {item.product.name}
              </span>
            </div>
            <div className="flex justify-between pl-4">
              <span>
                {item.weight 
                  ? `${item.weight.toFixed(3)}kg x R$ ${item.product.price.toFixed(2)}`
                  : `${item.quantity} x R$ ${item.product.price.toFixed(2)}`
                }
              </span>
              <span className="font-bold">R$ {item.subtotal.toFixed(2)}</span>
            </div>
            {item.discount > 0 && (
              <div className="flex justify-between pl-4 text-[10px]">
                <span>Desconto:</span>
                <span>
                  -{item.discountType === 'percent' 
                    ? `${item.discount}%` 
                    : `R$ ${item.discount.toFixed(2)}`
                  }
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-b border-dashed border-black pb-3 mb-3">
        <div className="flex justify-between">
          <span>Subtotal ({items.length} itens):</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>
        {discountValue > 0 && (
          <div className="flex justify-between">
            <span>Desconto:</span>
            <span>- R$ {discountValue.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold mt-2">
          <span>TOTAL:</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payments */}
      <div className="border-b border-dashed border-black pb-3 mb-3">
        <div className="font-bold mb-1">PAGAMENTO</div>
        {payments.map((payment, index) => (
          <div key={index} className="flex justify-between">
            <span>{paymentMethodNames[payment.method]}:</span>
            <span>R$ {payment.amount.toFixed(2)}</span>
          </div>
        ))}
        {change > 0 && (
          <div className="flex justify-between font-bold mt-1">
            <span>TROCO:</span>
            <span>R$ {change.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] pt-2">
        <p>Obrigado pela preferência!</p>
        <p className="mt-2">Volte sempre!</p>
        <div className="mt-4 border-t border-dashed border-black pt-2">
          <p>Documento sem valor fiscal</p>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

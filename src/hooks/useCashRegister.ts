import { useState, useCallback, useEffect } from 'react';
import { CashRegister, CashMovement, Sale } from '@/types/pos';

const STORAGE_KEY = 'pos_cash_register';

export function useCashRegister() {
  const [register, setRegister] = useState<CashRegister | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        openedAt: new Date(parsed.openedAt),
        closedAt: parsed.closedAt ? new Date(parsed.closedAt) : undefined,
      };
    }
    return null;
  });

  useEffect(() => {
    if (register) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(register));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [register]);

  const openRegister = useCallback((openingBalance: number, operatorId: string, operatorName: string) => {
    const newRegister: CashRegister = {
      id: Date.now().toString(),
      number: Math.floor(Math.random() * 9000) + 1000,
      openedAt: new Date(),
      openingBalance,
      sales: [],
      withdrawals: [],
      deposits: [],
      operatorId,
      operatorName,
      status: 'open',
      totalSales: 0,
      totalCash: openingBalance,
      totalPix: 0,
      totalCredit: 0,
      totalDebit: 0,
      totalFiado: 0,
    };
    setRegister(newRegister);
    return newRegister;
  }, []);

  const closeRegister = useCallback((closingBalance: number) => {
    if (!register) return null;

    const expectedBalance = register.openingBalance + 
      register.totalCash - 
      register.withdrawals.reduce((sum, w) => sum + w.amount, 0) +
      register.deposits.reduce((sum, d) => sum + d.amount, 0);

    const closedRegister: CashRegister = {
      ...register,
      closedAt: new Date(),
      closingBalance,
      expectedBalance,
      difference: closingBalance - expectedBalance,
      status: 'closed',
    };

    setRegister(null);
    return closedRegister;
  }, [register]);

  const addSale = useCallback((sale: Sale) => {
    if (!register) return;

    const cashPayment = sale.payments.find(p => p.method === 'cash')?.amount || 0;
    const pixPayment = sale.payments.find(p => p.method === 'pix')?.amount || 0;
    const creditPayment = sale.payments.find(p => p.method === 'credit')?.amount || 0;
    const debitPayment = sale.payments.find(p => p.method === 'debit')?.amount || 0;
    const fiadoPayment = sale.payments.find(p => p.method === 'fiado')?.amount || 0;

    setRegister(prev => prev ? {
      ...prev,
      sales: [...prev.sales, sale],
      totalSales: prev.totalSales + sale.total,
      totalCash: prev.totalCash + cashPayment,
      totalPix: prev.totalPix + pixPayment,
      totalCredit: prev.totalCredit + creditPayment,
      totalDebit: prev.totalDebit + debitPayment,
      totalFiado: prev.totalFiado + fiadoPayment,
    } : null);
  }, [register]);

  const addWithdrawal = useCallback((amount: number, reason: string, operatorId: string, operatorName: string, supervisorId?: string, supervisorName?: string) => {
    if (!register) return;

    const movement: CashMovement = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount,
      reason,
      createdAt: new Date(),
      operatorId,
      operatorName,
      supervisorId,
      supervisorName,
    };

    setRegister(prev => prev ? {
      ...prev,
      withdrawals: [...prev.withdrawals, movement],
      totalCash: prev.totalCash - amount,
    } : null);
  }, [register]);

  const addDeposit = useCallback((amount: number, reason: string, operatorId: string, operatorName: string) => {
    if (!register) return;

    const movement: CashMovement = {
      id: Date.now().toString(),
      type: 'deposit',
      amount,
      reason,
      createdAt: new Date(),
      operatorId,
      operatorName,
    };

    setRegister(prev => prev ? {
      ...prev,
      deposits: [...prev.deposits, movement],
      totalCash: prev.totalCash + amount,
    } : null);
  }, [register]);

  return {
    register,
    isOpen: register?.status === 'open',
    openRegister,
    closeRegister,
    addSale,
    addWithdrawal,
    addDeposit,
  };
}

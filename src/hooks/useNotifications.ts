import { useState, useEffect, useMemo, useCallback } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  type: 'stock_low' | 'payment_overdue' | 'sale_completed' | 'system';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  data?: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const { products } = useProducts();
  const { customers } = useCustomers();

  // Check for stock alerts
  const stockAlerts = useMemo(() => {
    if (!products) return [];
    
    return products
      .filter(product => product.stock <= product.min_stock)
      .map(product => ({
        id: `stock-${product.id}`,
        type: 'stock_low' as const,
        title: 'Estoque Baixo',
        message: `${product.name} está com estoque baixo (${product.stock} ${product.unit})`,
        severity: product.stock === 0 ? 'error' as const : 'warning' as const,
        timestamp: new Date(),
        read: false,
        data: product,
      }));
  }, [products]);

  // Check for customers with overdue payments
  const paymentAlerts = useMemo(() => {
    if (!customers) return [];
    
    return customers
      .filter(customer => customer.current_debt > 0 && customer.current_debt >= customer.credit_limit * 0.8)
      .map(customer => ({
        id: `payment-${customer.id}`,
        type: 'payment_overdue' as const,
        title: 'Limite de Crédito',
        message: `${customer.name} está próximo do limite (R$ ${customer.current_debt.toFixed(2)} / R$ ${customer.credit_limit.toFixed(2)})`,
        severity: customer.current_debt >= customer.credit_limit ? 'error' as const : 'warning' as const,
        timestamp: new Date(),
        read: false,
        data: customer,
      }));
  }, [customers]);

  // Combine notifications
  useEffect(() => {
    const allNotifications = [...stockAlerts, ...paymentAlerts];
    
    // Preserve read state
    setNotifications(prev => {
      const readIds = new Set(prev.filter(n => n.read).map(n => n.id));
      return allNotifications.map(n => ({
        ...n,
        read: readIds.has(n.id),
      }));
    });
  }, [stockAlerts, paymentAlerts]);

  // Listen for real-time sales
  useEffect(() => {
    const channel = supabase
      .channel('sales-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sales',
        },
        (payload) => {
          const sale = payload.new;
          const newNotification: Notification = {
            id: `sale-${sale.id}`,
            type: 'sale_completed',
            title: 'Nova Venda',
            message: `Venda #${sale.number?.toString().padStart(6, '0') || '?'} concluída - R$ ${Number(sale.total).toFixed(2)}`,
            severity: 'success',
            timestamp: new Date(),
            read: false,
            data: sale,
          };
          
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
  };
}

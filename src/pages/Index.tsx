import { useState } from 'react';
import { Sidebar } from '@/components/pos/Sidebar';
import { POSScreen } from '@/components/pos/POSScreen';
import { Dashboard } from '@/components/pos/Dashboard';
import { ProductsPage } from '@/components/pos/ProductsPage';
import { ReportsPage } from '@/components/pos/ReportsPage';
import { UsersPage } from '@/components/pos/UsersPage';
import { SettingsPage } from '@/components/pos/SettingsPage';
import { StockPage } from '@/components/pos/StockPage';
import { PromotionsManager } from '@/components/pos/PromotionsManager';
import { StoresManager } from '@/components/pos/StoresManager';
import { AuditPage } from '@/components/pos/AuditPage';
import { SuppliersPage } from '@/components/pos/SuppliersPage';
import { ServiceOrdersPage } from '@/components/pos/ServiceOrdersPage';
import { FinancialPage } from '@/components/pos/FinancialPage';
import { PurchasesPage } from '@/components/pos/PurchasesPage';
import { QuotesPage } from '@/components/pos/QuotesPage';
import { CustomersPage } from '@/components/pos/CustomersPage';
import { PaymentMethodsPage } from '@/components/pos/PaymentMethodsPage';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { stats } = useDashboardStats();

  const renderPage = () => {
    switch (currentPage) {
      case 'pos':
        return <POSScreen currentPage={currentPage} onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard stats={stats} onNavigate={setCurrentPage} />;
      case 'products':
        return <ProductsPage />;
      case 'stock':
        return <StockPage />;
      case 'customers':
        return <CustomersPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'quotes':
        return <QuotesPage />;
      case 'service-orders':
        return <ServiceOrdersPage />;
      case 'purchases':
        return <PurchasesPage />;
      case 'financial':
        return <FinancialPage />;
      case 'promotions':
        return <PromotionsManager />;
      case 'payment-methods':
        return <PaymentMethodsPage />;
      case 'stores':
        return <StoresManager />;
      case 'audit':
        return <AuditPage />;
      case 'reports':
        return <ReportsPage />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard stats={stats} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-background w-full">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-hidden">{renderPage()}</main>
    </div>
  );
};

export default Index;
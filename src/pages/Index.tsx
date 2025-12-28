import { useState } from 'react';
import { AppHeader } from '@/components/pos/AppHeader';
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
import { useDashboardStats } from '@/hooks/useDashboardStats';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('pos');
  const { stats } = useDashboardStats();

  const renderPage = () => {
    switch (currentPage) {
      case 'pos':
        return <POSScreen currentPage={currentPage} onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'products':
        return <ProductsPage />;
      case 'stock':
        return <StockPage />;
      case 'promotions':
        return <PromotionsManager />;
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
        return <POSScreen currentPage={currentPage} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background w-full">
      <AppHeader currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-hidden">{renderPage()}</main>
    </div>
  );
};

export default Index;

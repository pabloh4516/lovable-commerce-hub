import { useState } from 'react';
import { Sidebar } from '@/components/pos/Sidebar';
import { POSScreen } from '@/components/pos/POSScreen';
import { Dashboard } from '@/components/pos/Dashboard';
import { ProductsPage } from '@/components/pos/ProductsPage';
import { ReportsPage } from '@/components/pos/ReportsPage';
import { UsersPage } from '@/components/pos/UsersPage';
import { SettingsPage } from '@/components/pos/SettingsPage';
import { mockDashboardStats } from '@/data/mockData';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('pos');

  const renderPage = () => {
    switch (currentPage) {
      case 'pos':
        return <POSScreen />;
      case 'dashboard':
        return <Dashboard stats={mockDashboardStats} />;
      case 'products':
        return <ProductsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <POSScreen />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-hidden">{renderPage()}</main>
    </div>
  );
};

export default Index;

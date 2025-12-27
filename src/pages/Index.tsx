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
import { mockDashboardStats } from '@/data/mockData';
import { useFullscreen } from '@/hooks/useFullscreen';
import { usePOSMode } from '@/hooks/usePOSMode';
import { cn } from '@/lib/utils';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('pos');
  const { isSidebarHidden } = useFullscreen();
  const { isQuickMode } = usePOSMode();

  // Hide sidebar when: explicitly hidden OR in quick mode on POS page
  const shouldHideSidebar = isSidebarHidden || (isQuickMode && currentPage === 'pos');

  const renderPage = () => {
    switch (currentPage) {
      case 'pos':
        return <POSScreen currentPage={currentPage} onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard stats={mockDashboardStats} />;
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
    <div className="flex h-screen bg-background w-full">
      {/* Sidebar with transition */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          shouldHideSidebar ? "w-0" : "w-20 lg:w-64"
        )}
      >
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
      
      <main className="flex-1 overflow-hidden">{renderPage()}</main>
    </div>
  );
};

export default Index;

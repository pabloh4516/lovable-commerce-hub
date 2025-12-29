import { useState } from 'react';
import { Sidebar } from '@/components/pos/Sidebar';
import { POSScreen } from '@/components/pos/POSScreen';
import { Dashboard } from '@/components/pos/Dashboard';
import { ProductsPage } from '@/components/pos/ProductsPage';
import { StockPage } from '@/components/pos/StockPage';
import { CustomersPage } from '@/components/pos/CustomersPage';
import { SuppliersPage } from '@/components/pos/SuppliersPage';
import { QuotesPage } from '@/components/pos/QuotesPage';
import { ServiceOrdersPage } from '@/components/pos/ServiceOrdersPage';
import { CategoriesPage } from '@/components/pos/CategoriesPage';
import { SalesHistoryPage } from '@/components/pos/SalesHistoryPage';
import { ReturnsPage } from '@/components/pos/ReturnsPage';
import { StockMovementsPage } from '@/components/pos/StockMovementsPage';
import { LabelsPage } from '@/components/pos/LabelsPage';
import { CashManagementPage } from '@/components/pos/CashManagementPage';
import { AccountsPayablePage } from '@/components/pos/AccountsPayablePage';
import { AccountsReceivablePage } from '@/components/pos/AccountsReceivablePage';
import { SettingsUnifiedPage } from '@/components/pos/SettingsUnifiedPage';
import { ReportsUnifiedPage } from '@/components/pos/ReportsUnifiedPage';
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
      case 'categories':
        return <CategoriesPage />;
      case 'sales-history':
        return <SalesHistoryPage />;
      case 'returns':
        return <ReturnsPage />;
      case 'stock-movements':
        return <StockMovementsPage />;
      case 'labels':
        return <LabelsPage />;
      case 'cash-management':
        return <CashManagementPage />;
      case 'accounts-payable':
        return <AccountsPayablePage />;
      case 'accounts-receivable':
        return <AccountsReceivablePage />;
      case 'reports':
        return <ReportsUnifiedPage />;
      case 'settings':
        return <SettingsUnifiedPage />;
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

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
import { CompanySettingsPage } from '@/components/pos/CompanySettingsPage';
import { SellersPage } from '@/components/pos/SellersPage';
import { CategoriesPage } from '@/components/pos/CategoriesPage';
import { SalesHistoryPage } from '@/components/pos/SalesHistoryPage';
import { ReturnsPage } from '@/components/pos/ReturnsPage';
import { StockMovementsPage } from '@/components/pos/StockMovementsPage';
import { InventoryPage } from '@/components/pos/InventoryPage';
import { LabelsPage } from '@/components/pos/LabelsPage';
import { CashManagementPage } from '@/components/pos/CashManagementPage';
import { AccountsPayablePage } from '@/components/pos/AccountsPayablePage';
import { AccountsReceivablePage } from '@/components/pos/AccountsReceivablePage';
import { ChecksPage } from '@/components/pos/ChecksPage';
import { BankAccountsPage } from '@/components/pos/BankAccountsPage';
import { ProductSearchPage } from '@/components/pos/ProductSearchPage';
import { OverdueCustomersPage } from '@/components/pos/OverdueCustomersPage';
import { BirthdaysPage } from '@/components/pos/BirthdaysPage';
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
      case 'reports-sales':
      case 'reports-stock':
      case 'reports-financial':
      case 'reports-commissions':
      case 'reports-dre':
        return <ReportsPage />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      // New pages
      case 'company':
        return <CompanySettingsPage />;
      case 'sellers':
        return <SellersPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'sales-history':
        return <SalesHistoryPage />;
      case 'returns':
        return <ReturnsPage />;
      case 'stock-movements':
        return <StockMovementsPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'labels':
        return <LabelsPage />;
      case 'import-xml':
        return <PurchasesPage />; // TODO: Create ImportXMLPage
      case 'cash-management':
        return <CashManagementPage />;
      case 'accounts-payable':
        return <AccountsPayablePage />;
      case 'accounts-receivable':
        return <AccountsReceivablePage />;
      case 'checks':
        return <ChecksPage />;
      case 'bank-accounts':
        return <BankAccountsPage />;
      case 'product-search':
        return <ProductSearchPage />;
      case 'overdue-customers':
        return <OverdueCustomersPage />;
      case 'birthdays':
        return <BirthdaysPage />;
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

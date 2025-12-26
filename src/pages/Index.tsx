import { useState } from 'react';
import { Sidebar } from '@/components/pos/Sidebar';
import { POSScreen } from '@/components/pos/POSScreen';
import { Dashboard } from '@/components/pos/Dashboard';
import { ProductsPage } from '@/components/pos/ProductsPage';
import { mockDashboardStats } from '@/data/mockData';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Users, 
  Settings 
} from 'lucide-react';

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
        return <PlaceholderPage icon={BarChart3} title="Relatórios" />;
      case 'users':
        return <PlaceholderPage icon={Users} title="Usuários" />;
      case 'settings':
        return <PlaceholderPage icon={Settings} title="Configurações" />;
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

function PlaceholderPage({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">
        Esta seção está em desenvolvimento. Em breve você terá acesso completo a todas as funcionalidades.
      </p>
    </div>
  );
}

export default Index;

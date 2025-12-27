import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface POSLayoutProps {
  header: ReactNode;
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  mobileCheckout?: ReactNode;
  modals: ReactNode;
  isLoading?: boolean;
}

export function POSLayout({ 
  header, 
  leftPanel, 
  rightPanel, 
  mobileCheckout,
  modals,
  isLoading 
}: POSLayoutProps) {
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Carregando PDV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      {header}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {leftPanel}
        </div>

        {/* Right Panel - Cart/Actions (Hidden on mobile) */}
        <div className="w-[400px] hidden lg:flex flex-col border-l border-border bg-card shadow-xl">
          {rightPanel}
        </div>
      </div>

      {/* Mobile Checkout Button */}
      {mobileCheckout}

      {/* All Modals */}
      {modals}
    </div>
  );
}

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
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Carregando PDV...</p>
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
        <div className="w-[380px] hidden lg:flex flex-col border-l border-border bg-card">
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

import { Zap, LayoutGrid } from 'lucide-react';
import { POSMode } from '@/hooks/usePOSMode';

interface POSModeToggleProps {
  mode: POSMode;
  onToggle: () => void;
}

export function POSModeToggle({ mode, onToggle }: POSModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-secondary hover:bg-secondary/80 transition-colors"
      title="Alternar modo (Ctrl+M)"
    >
      {mode === 'quick' ? (
        <>
          <Zap className="w-4 h-4 text-warning" />
          <span className="hidden md:inline font-medium">Modo Rápido</span>
        </>
      ) : (
        <>
          <LayoutGrid className="w-4 h-4 text-primary" />
          <span className="hidden md:inline font-medium">Modo Detalhado</span>
        </>
      )}
    </button>
  );
}

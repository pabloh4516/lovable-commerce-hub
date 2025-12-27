interface QuickModeShortcutsProps {
  onF7?: () => void;
  onF9?: () => void;
  onF12?: () => void;
  hasItems: boolean;
  isRegisterOpen: boolean;
}

export function QuickModeShortcuts({ onF7, onF9, onF12, hasItems, isRegisterOpen }: QuickModeShortcutsProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 border-t border-border">
      <button
        onClick={onF7}
        className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm hover:bg-muted transition-colors"
      >
        <span className="font-mono font-bold text-xs opacity-70">F7</span>
        <span>Cliente</span>
      </button>
      
      <button
        onClick={onF9}
        disabled={!hasItems}
        className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="font-mono font-bold text-xs opacity-70">F9</span>
        <span>Limpar</span>
      </button>
      
      <div className="flex-1" />
      
      <button
        onClick={onF12}
        disabled={!hasItems || !isRegisterOpen}
        className="flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="font-mono text-sm opacity-70">F12</span>
        <span>FINALIZAR</span>
      </button>
    </div>
  );
}

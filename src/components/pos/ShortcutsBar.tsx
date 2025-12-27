import { 
  HelpCircle, 
  Search, 
  Hash, 
  Scale, 
  Percent, 
  Tag, 
  User, 
  Trash2, 
  XCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  CreditCard 
} from 'lucide-react';

interface ShortcutsBarProps {
  onF1?: () => void;
  onF2?: () => void;
  onF3?: () => void;
  onF4?: () => void;
  onF5?: () => void;
  onF6?: () => void;
  onF7?: () => void;
  onF8?: () => void;
  onF9?: () => void;
  onF10?: () => void;
  onF11?: () => void;
  onF12?: () => void;
  disabled?: {
    F3?: boolean;
    F4?: boolean;
    F5?: boolean;
    F6?: boolean;
    F8?: boolean;
    F9?: boolean;
    F10?: boolean;
    F11?: boolean;
    F12?: boolean;
  };
}

const shortcuts = [
  { key: 'F1', label: 'Ajuda', icon: HelpCircle },
  { key: 'F2', label: 'Consulta', icon: Search },
  { key: 'F3', label: 'Qtd', icon: Hash },
  { key: 'F4', label: 'Peso', icon: Scale },
  { key: 'F5', label: 'Desc.Item', icon: Percent },
  { key: 'F6', label: 'Desc.Total', icon: Tag },
  { key: 'F7', label: 'Cliente', icon: User },
  { key: 'F8', label: 'Excluir', icon: Trash2 },
  { key: 'F9', label: 'Limpar', icon: XCircle },
  { key: 'F10', label: 'Sangria', icon: ArrowDownCircle },
  { key: 'F11', label: 'Suprim.', icon: ArrowUpCircle },
  { key: 'F12', label: 'Pagar', icon: CreditCard },
];

export function ShortcutsBar({ 
  onF1, onF2, onF3, onF4, onF5, onF6, onF7, onF8, onF9, onF10, onF11, onF12,
  disabled = {}
}: ShortcutsBarProps) {
  const handlers: Record<string, (() => void) | undefined> = {
    F1: onF1, F2: onF2, F3: onF3, F4: onF4, F5: onF5, F6: onF6,
    F7: onF7, F8: onF8, F9: onF9, F10: onF10, F11: onF11, F12: onF12,
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 px-1">
      {shortcuts.map((shortcut) => {
        const Icon = shortcut.icon;
        const isDisabled = disabled[shortcut.key as keyof typeof disabled];
        const handler = handlers[shortcut.key];

        return (
          <button
            key={shortcut.key}
            onClick={handler}
            disabled={isDisabled}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-medium transition-colors duration-100 whitespace-nowrap ${
              isDisabled
                ? 'bg-muted/50 text-muted-foreground/50 border-border/50 cursor-not-allowed'
                : shortcut.key === 'F12'
                ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                : 'bg-card text-foreground border-border hover:bg-muted'
            }`}
          >
            <span className="font-mono font-bold text-[10px] opacity-70">{shortcut.key}</span>
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{shortcut.label}</span>
          </button>
        );
      })}
    </div>
  );
}

import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onF1?: () => void;  // Ajuda/Atalhos
  onF2?: () => void;  // Consulta preço
  onF3?: () => void;  // Quantidade
  onF4?: () => void;  // Peso
  onF5?: () => void;  // Desconto item
  onF6?: () => void;  // Desconto total
  onF7?: () => void;  // Cliente/CPF
  onF8?: () => void;  // Cancelar item
  onF9?: () => void;  // Cancelar venda
  onF10?: () => void; // Sangria
  onF11?: () => void; // Suprimento
  onF12?: () => void; // Finalizar venda
  onEscape?: () => void;
  onEnter?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      if (event.key !== 'Escape' && event.key !== 'Enter') return;
    }

    switch (event.key) {
      case 'F1':
        event.preventDefault();
        handlers.onF1?.();
        break;
      case 'F2':
        event.preventDefault();
        handlers.onF2?.();
        break;
      case 'F3':
        event.preventDefault();
        handlers.onF3?.();
        break;
      case 'F4':
        event.preventDefault();
        handlers.onF4?.();
        break;
      case 'F5':
        event.preventDefault();
        handlers.onF5?.();
        break;
      case 'F6':
        event.preventDefault();
        handlers.onF6?.();
        break;
      case 'F7':
        event.preventDefault();
        handlers.onF7?.();
        break;
      case 'F8':
        event.preventDefault();
        handlers.onF8?.();
        break;
      case 'F9':
        event.preventDefault();
        handlers.onF9?.();
        break;
      case 'F10':
        event.preventDefault();
        handlers.onF10?.();
        break;
      case 'F11':
        event.preventDefault();
        handlers.onF11?.();
        break;
      case 'F12':
        event.preventDefault();
        handlers.onF12?.();
        break;
      case 'Escape':
        handlers.onEscape?.();
        break;
      case 'Enter':
        handlers.onEnter?.();
        break;
    }
  }, [handlers, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export const shortcutsList = [
  { key: 'F1', description: 'Exibir atalhos' },
  { key: 'F2', description: 'Consultar preço' },
  { key: 'F3', description: 'Alterar quantidade' },
  { key: 'F4', description: 'Informar peso' },
  { key: 'F5', description: 'Desconto no item' },
  { key: 'F6', description: 'Desconto na venda' },
  { key: 'F7', description: 'Identificar cliente/CPF' },
  { key: 'F8', description: 'Cancelar item' },
  { key: 'F9', description: 'Cancelar venda' },
  { key: 'F10', description: 'Sangria' },
  { key: 'F11', description: 'Suprimento' },
  { key: 'F12', description: 'Finalizar venda' },
  { key: 'ESC', description: 'Fechar/Cancelar' },
];

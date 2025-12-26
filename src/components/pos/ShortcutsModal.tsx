import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { shortcutsList } from '@/hooks/useKeyboardShortcuts';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-primary" />
              Atalhos de Teclado
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          {shortcutsList.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg"
            >
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="px-3 py-1.5 text-sm font-mono font-semibold bg-muted rounded-md border border-border">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Pressione ESC para fechar qualquer modal
        </p>
      </DialogContent>
    </Dialog>
  );
}

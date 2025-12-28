import { useState } from 'react';
import { Bell, Package, CreditCard, ShoppingCart, X, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const iconMap = {
  stock_low: Package,
  payment_overdue: CreditCard,
  sale_completed: ShoppingCart,
  system: Bell,
};

const severityColors = {
  info: 'bg-primary/10 text-primary',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-destructive/10 text-destructive',
  success: 'bg-success/10 text-success',
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-destructive-foreground bg-destructive rounded-full animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-7 text-xs gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onClear={() => clearNotification(notification.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onClear: () => void;
}

function NotificationItem({ notification, onMarkAsRead, onClear }: NotificationItemProps) {
  const Icon = iconMap[notification.type];
  
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 transition-colors hover:bg-secondary/50 relative group",
        !notification.read && "bg-primary/5"
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
        severityColors[notification.severity]
      )}>
        <Icon className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-sm font-medium truncate",
            !notification.read && "text-foreground",
            notification.read && "text-muted-foreground"
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}
        </p>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button
            onClick={onMarkAsRead}
            className="p-1 rounded hover:bg-secondary transition-colors"
            title="Marcar como lida"
          >
            <Check className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
        <button
          onClick={onClear}
          className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Remover"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

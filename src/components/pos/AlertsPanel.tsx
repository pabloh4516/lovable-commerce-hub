import { AlertTriangle, Package, DollarSign, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  time?: string;
}

interface AlertsPanelProps {
  alerts?: Alert[];
}

export function AlertsPanel({ alerts = [] }: AlertsPanelProps) {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return <DollarSign className="w-4 h-4" />;
      case 'warning':
        return <Package className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getAlertColors = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-warning" />
        </div>
        <h3 className="font-semibold text-foreground">Alertas</h3>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Nenhum alerta no momento</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Tudo está funcionando normalmente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={cn(
                "p-3 rounded-lg border flex items-start gap-3",
                getAlertColors(alert.type)
              )}
            >
              <div className="shrink-0 mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{alert.title}</p>
                <p className="text-xs opacity-80 mt-0.5">{alert.description}</p>
                {alert.time && (
                  <div className="flex items-center gap-1 mt-2 text-xs opacity-60">
                    <Clock className="w-3 h-3" />
                    <span>{alert.time}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
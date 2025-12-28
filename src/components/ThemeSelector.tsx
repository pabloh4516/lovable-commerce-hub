import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useThemeCustomization, ThemeColors } from '@/hooks/useThemeCustomization';

export function ThemeSelector() {
  const { currentTheme, setTheme, themePresets } = useThemeCustomization();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Palette className="w-5 h-5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-3">
        <h4 className="font-semibold text-sm mb-3">Tema de Cores</h4>
        <div className="grid grid-cols-4 gap-2">
          {themePresets.map((theme) => (
            <ThemeColorButton
              key={theme.id}
              theme={theme}
              isSelected={currentTheme.id === theme.id}
              onClick={() => setTheme(theme)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ThemeColorButtonProps {
  theme: ThemeColors;
  isSelected: boolean;
  onClick: () => void;
}

function ThemeColorButton({ theme, isSelected, onClick }: ThemeColorButtonProps) {
  return (
    <button
      onClick={onClick}
      title={theme.name}
      className={cn(
        "relative w-10 h-10 rounded-lg transition-all duration-200",
        "flex items-center justify-center",
        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected && "ring-2 ring-offset-2"
      )}
      style={{ 
        backgroundColor: `hsl(${theme.primary})`,
        ['--tw-ring-color' as any]: `hsl(${theme.primary})`,
      }}
    >
      {isSelected && (
        <Check className="w-4 h-4 text-white" />
      )}
    </button>
  );
}

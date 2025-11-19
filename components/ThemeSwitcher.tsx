'use client';

import { useState, useEffect } from 'react';
import { setTheme, getTheme, getAllThemes, getThemeName, type Theme } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette } from 'lucide-react';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const theme = getTheme();
    setCurrentTheme(theme);
  }, []);

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
    setCurrentTheme(theme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          title="تغيير سمة البراند"
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">السمة</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {getAllThemes().map((theme) => (
          <DropdownMenuItem
            key={theme}
            onClick={() => handleThemeChange(theme)}
            className={`cursor-pointer ${
              currentTheme === theme ? 'bg-primary/10 text-primary font-semibold' : ''
            }`}
          >
            <div className="flex items-center gap-2 w-full">
              <div
                className="w-4 h-4 rounded-full border-2 border-current"
                style={{
                  backgroundColor:
                    theme === 'default'
                      ? 'var(--color-primary)'
                      : theme === 'islamic-green'
                      ? '#2d7d32'
                      : theme === 'blue-ocean'
                      ? '#3b82f6'
                      : '#8b5cf6',
                }}
              />
              <span>{getThemeName(theme)}</span>
              {currentTheme === theme && (
                <span className="mr-auto text-primary">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  primaryColor: string | null;
  setPrimaryColor: (color: string | null) => void;
  borderRadius: number | null;
  setBorderRadius: (radius: number | null) => void;
  favicon: string | null;
  setFavicon: (url: string | null) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function hexToHSL(H: string) {
  let r = 0, g = 0, b = 0;
  if (H.length == 4) {
    r = parseInt("0x" + H[1] + H[1]);
    g = parseInt("0x" + H[2] + H[2]);
    b = parseInt("0x" + H[3] + H[3]);
  } else if (H.length == 7) {
    r = parseInt("0x" + H[1] + H[2]);
    g = parseInt("0x" + H[3] + H[4]);
    b = parseInt("0x" + H[5] + H[6]);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0)
    h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [primaryColor, setPrimaryColorState] = useState<string | null>(null);
  const [borderRadius, setBorderRadiusState] = useState<number | null>(null);
  const [favicon, setFaviconState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    setThemeState(initialTheme);

    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) setPrimaryColorState(savedColor);

    const savedRadius = localStorage.getItem('borderRadius');
    if (savedRadius) setBorderRadiusState(parseFloat(savedRadius));

    const savedFavicon = localStorage.getItem('favicon');
    if (savedFavicon) setFaviconState(savedFavicon);

    setMounted(true);
  }, []);

  // Apply properties to document
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;

      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);

      if (primaryColor) {
        const hsl = hexToHSL(primaryColor);
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--ring', hsl);
        localStorage.setItem('primaryColor', primaryColor);
      } else {
        root.style.removeProperty('--primary');
        root.style.removeProperty('--ring');
        localStorage.removeItem('primaryColor');
      }

      if (borderRadius !== null) {
        root.style.setProperty('--radius', `${borderRadius}rem`);
        localStorage.setItem('borderRadius', borderRadius.toString());
      } else {
        root.style.removeProperty('--radius');
        localStorage.removeItem('borderRadius');
      }

      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      if (favicon) {
        link.href = favicon;
        localStorage.setItem('favicon', favicon);
      } else {
        link.href = '/icon.png';
        localStorage.removeItem('favicon');
      }
    }
  }, [theme, primaryColor, borderRadius, favicon, mounted]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const resetTheme = () => {
    setPrimaryColorState(null);
    setBorderRadiusState(null);
    setFaviconState(null);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setTheme: setThemeState,
      primaryColor,
      setPrimaryColor: setPrimaryColorState,
      borderRadius,
      setBorderRadius: setBorderRadiusState,
      favicon,
      setFavicon: setFaviconState,
      resetTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
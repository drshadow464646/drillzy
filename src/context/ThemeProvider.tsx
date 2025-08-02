
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

type MotionLevel = "low" | "medium" | "high";
type Font = "default" | "serif" | "mono";
type BaseTheme = "moon" | "sunset" | "dawn";

interface CustomThemeContextType {
  motionLevel: MotionLevel;
  setMotionLevel: (level: MotionLevel) => void;
  font: Font;
  setFont: (font: Font) => void;
  baseTheme: BaseTheme;
  setBaseTheme: (theme: BaseTheme) => void;
}

const CustomThemeContext = React.createContext<CustomThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    const [motionLevel, setMotionLevelState] = React.useState<MotionLevel>('medium');
    const [font, setFontState] = React.useState<Font>('default');
    const [baseTheme, setBaseThemeState] = React.useState<BaseTheme>('moon');
    
    React.useEffect(() => {
        const storedMotion = localStorage.getItem("skilltrack-motion-level") as MotionLevel | null;
        if (storedMotion) setMotionLevelState(storedMotion);

        const storedFont = localStorage.getItem("skilltrack-font") as Font | null;
        if (storedFont) setFontState(storedFont);

        const storedTheme = localStorage.getItem("skilltrack-base-theme") as BaseTheme | null;
        if (storedTheme) setBaseThemeState(storedTheme);
    }, []);

    const setMotionLevel = (level: MotionLevel) => {
        localStorage.setItem("skilltrack-motion-level", level);
        setMotionLevelState(level);
    };

    const setFont = (font: Font) => {
        localStorage.setItem("skilltrack-font", font);
        setFontState(font);
    };

    const setBaseTheme = (theme: BaseTheme) => {
        localStorage.setItem("skilltrack-base-theme", theme);
        setBaseThemeState(theme);
    };

    React.useEffect(() => {
        document.documentElement.classList.remove("font-serif", "font-mono");
        
        if (font !== 'default') {
            document.documentElement.classList.add(`font-${font}`);
        }
        
        document.documentElement.setAttribute('data-motion-level', motionLevel);
        document.documentElement.setAttribute('data-theme', baseTheme);

    }, [motionLevel, font, baseTheme]);

  return (
    <NextThemesProvider {...props}>
        <CustomThemeContext.Provider value={{ 
            motionLevel, setMotionLevel,
            font, setFont,
            baseTheme, setBaseTheme,
        }}>
            {children}
        </CustomThemeContext.Provider>
    </NextThemesProvider>
  )
}

export const useTheme = () => {
  const context = React.useContext(CustomThemeContext);
  const nextThemeContext = useNextTheme();

  if (context === undefined || nextThemeContext === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return { ...context, ...nextThemeContext };
}

//How to change theme mode from anywhere in the app:
//  import { useThemeContext...
//  const { toggleMode } = useThemeContext();
//  toggleMode('dark');
//    Accepted values are 'system', 'light', and 'dark'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getTheme } from "./Theme";
import { PaletteMode, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

/**
 * Defines the context for theme management which provides the themeColor and toggleMode function.
 */
export interface ThemeContextType {
  themeColor: string;
  toggleMode: (mode: string) => void;
}

/**
 * The ThemeContext will be used by the useThemeContext hook to enable components to access the theme.
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * A hook that provides access to the theme. It must be used within a ThemeContextProvider.
 * @returns {ThemeContextType} The theme context with the `themeColor` state and `toggleMode` function.
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

/**
 * The properties for the ThemeContextProvider component.
 */
export interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Gets the user's preferred theme color from local storage or defaults to 'system'.
 * @returns {string} The saved theme color mode.
 */
export function getColorMode() {
  let savedTheme = "system"; // Default Mode
  if (typeof window !== "undefined") {
    savedTheme = localStorage.getItem("themeColorMode") || savedTheme; // Use default if not found
    localStorage.setItem("themeColorMode", savedTheme);
  }
  return savedTheme;
}

/**
 * Determines the current theme based on the user's system preferences or stored settings.
 * @returns {PaletteMode} The current theme color mode ('light' or 'dark').
 */
function getCurrentThemeColor() {
  const savedMode = getColorMode();
  let savedTheme: PaletteMode;
  if (savedMode === "system") {
    savedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    if (savedTheme !== "dark" && savedTheme !== "light") {
      savedTheme = "light";
    }
  } else {
    savedTheme = savedMode as PaletteMode;
  }
  return savedTheme;
}

/**
 * This provider component wraps the entire application to provide theme context and handle theme switching.
 * @param children The child nodes to be rendered inside the ThemeProvider.
 * @returns React Provider component for the ThemeContext.
 */
export const ThemeContextProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeColor, setThemeColor] = useState<string>(getCurrentThemeColor());
  const [theme, setTheme] = useState(getTheme(themeColor as PaletteMode));

  useEffect(() => {
    setTheme(getTheme(themeColor as PaletteMode));
  }, [themeColor]);

  const [systemColor, setSystemColor] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );

  const toggleMode = useCallback(
    (newMode: string) => {
      const validModes = ["system", "light", "dark"];
      let newTheme: PaletteMode = "light"; //default

      if (typeof window !== "undefined" && validModes.includes(newMode)) {
        localStorage.setItem("themeColorMode", newMode);
      }

      if (validModes.includes(newMode)) {
        if (newMode === "system") {
          newTheme = systemColor as PaletteMode;
        } else {
          newTheme = newMode as PaletteMode;
        }
      } else {
        console.error(`Invalid theme mode (${newMode}), defaulting to light mode`);
      }

      setThemeColor(newTheme);
    },
    [systemColor],
  ); // Include systemColor in the dependency array

  useEffect(() => {
    if (getColorMode() === "system") {
      toggleMode("system");
    }
  }, [systemColor, toggleMode]);

  useEffect(() => {
    const updateSystemColor = (e: MediaQueryListEvent) => {
      setSystemColor(e.matches ? "dark" : "light");
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateSystemColor);

    // Initialize the state based on the current media query value.
    setSystemColor(mediaQuery.matches ? "dark" : "light");

    return () => {
      mediaQuery.removeEventListener("change", updateSystemColor);
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themeColor,
        toggleMode,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

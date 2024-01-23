//How to change theme mode from anywhere in the app:
//  import { useThemeContext...
//  const { toggleMode } = useThemeContext();
//  toggleMode('dark');
//    Accepted values are 'system', 'light', and 'dark'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { getTheme } from "./Theme";
import { PaletteMode, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";


interface ThemeContextType {
  themeColor: string;
  toggleMode: (mode: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

//Retrieve user's browser stored mode
export function getColorMode() {
  let savedTheme = "system"; // Default Mode
  if (typeof window !== "undefined") {
    savedTheme = localStorage.getItem("themeColorMode") || savedTheme; // Use default if not found
    localStorage.setItem("themeColorMode", savedTheme);
  }
  return savedTheme;
}

export function getCurrentThemeColor() {
  const savedMode = getColorMode();
  let savedTheme: PaletteMode;
  if (savedMode === "system") {
    savedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    if (savedTheme !== "dark" && savedTheme !== "light") {
      savedTheme = "light";
    }
  } else {
    savedTheme = savedMode as PaletteMode;
  }
  return savedTheme;
}

export const ThemeContextProvider: React.FC<ThemeProviderProps> = ({
  children,
}) => {
  const [themeColor, setThemeColor] = useState<string>(getCurrentThemeColor());
  const [theme, setTheme] = useState(getTheme(themeColor as PaletteMode));

  useEffect(() => {
    setTheme(getTheme(themeColor as PaletteMode));
  }, [themeColor]);

  const [systemColor, setSystemColor] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
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
        console.error(
          `Invalid theme mode (${newMode}), defaulting to light mode`
        );
      }

      setThemeColor(newTheme);
    },
    [systemColor]
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
    <ThemeContext.Provider value={{ themeColor, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

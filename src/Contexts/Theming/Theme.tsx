/*
 * Theme Configuration and Switching
 * Author: sebas-rom
 * -------------------------------
 *
 * This module provides a mechanism for creating and switching between light and dark themes
 * in your React app using the Material-UI library.
 *
 * Usage:
 * ------
 *
 * 1. Import ThemeContextProvider in your main application file (e.g., main.tsx):
 *
 *    ```tsx
 *    import { ThemeContextProvider } from './themecontext';
 *    ```
 *
 * 2. Wrap your root component with the `ThemeContextProvider` component to enable theme switching:
 *
 *    ```tsx
 *    function Index() {
 *      return (
 *          <ThemeContextProvider>
 *                <App />
 *          </ThemeContextProvider>
 *      );
 *    }
 *    ```
 *
 * 3. In your components, use the `useThemeContext` hook to access the current theme mode
 *    and the toggle function:
 *
 *    ```tsx
 *    import { useThemeContext } from './themecontext';
 *
 *    function MyComponent() {
 *      const { mode, toggleMode } = useThemeContext();
 *
 *      return (
 *        <div>
 *          <p>Current Theme Mode: {mode}</p>
 *          <button onClick={toggleMode}>Toggle Theme</button>
 *        </div>
 *      );
 *    }
 *    ```
 *
 * Note:
 * -----
 * - The `mode` value will be either 'light' or 'dark'.
 * - The `toggleMode` function switches between 'light' and 'dark' modes.
 *
 * Customize the theme colors and styles in the `getTheme` function
 * according to your application's design requirements.
 *
 */

import { PaletteMode } from "@mui/material";
import { createTheme } from "@mui/material/styles";

/**
 * Stores the current theme mode, initialized as 'light'.
 */
let currentMode: PaletteMode = "light";

/**
 * Retrieves the current theme mode.
 * @returns {PaletteMode} The current mode of the theme ('light' or 'dark').
 */
export const getThemeMode = () => {
  return currentMode;
};

/**
 * Generates a theme object with specified colors for the Material-UI library.
 * The theme can switch between 'light' and 'dark' modes.
 * 
 * @param {PaletteMode} mode - The desired mode for the theme ('light' or 'dark').
 * @returns The customized theme object with the selected mode and color palette.
 */
export const getTheme = (mode: PaletteMode) => {
  currentMode = mode;
  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: "#059e96",
      },
      secondary: {
        main: "#CB0909",
      },
      error: {
        main: "#ea5050",
      },
      warning: {
        main: "#ffb446",
      },
      info: {
        main: "#40a9ff",
      },
      success: {
        main: "#5FD266",
      },
      ...(mode === "light" && { background: { default: "#f7f7f7" } }),
    },
  });
};

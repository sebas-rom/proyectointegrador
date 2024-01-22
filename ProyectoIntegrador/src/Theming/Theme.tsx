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

let currentMode: PaletteMode = "light";
export const getThemeMode = () => {
  return currentMode;
};
export const getTheme = (mode: PaletteMode) => {
  currentMode = mode;
  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: "#059E9E",
      },
      secondary: {
        main: "#CB0909",
      },
    },
  });
};

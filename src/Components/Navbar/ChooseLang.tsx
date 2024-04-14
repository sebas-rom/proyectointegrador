import { useState, useEffect, MouseEvent } from "react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { i18next } from "../../Contexts/Lang/i18next";
import { styled } from "@mui/system";
import { initLang } from "../../Contexts/Lang/langSupport";
const StyledToggleButtonGroup = styled(ToggleButtonGroup)({
  width: "100%",
  display: "flex",
});

const StyledToggleButton = styled(ToggleButton)({
  flexGrow: 1,
});

/**
 * ChooseLang component allows users to select their language preference.
 * It initializes the language setting based on browser or saved settings and provides
 * toggle buttons for language selection.
 */
function ChooseLang() {
  useEffect(() => {
    initLang();
  }, []); // Empty dependency array means it runs once after the initial render.

  const [language, setLanguage] = useState<string | null>(i18next.language);

  /**
   * Updates the language state and stores the selection in local storage,
   * also updates the i18next language setting. Does not do anything if the new language is null.
   *
   * @param {MouseEvent<HTMLElement>} _event - The event that triggered the language change.
   * @param {string | null} newLanguage - The newly selected language.
   */
  const handleLanguage = (_event: MouseEvent<HTMLElement>, newLanguage: string | null) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
      if (typeof window !== "undefined") {
        localStorage.setItem("language", newLanguage);
      }
      i18next.changeLanguage(newLanguage ?? undefined);
    }
  };
  return (
    <StyledToggleButtonGroup value={language} exclusive onChange={handleLanguage} aria-label="lang-group">
      <StyledToggleButton value="en">English</StyledToggleButton>
      <StyledToggleButton value="es">Español</StyledToggleButton>
    </StyledToggleButtonGroup>
  );
}

export default ChooseLang;

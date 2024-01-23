import { useState, useEffect, MouseEvent } from "react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { i18next } from "../../Lang/i18next";
import { styled } from "@mui/system";
import { initLang } from "../../Lang/langSupport";
const StyledToggleButtonGroup = styled(ToggleButtonGroup)({
  width: "100%",
  display: "flex",
});

const StyledToggleButton = styled(ToggleButton)({
  flexGrow: 1,
});

function ChooseLang() {
  useEffect(() => {
    initLang();
  }, []); // Empty dependency array means it runs once after the initial render.

  const [language, setLanguage] = useState<string | null>(i18next.language);

  const handleLanguage = (
    event: MouseEvent<HTMLElement>,
    newLanguage: string | null
  ) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
      if (typeof window !== "undefined") {
        localStorage.setItem("language", newLanguage);
      }
      i18next.changeLanguage(newLanguage ?? undefined);
    }
  };
  return (
    <StyledToggleButtonGroup
      value={language}
      exclusive
      onChange={handleLanguage}
      aria-label="lang-group"
    >
      <StyledToggleButton value="en">English</StyledToggleButton>
      <StyledToggleButton value="es">Español</StyledToggleButton>
    </StyledToggleButtonGroup>
  );
}

export default ChooseLang;

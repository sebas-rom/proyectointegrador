import { useState, MouseEvent } from "react";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightnessOutlined";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { styled } from "@mui/system";
import { useThemeContext, getColorMode } from "../../Theming/ThemeContext";
import { useTranslation } from "react-i18next";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)({
  width: "100%",
  display: "flex",
});

const StyledToggleButton = styled(ToggleButton)({
  flexGrow: 1,
});

const IconWrapper = styled("div")({
  padding: "0px 5px 0px 0px",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
function ChooseTheme() {
  const { t: lang } = useTranslation("global");
  const { toggleMode } = useThemeContext();

  const [colorMode, setColorMode] = useState<string | null>(getColorMode());

  const handleColorMode = (
    event: MouseEvent<HTMLElement>,
    newColorMode: string | null
  ) => {
    if (newColorMode !== null) {
      setColorMode(newColorMode);
      toggleMode(newColorMode);
    }
  };
  return (
    <StyledToggleButtonGroup
      value={colorMode}
      exclusive
      onChange={handleColorMode}
      aria-label="lang-group"
    >
      <StyledToggleButton value="light">
        <IconWrapper>
          <LightModeIcon />
        </IconWrapper>
        {lang("light")}
      </StyledToggleButton>
      <StyledToggleButton value="system">
        <IconWrapper>
          <SettingsBrightnessIcon />
        </IconWrapper>
        {lang("system")}
      </StyledToggleButton>
      <StyledToggleButton value="dark">
        <IconWrapper>
          <DarkModeOutlinedIcon />
        </IconWrapper>
        {lang("dark")}
      </StyledToggleButton>
    </StyledToggleButtonGroup>
  );
}

export default ChooseTheme;

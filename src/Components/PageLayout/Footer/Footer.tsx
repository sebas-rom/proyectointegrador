import { Container, Grid, Typography, Link as MuiLink, Divider, Stack } from "@mui/material";
import { Facebook, Twitter, LinkedIn, Instagram } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";

/**
 * Footer component that displays information and links at the bottom of the page.
 * @returns {JSX.Element} - The Footer component UI.
 * @component
 */
function Footer() {
  const navigate = useNavigate();
  const theme = useTheme();
  /**
   * Gets the background color for the footer based on the current theme mode.
   * @returns {string} - The background color for the footer
   */
  const getBackgroundColor = () => {
    return theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.primary.main;
  };
  return (
    <div
      style={{
        backgroundColor: getBackgroundColor(),
        color: "#fff",
        padding: "40px 0",
        borderRadius: "5px",
        margin: "10px",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Stack justifyContent={"center"} sx={{ height: "100%" }}>
              <Typography variant="body2">FreeEcu is a platform connecting freelancers with clients.</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6">Quick Links</Typography>
            <Link
              to={"/"}
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <MuiLink color="inherit" variant="body2" underline="hover">
                Home
              </MuiLink>
            </Link>
            <br />
            <Link
              to={"/"}
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <MuiLink color="inherit" variant="body2" underline="hover">
                About
              </MuiLink>
            </Link>
            <br />
            <Link
              to={"/"}
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <MuiLink color="inherit" variant="body2" underline="hover">
                Contact Us
              </MuiLink>
            </Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6">Legal</Typography>
            <Link
              to={"/terms-and-conditions"}
              target="_blank"
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <MuiLink color="inherit" variant="body2" underline="hover">
                Terms of Service
              </MuiLink>
            </Link>
            <br />
            <Link
              to={"/privacy-policy"}
              target="_blank"
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <MuiLink color="inherit" variant="body2" underline="hover">
                Privacy Policy
              </MuiLink>
            </Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6">Follow Us</Typography>
            <Link
              to={"https://www.facebook.com/"}
              target="_blank"
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <Facebook />
            </Link>
            <Link
              to={"https://twitter.com/"}
              target="_blank"
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <Twitter />
            </Link>
            <Link
              to={"https://linkedin.com/"}
              target="_blank"
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <LinkedIn />
            </Link>
            <Link
              to={"https://instagram.com/"}
              target="_blank"
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <Instagram />
            </Link>
          </Grid>
        </Grid>
        <Divider
          sx={{
            margin: "30px",
            backgroundColor: "white",
          }}
        />
        <Typography variant="body2" align="center">
          &copy; 2024 FreeEcu. All rights reserved.
        </Typography>
      </Container>
    </div>
  );
}

export default Footer;

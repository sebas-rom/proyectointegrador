import { Container, Grid, Typography, Link, Divider } from "@mui/material";
import { Facebook, Twitter, LinkedIn, Instagram } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
function Footer() {
  const navigate = useNavigate();
  const theme = useTheme();
  const getBackgroundColor = () => {
    return theme.palette.mode === "dark"
      ? theme.palette.background.paper
      : theme.palette.primary.main;
  };
  return (
    <div
      style={{
        backgroundColor: getBackgroundColor(),
        color: "#fff",
        padding: "40px 0",
        borderRadius: "15px",
        margin: "10px ",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6">About Us</Typography>
            <Typography variant="body2">
              FreeEcu is a platform connecting freelancers with clients.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6">Quick Links</Typography>
            <Link href="#" color="inherit" variant="body2" underline="hover">
              Home
            </Link>
            <br />
            <Link href="#" color="inherit" variant="body2" underline="hover">
              About
            </Link>
            <br />
            <Link href="#" color="inherit" variant="body2" underline="hover">
              Contact Us
            </Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6">Follow Us</Typography>
            <Link href="#" color="inherit" style={{ marginRight: "10px" }}>
              <Facebook />
            </Link>
            <Link href="#" color="inherit" style={{ marginRight: "10px" }}>
              <Twitter />
            </Link>
            <Link href="#" color="inherit" style={{ marginRight: "10px" }}>
              <LinkedIn />
            </Link>
            <Link href="#" color="inherit" style={{ marginRight: "10px" }}>
              <Instagram />
            </Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6">Legal</Typography>
            <Link
              onClick={() => {
                navigate("/terms-and-conditions");
              }}
              color="inherit"
              variant="body2"
              underline="hover"
            >
              Terms of Service
            </Link>
            <br />
            <Link
              onClick={() => {
                navigate("/privacy-policy");
              }}
              color="inherit"
              variant="body2"
              underline="hover"
            >
              Privacy Policy
            </Link>
          </Grid>
        </Grid>
        <Divider sx={{ margin: "30px", backgroundColor: "white" }} />
        <Typography variant="body2" align="center">
          &copy; 2024 FreeEcu. All rights reserved.
        </Typography>
      </Container>
    </div>
  );
}

export default Footer;

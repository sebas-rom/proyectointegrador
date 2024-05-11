import { Box, Button, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2s
import LandingNavbar from "../../PageLayout/Navbar/LandingNavbar/LandingNavbar.tsx";
import workdesk from "../../../assets/images/workdesk5.webp";
import flows from "../../../assets/svg/flows.svg";
import money from "../../../assets/svg/money.svg";
import { useNavigate } from "react-router-dom";
import { SIGNUP_PATH } from "../routes.tsx";
import CustomPaper from "../../CustomMUI/CustomPaper.tsx";
/**
 * Landing page component for the application.
 * @returns {JSX.Element} - The LandingPage component UI.
 * @component
 */
export default function LandingPage() {
  const navigateToPage = useNavigate();
  return (
    <>
      <LandingNavbar />

      <Box>
        {/* Hero Section */}
        <Box
          sx={{
            position: "relative",
            backgroundColor: "primary.main", // Set background color
            py: 10,
            backgroundImage: `url(${workdesk})`, // Set background image
            backgroundSize: "cover", // Cover the entire box with the background image
            backgroundPosition: "center", // Center the background image
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Black color with 50% opacity
            }}
          />
          <Container
            sx={{
              position: "relative",
              zIndex: 1, // Ensure the text appears above the overlay
            }}
            maxWidth="md"
          >
            <Typography variant="h2" component="h1" align="center" color="white" gutterBottom>
              Unleash Your Potential with FreeEcu
            </Typography>
            <Typography variant="h5" align="center" color="white" paragraph>
              Connect with clients and take control of your career in Ecuador's bustling freelance market.
            </Typography>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Features that Make freecu Stand Out
          </Typography>
          <Grid container spacing={15}>
            <Grid xs={12} md={6}>
              <Box>
                <img
                  src={flows}
                  style={{
                    maxHeight: 500,
                  }}
                />
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Simple Workflows
              </Typography>
              <Typography variant="body1" paragraph>
                freecu's intuitive platform streamlines the freelance process, allowing you to focus on delivering
                exceptional work.
              </Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <Box>
                <img
                  src={money}
                  style={{
                    maxHeight: 500,
                  }}
                />
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Lowest Fees
              </Typography>
              <Typography variant="body1" paragraph>
                We understand the value of your hard work, which is why we offer the lowest fees among all platforms.
              </Typography>
            </Grid>
          </Grid>
        </Container>

        {/* Testimonials Section */}
        <Box bgcolor="primary.main" py={8}>
          <Container maxWidth="md">
            <Typography variant="h4" component="h2" align="center" color="white" gutterBottom>
              What Our Users Say
            </Typography>
            <Grid container spacing={4}>
              <Grid xs={12} md={6}>
                <CustomPaper sx={{ p: 4 }}>
                  <Typography variant="body1" paragraph>
                    "freecu has been a game-changer for my freelance career. The platform is user-friendly, and the low
                    fees have allowed me to keep more of my hard-earned money."
                  </Typography>
                  <Typography variant="subtitle1">- Juan P., Graphic Designer</Typography>
                </CustomPaper>
              </Grid>
              <Grid xs={12} md={6}>
                <CustomPaper sx={{ p: 4 }}>
                  <Typography variant="body1" paragraph>
                    "As a client, I've been impressed with the quality of freelancers on freecu. The simple workflows
                    have made it easy to communicate and collaborate with them."
                  </Typography>
                  <Typography variant="subtitle1">- María R., Marketing Consultant</Typography>
                </CustomPaper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Call-to-Action Section */}
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Box bgcolor="primary.light" p={4}>
            <Typography variant="h4" component="h2" align="center" gutterBottom color="white">
              Ready to Take Your Freelance Career to the Next Level?
            </Typography>
            <Typography variant="body1" align="center" paragraph color="white">
              Join freecu today and experience the freedom and flexibility of being your own boss while connecting with
              clients in Ecuador's vibrant freelance market.
            </Typography>
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigateToPage(`/${SIGNUP_PATH}`)}
              >
                Sign Up Now
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}

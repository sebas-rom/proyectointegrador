import { Container, Stack, Typography } from "@mui/material";
import termsAndConditions from "../../../assets/svg/terms-and-conditions.svg";

/**
 * The TermsAncConditions component displays the legal terms of service of the FreeEcu platform.
 * @returns {JSX.Element} - The TermsAncConditions component UI.
 * @component
 */
function TermsAncConditions() {
  return (
    <Container maxWidth="md">
      <Stack spacing={2} alignContent={"center"} alignItems={"center"}>
        <img src={termsAndConditions} style={{ maxHeight: 500 }} />
        <Typography variant="h3"> Legal Terms of Service</Typography>
        <Typography variant="h6">Last updated: 2024-04-16</Typography>
        <Typography variant="body1">
          Welcome to FreeEcu, an online platform that connects freelancers
          offering professional services with clients seeking to hire them. By
          using FreeEcu's website, mobile applications, or any of its services,
          you agree to be bound by these legal terms of service ("Terms"),
          whether you are a freelancer providing services on the platform or a
          client hiring freelancers through FreeEcu. Please read these Terms
          carefully before accessing or using FreeEcu's services, as they
          constitute a binding legal agreement between you and FreeEcu.
        </Typography>
        <Typography variant="h5">
          Account Registration and Requirements
        </Typography>
        <Typography variant="body1">
          To use FreeEcu's services, you must register for an account by
          providing accurate and complete information about yourself. You are
          responsible for maintaining the confidentiality of your account login
          credentials and restricting access to your account. You agree to
          promptly update your account information to keep it current and
          accurate at all times. FreeEcu reserves the right to suspend or
          terminate your account if any information provided is inaccurate,
          incomplete, or violates these Terms.
        </Typography>

        <Typography variant="h5">
          Freelancer Services and Responsibilities
        </Typography>
        <Typography variant="body1">
          Freelancers on the FreeEcu platform are independent contractors and
          not employees or representatives of FreeEcu. FreeEcu does not
          guarantee the availability, quality, or results of any freelancer's
          work. Freelancers set their own rates, working hours, descriptions of
          their expertise and services offered, and terms of service. When you
          hire a freelancer through FreeEcu, you are entering into a direct
          service agreement with that freelancer, subject to their stated terms
          and conditions. Freelancers are solely responsible for their work,
          taxes, compliance with laws, and any agreements with clients.
        </Typography>

        <Typography variant="h5">
          Client Responsibilities and Obligations
        </Typography>
        <Typography variant="body1">
          As a client hiring freelancers on FreeEcu, you are responsible for
          clearly communicating your project requirements, timelines, payment
          terms, and any other specifications or conditions to the freelancer(s)
          you engage. You agree to pay freelancers in full and in a timely
          manner according to the terms you establish with them during the
          hiring process. FreeEcu is not responsible for work quality, delivery
          timelines, payment disputes, or any other issues between clients and
          freelancers.
        </Typography>

        <Typography variant="h5">
          FreeEcu Payment Processing Services
        </Typography>
        <Typography variant="body1">
          For the convenience of its users, FreeEcu provides payment processing
          services that allow clients to pay freelancers through the platform.
          However, FreeEcu is not a party to the service agreements between
          clients and freelancers and is not liable for service quality,
          completion, or payment issues that may arise between users. FreeEcu
          charges fees on payments processed through its platform as described
          on the FreeEcu website. These fees are subject to change with notice.
        </Typography>

        <Typography variant="h5">
          Intellectual Property Ownership and Licensing
        </Typography>
        <Typography variant="body1">
          Freelancers offering services through FreeEcu retain full ownership of
          any intellectual property, inventions, or works they create unless
          they specifically agree otherwise in writing with a client. Clients
          are responsible for obtaining all necessary licenses, permissions, or
          rights for any third-party intellectual property, materials, or assets
          they require freelancers to use while providing services.
        </Typography>

        <Typography variant="h5">
          Prohibited Conduct and Content Restrictions
        </Typography>
        <Typography variant="body1">
          FreeEcu prohibits users from uploading, posting, transmitting, or
          exchanging any content or materials through its platform that are
          illegally obscene, defamatory, threatening, harassing, fraudulent,
          infringing on intellectual property rights, or otherwise unlawful.
          Users may not attempt to gain unauthorized access to FreeEcu's
          systems, networks, or accounts, or interfere with the platform's
          operations or security. FreeEcu reserves the right to remove or
          disable access to any user accounts or content that violate these
          restrictions at its sole discretion and without prior notice.
        </Typography>

        <Typography variant="h5">User Content Responsibility</Typography>
        <Typography variant="body1">
          FreeEcu does not control, endorse, or assume any responsibility for
          content provided by its users through the platform. Users are solely
          responsible for the accuracy, quality, legality, and appropriateness
          of their content, communications, and activity while using FreeEcu
          services.
        </Typography>

        <Typography variant="h5">Third-Party Services and Links</Typography>
        <Typography variant="body1">
          FreeEcu's website or applications may provide information about or
          links to third-party websites, services, or resources that are not
          owned or controlled by FreeEcu. FreeEcu does not endorse or assume any
          responsibility for the content, privacy policies, practices, or
          opinions expressed on such external sites or services. Your use of any
          third-party websites or resources is at your own risk.
        </Typography>

        <div />
        <div />
        <div />
      </Stack>
    </Container>
  );
}

export default TermsAncConditions;

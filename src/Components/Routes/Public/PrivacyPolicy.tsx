import { Container, Stack, Typography } from "@mui/material";
import privacyPolicy from "../../../assets/svg/privacyPolicy.svg";

function PrivacyPolicy() {
  return (
    <Container maxWidth="md">
      <Stack spacing={2} alignContent={"center"} alignItems={"center"}>
        <img src={privacyPolicy} style={{ maxHeight: 500 }} />
        <Typography variant="h3">Privacy Policy</Typography>
        <Typography variant="h6">Last updated: 2024-04-16</Typography>
        <Typography variant="body1">
          We are committed to protecting the privacy of our users. This Privacy
          Policy outlines how we collect, use, share, and safeguard user
          information in the course of providing our freelancer hiring platform
          and services.
        </Typography>

        <Typography variant="h5">Information We Collect</Typography>
        <Typography variant="body1">
          We may collect different types of information from you when you
          interact with our platform and services, including:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1">
              Personal Information: Such as your full name, contact details
              (email, phone number), employment information, payment and billing
              details, communications with FreeEcu or other users, and any other
              information you provide to us.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Usage Data: Including details about how you use and interact with
              our website, applications, and services, such as your browsing
              activity, pages visited, features used, device information, IP
              address, and other technical data.
            </Typography>
          </li>
        </ul>

        <Typography variant="h5">How We Use Your Information</Typography>
        <Typography variant="body1">
          We use the information we collect for various purposes related to
          operating, maintaining, improving, and analyzing our platform and
          services. Specifically, we may use your information to:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1">
              Provide, personalize and enhance the FreeEcu platform and services
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Process payments and transactions between clients and freelancers
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Communicate with you about your account, new features, and offers
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Address technical issues and ensure the security of our systems
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Enforce our Terms of Service and legal compliance efforts
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Analyze usage trends and gather insights to improve our services
            </Typography>
          </li>
        </ul>

        <Typography variant="h5">Information Sharing and Disclosure</Typography>
        <Typography variant="body1">
          We may share your information with trusted third-party service
          providers who assist us in operating and improving the FreeEcu
          platform. These providers are obligated to maintain the
          confidentiality and security of any personal information we share with
          them.
        </Typography>
        <Typography variant="body1">
          We may also disclose your information if required by law, such as in
          response to a court order or other legal process. Additionally, we
          reserve the right to share information if we believe it is necessary
          to investigate, prevent or take action regarding illegal activities,
          violations of our Terms of Service, or situations involving potential
          threats to the rights or safety of any person.
        </Typography>
        <Typography variant="body1">
          FreeEcu does not sell, rent, or trade personal information to any
          third parties for marketing or advertising purposes.
        </Typography>

        <Typography variant="h5">Data Security</Typography>
        <Typography variant="body1">
          We implement reasonable technical, administrative and physical
          security measures designed to protect the information we collect from
          accidental or unlawful destruction, loss, alteration, unauthorized
          disclosure or access. However, no method of data transmission or
          storage is completely secure, and we cannot guarantee absolute
          security of your information. If we become aware of a security breach
          involving your personal information, we will notify you as required by
          applicable laws and regulations.
        </Typography>

        <Typography variant="h5">Data Retention</Typography>
        <Typography variant="body1">
          We will retain your personal information for as long as necessary to
          provide our services, comply with applicable laws and regulations,
          resolve disputes, enforce our agreements, and maintain business
          records as required. When your information is no longer needed for
          these purposes, we will securely delete or anonymize it.
        </Typography>

        <Typography variant="h5">Third-Party Sites and Services</Typography>
        <Typography variant="body1">
          Our website may contain links to third-party websites, products, or
          services that are not owned or controlled by FreeEcu. We are not
          responsible for the privacy practices or content of such third
          parties. We encourage you to review the privacy policies of these
          third parties before providing them with any personal information.
        </Typography>

        <Typography variant="h5">Your Choices and Rights</Typography>
        <Typography variant="body1">
          You have certain choices and rights regarding your personal
          information:
        </Typography>

        <ul>
          <li>
            <Typography variant="body1">
              Access and Update: You may access, review and update your account
              information by logging into your FreeEcu account or contacting us
              directly.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Email Preferences: You can opt-out of receiving promotional emails
              from FreeEcu at any time by following the unsubscribe instructions
              included in each email.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Integrated Third-Party Accounts: If you choose to integrate or
              link third-party accounts or services with your FreeEcu account,
              you may be able to control the data that is shared by adjusting
              your privacy settings on those external platforms. However,
              disconnecting integrated accounts may impact or limit your access
              to certain FreeEcu features or services.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Deletion: You may request that we delete or anonymize your
              personal information by contacting us, except where we are legally
              required to retain certain data.
            </Typography>
          </li>
        </ul>

        <Typography variant="h5">
          Updates to Terms and Privacy Policy
        </Typography>
        <Typography variant="body1">
          We may modify or update these Terms of Service and Privacy Policy from
          time to time. If we make material changes, we will provide appropriate
          notice to users, such as by email or through a notification on our
          website or applications. Your continued use of the FreeEcu platform
          and services following any such update constitutes your agreement to
          the revised Terms and Privacy Policy.
        </Typography>

        <Typography variant="body1">
          By accessing or using the FreeEcu website, mobile applications, or any
          of our services, you signify your acceptance of these Terms of Service
          and Privacy Policy. If you do not agree with any part of these terms,
          please do not use FreeEcu's services.
        </Typography>
        <div />
        <div />
        <div />
      </Stack>
    </Container>
  );
}

export default PrivacyPolicy;

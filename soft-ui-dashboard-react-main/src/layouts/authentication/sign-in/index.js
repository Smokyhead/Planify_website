// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Switch from "@mui/material/Switch";

import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import SoftButton from "components/SoftButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

function SignIn() {
  return (
      <CoverLayout
        title="Bienvenue"
        description="Entrer vos informations d'identification pour vous connecter à votre compte"
      >
        <SoftBox component="form" role="form">
          <SoftBox mb={2}>
            <SoftBox mb={1} ml={0.5}>
              <SoftTypography component="label" variant="caption" fontWeight="bold">
                Email
              </SoftTypography>
            </SoftBox>
            <SoftInput type="email" placeholder="Email" />
          </SoftBox>
          <SoftBox mb={2}>
            <SoftBox mb={1} ml={0.5}>
              <SoftTypography component="label" variant="caption" fontWeight="bold">
                Mot de passe
              </SoftTypography>
            </SoftBox>
            <SoftInput type="password" placeholder="Password" />
          </SoftBox>
          <SoftBox mt={4} mb={1}>
            <SoftButton variant="gradient" color="primary" fullWidth>
              Se connecter
            </SoftButton>
          </SoftBox>
        </SoftBox>
      </CoverLayout>
  );
}

export default SignIn;

// @mui material components
import { capitalize } from "@mui/material";
import Card from "@mui/material/Card";

import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function Planning() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox mb={3}>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftTypography textTransform={capitalize} variant="h6">
              Générer un planning
            </SoftTypography>
            <SoftBox display="flex" alignItems="center">
              <SoftButton variant="gradient" color="info" size="small">
                Commencer
              </SoftButton>
            </SoftBox>
          </SoftBox>
        </Card>
      </SoftBox>
      <SoftBox>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftTypography variant="h6">Mon planning</SoftTypography>
          </SoftBox>
        </Card>
      </SoftBox>
    </DashboardLayout>
  );
}

export default Planning;

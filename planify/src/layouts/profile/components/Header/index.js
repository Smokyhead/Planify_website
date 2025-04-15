import { useState, useEffect } from "react";

// @mui material components
import Card from "@mui/material/Card";

import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import breakpoints from "assets/theme/base/breakpoints";

function Header() {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // A function that sets the orientation state of the tabs.
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    /** 
     The event listener that's calling the handleTabsOrientation function when resizing the window.
    */
    window.addEventListener("resize", handleTabsOrientation);

    // Call the handleTabsOrientation function to set the state with the initial value.
    handleTabsOrientation();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  const handleSetTabValue = (event, newValue) => setTabValue(newValue);

  return (
    <SoftBox position="relative">
      <DashboardNavbar />
      <Card>
        <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
          <SoftTypography textTransform="capitalize" variant="h6">
            Mon profil
          </SoftTypography>
          <SoftBox display="flex" alignItems="center">
            <SoftButton variant="gradient" color="info" size="small">
              Modifier
            </SoftButton>
          </SoftBox>
        </SoftBox>
      </Card>
    </SoftBox>
  );
}

export default Header;

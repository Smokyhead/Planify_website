/**
=========================================================
* Soft UI Dashboard React - v4.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";

// Soft UI Dashboard React base styles
import typography from "assets/theme/base/typography";

// Dashboard layout components
import BuildByDevelopers from "layouts/dashboard/components/BuildByDevelopers";
import WorkWithTheRockets from "layouts/dashboard/components/WorkWithTheRockets";
import Projects from "layouts/dashboard/components/Projects";
import OrderOverview from "layouts/dashboard/components/OrderOverview";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import gradientLineChartData from "layouts/dashboard/data/gradientLineChartData";

function Dashboard() {
  const { size } = typography;
  const { chart, items } = reportsBarChartData;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                bgColor="white"
                direction="right"
                title={{ text: "bénéfices de ce mois" }}
                count="5850 TND"
                percentage={{ color: "success", text: "+55%" }}
                icon={{ color: "primary", component: "paid" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                bgColor="white"
                direction="right"
                title={{ text: "Livraisons de ce mois" }}
                count="77"
                percentage={{ color: "success", text: "+3%" }}
                icon={{ color: "primary", component: "public" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                bgColor="white"
                direction="right"
                title={{ text: "Nouveaux clients" }}
                count="+5"
                percentage={{ color: "error", text: "-2%" }}
                icon={{ color: "primary", component: "emoji_events" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                bgColor="white"
                direction="right"
                title={{ text: "Contrats de ce mois" }}
                count="15"
                percentage={{ color: "success", text: "+5%" }}
                icon={{
                  color: "primary",
                  component: "shopping_cart",
                }}
              />
            </Grid>
          </Grid>
        </SoftBox>
        <SoftBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={5}>
              <ReportsBarChart
                color="dark"
                title="Livraisons"
                description={
                  <>
                    (<strong>+23%</strong>) que l&apos;année dernière
                  </>
                }
                chart={chart}
                items={items}
              />
            </Grid>
            <Grid item xs={12} lg={7}>
              <GradientLineChart
                title="Aperçu des bénéfices"
                description={
                  <SoftBox display="flex" alignItems="center">
                    <SoftBox fontSize={size.lg} color="success" mb={0.3} mr={0.5} lineHeight={0}>
                      <Icon className="font-bold">arrow_upward</Icon>
                    </SoftBox>
                    <SoftTypography variant="button" color="text" fontWeight="medium">
                      4% plus{" "}
                      <SoftTypography variant="button" color="text" fontWeight="regular">
                        en 2023
                      </SoftTypography>
                    </SoftTypography>
                  </SoftBox>
                }
                height="20.25rem"
                chart={gradientLineChartData}
              />
            </Grid>
          </Grid>
        </SoftBox>
      </SoftBox>
    </DashboardLayout>
  );
}

export default Dashboard;

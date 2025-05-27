// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { CircularProgress, Alert, Card, CardContent, IconButton, Tooltip } from "@mui/material";
import { useState, useEffect } from "react";

import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";

import typography from "assets/theme/base/typography";
import { useAuth } from "context/AuthContext";

function Dashboard() {
  const { size } = typography;
  const { getAuthHeaders } = useAuth();

  // State for dynamic data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/dashboard-stats', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate chart data from real data
  const generateChartData = () => {
    if (!dashboardData?.trends?.weekly) {
      return {
        chart: { labels: [], datasets: [] },
        items: []
      };
    }

    const weeklyData = dashboardData.trends.weekly;
    const labels = weeklyData.map(week => `Semaine ${week.week_number}`);
    const deliveries = weeklyData.map(week => week.deliveries);
    const distances = weeklyData.map(week => parseFloat(week.total_distance || 0));

    return {
      chart: {
        labels: labels.reverse(),
        datasets: {
          label: "Livraisons",
          data: deliveries.reverse(),
        },
      },
      items: [
        {
          icon: { color: "primary", component: "library_books" },
          label: "Livraisons totales",
          progress: { content: deliveries.reduce((a, b) => a + b, 0).toString(), percentage: 60 },
        },
        {
          icon: { color: "info", component: "touch_app" },
          label: "Distance totale",
          progress: { content: `${distances.reduce((a, b) => a + b, 0).toFixed(1)} km`, percentage: 45 },
        },
      ],
    };
  };

  const chartData = generateChartData();

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox py={3} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </SoftBox>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox py={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Erreur lors du chargement des données: {error}
          </Alert>
        </SoftBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        {/* Header with refresh button */}
        <SoftBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <SoftTypography variant="h4" fontWeight="medium">
            Tableau de bord
          </SoftTypography>
          <Tooltip title="Actualiser les données">
            <IconButton
              onClick={fetchDashboardData}
              disabled={loading}
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": { backgroundColor: "primary.dark" }
              }}
            >
              <Icon>refresh</Icon>
            </IconButton>
          </Tooltip>
        </SoftBox>

        <SoftBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                bgColor="white"
                direction="right"
                title={{ text: "Optimisations récentes" }}
                count={dashboardData?.optimization?.recentRuns || 0}
                percentage={{
                  color: "info",
                  text: `${dashboardData?.optimization?.avgExecutionTime || 0}s avg`
                }}
                icon={{ color: "primary", component: "speed" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                bgColor="white"
                direction="right"
                title={{ text: "Livraisons de ce mois" }}
                count={dashboardData?.currentMonth?.deliveries || 0}
                percentage={{
                  color: dashboardData?.currentMonth?.deliveryGrowth >= 0 ? "success" : "error",
                  text: `${dashboardData?.currentMonth?.deliveryGrowth >= 0 ? '+' : ''}${dashboardData?.currentMonth?.deliveryGrowth || 0}%`
                }}
                icon={{ color: "primary", component: "local_shipping" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                bgColor="white"
                direction="right"
                title={{ text: "Magasins actifs" }}
                count={dashboardData?.currentMonth?.stores || 0}
                percentage={{
                  color: "success",
                  text: "actifs"
                }}
                icon={{ color: "primary", component: "store" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                bgColor="white"
                direction="right"
                title={{ text: "Contrats actifs" }}
                count={dashboardData?.currentMonth?.contracts || 0}
                percentage={{
                  color: "info",
                  text: `${dashboardData?.contracts?.comeau || 0} COMEAU, ${dashboardData?.contracts?.comdet || 0} COMDET`
                }}
                icon={{
                  color: "primary",
                  component: "assignment",
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
                title="Livraisons hebdomadaires"
                description={
                  <>
                    Tendances des <strong>4 dernières semaines</strong>
                  </>
                }
                chart={chartData.chart}
                items={chartData.items}
              />
            </Grid>
            <Grid item xs={12} lg={7}>
              <Card>
                <CardContent>
                  <SoftTypography variant="h6" fontWeight="medium" mb={2}>
                    Aperçu des performances
                  </SoftTypography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <SoftBox mb={2}>
                        <SoftTypography variant="caption" color="text" fontWeight="medium">
                          Distance moyenne par optimisation
                        </SoftTypography>
                        <SoftBox display="flex" alignItems="center">
                          <SoftBox fontSize={size.lg} color="info" mb={0.3} mr={0.5} lineHeight={0}>
                            <Icon className="font-bold">route</Icon>
                          </SoftBox>
                          <SoftTypography variant="h4" color="info">
                            {dashboardData?.optimization?.avgDistance || 0} km
                          </SoftTypography>
                        </SoftBox>
                      </SoftBox>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <SoftBox mb={2}>
                        <SoftTypography variant="caption" color="text" fontWeight="medium">
                          Temps d'exécution moyen
                        </SoftTypography>
                        <SoftBox display="flex" alignItems="center">
                          <SoftBox fontSize={size.lg} color="success" mb={0.3} mr={0.5} lineHeight={0}>
                            <Icon className="font-bold">timer</Icon>
                          </SoftBox>
                          <SoftTypography variant="h4" color="success">
                            {dashboardData?.optimization?.avgExecutionTime || 0}s
                          </SoftTypography>
                        </SoftBox>
                      </SoftBox>
                    </Grid>
                    <Grid item xs={12}>
                      <SoftBox>
                        <SoftTypography variant="caption" color="text" fontWeight="medium">
                          Répartition des contrats
                        </SoftTypography>
                        <SoftBox display="flex" alignItems="center" mt={1}>
                          <SoftBox mr={3}>
                            <SoftTypography variant="button" color="primary" fontWeight="medium">
                              COMEAU: {dashboardData?.contracts?.comeau || 0}
                            </SoftTypography>
                          </SoftBox>
                          <SoftBox>
                            <SoftTypography variant="button" color="secondary" fontWeight="medium">
                              COMDET: {dashboardData?.contracts?.comdet || 0}
                            </SoftTypography>
                          </SoftBox>
                        </SoftBox>
                      </SoftBox>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </SoftBox>
      </SoftBox>
    </DashboardLayout>
  );
}

export default Dashboard;

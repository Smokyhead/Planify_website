/**
 * Analytics Dashboard
 * Enhanced Planify - Delivery Planning System
 */

import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  LocalShipping as DeliveryIcon,
  Assessment as AnalyticsIcon,
} from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import { useAuth } from "context/AuthContext";

const API_BASE_URL = "http://localhost:3001/api";

function AnalyticsDashboard() {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optimizationRuns, setOptimizationRuns] = useState([]);
  const [systemStats, setSystemStats] = useState({
    totalStores: 0,
    totalWarehouses: 0,
    averageOptimizationTime: 0,
    totalOptimizationRuns: 0,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch optimization runs
      const optimizationResponse = await fetch(`${API_BASE_URL}/optimization-runs`, {
        headers: getAuthHeaders()
      });
      if (optimizationResponse.ok) {
        const optimizationData = await optimizationResponse.json();
        setOptimizationRuns(optimizationData);
      }

      // Fetch system statistics
      const [storesResponse, warehousesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/get-stores`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/get-warehouses`, { headers: getAuthHeaders() }),
      ]);

      const storesData = storesResponse.ok ? await storesResponse.json() : [];
      const warehousesData = warehousesResponse.ok ? await warehousesResponse.json() : [];

      setSystemStats({
        totalStores: storesData.length,
        totalWarehouses: warehousesData.length,
        averageOptimizationTime: optimizationRuns.length > 0
          ? optimizationRuns.reduce((sum, run) => sum + run.execution_time_seconds, 0) / optimizationRuns.length
          : 0,
        totalOptimizationRuns: optimizationRuns.length,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return "success";
    if (efficiency >= 70) return "warning";
    return "error";
  };

  const calculateEfficiency = (run) => {
    // Calculate efficiency based on distance utilization and delivery success
    const maxDistance = 600; // km per day
    const avgDailyDistance = run.total_distance_km / 7;
    const distanceEfficiency = Math.min((avgDailyDistance / maxDistance) * 100, 100);
    return Math.round(distanceEfficiency);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox py={3} display="flex" justifyContent="center">
          <CircularProgress />
        </SoftBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Grid container spacing={3}>
            {/* System Overview Cards */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <DeliveryIcon color="primary" sx={{ mr: 1 }} />
                    <SoftTypography variant="h6">Total Stores</SoftTypography>
                  </Box>
                  <SoftTypography variant="h3" color="primary">
                    {systemStats.totalStores}
                  </SoftTypography>
                  <Typography variant="caption" color="textSecondary">
                    Active delivery locations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <SpeedIcon color="secondary" sx={{ mr: 1 }} />
                    <SoftTypography variant="h6">Avg. Generation Time</SoftTypography>
                  </Box>
                  <SoftTypography variant="h3" color="secondary">
                    {systemStats.averageOptimizationTime.toFixed(3)}s
                  </SoftTypography>
                  <Typography variant="caption" color="textSecondary">
                    Schedule optimization speed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AnalyticsIcon color="info" sx={{ mr: 1 }} />
                    <SoftTypography variant="h6">Total Runs</SoftTypography>
                  </Box>
                  <SoftTypography variant="h3" color="info">
                    {systemStats.totalOptimizationRuns}
                  </SoftTypography>
                  <Typography variant="caption" color="textSecondary">
                    Optimization executions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                    <SoftTypography variant="h6">System Status</SoftTypography>
                  </Box>
                  <SoftTypography variant="h3" color="success">
                    Optimal
                  </SoftTypography>
                  <Typography variant="caption" color="textSecondary">
                    Performance level
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Optimization Runs History */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <SoftTypography variant="h5" fontWeight="medium" mb={2}>
                    Optimization Runs History
                  </SoftTypography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {optimizationRuns.length === 0 ? (
                    <Alert severity="info">
                      No optimization runs found. Generate a schedule to see analytics.
                    </Alert>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Run ID</strong></TableCell>
                            <TableCell><strong>Week/Year</strong></TableCell>
                            <TableCell><strong>Stores Served</strong></TableCell>
                            <TableCell><strong>Total Distance</strong></TableCell>
                            <TableCell><strong>Execution Time</strong></TableCell>
                            <TableCell><strong>Efficiency</strong></TableCell>
                            <TableCell><strong>Created</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {optimizationRuns.slice(0, 10).map((run) => {
                            const efficiency = calculateEfficiency(run);
                            return (
                              <TableRow key={run.id}>
                                <TableCell>#{run.id}</TableCell>
                                <TableCell>
                                  Week {run.week_number}, {run.year}
                                </TableCell>
                                <TableCell>{run.stores_served}</TableCell>
                                <TableCell>
                                  {Math.round(run.total_distance_km * 100) / 100} km
                                </TableCell>
                                <TableCell>
                                  {run.execution_time_seconds.toFixed(3)}s
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={efficiency}
                                      color={getEfficiencyColor(efficiency)}
                                      sx={{ width: 60, height: 8 }}
                                    />
                                    <Chip
                                      label={`${efficiency}%`}
                                      color={getEfficiencyColor(efficiency)}
                                      size="small"
                                    />
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  {new Date(run.run_date).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Metrics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <SoftTypography variant="h6" fontWeight="medium" mb={2}>
                    Distance Utilization
                  </SoftTypography>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Daily capacity: 600 km
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={75}
                      color="primary"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      Average utilization: 75%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <SoftTypography variant="h6" fontWeight="medium" mb={2}>
                    Contract Distribution
                  </SoftTypography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Chip
                      label="COMEAU (3/week)"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label="COMDET (1/week)"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="caption" color="textSecondary" mt={1} display="block">
                    Contract types in the system
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </SoftBox>
      </SoftBox>
    </DashboardLayout>
  );
}

export default AnalyticsDashboard;

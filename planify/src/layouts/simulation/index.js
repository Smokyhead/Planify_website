/**
 * Simulation & Scenario Testing Dashboard
 * Enhanced Planify - Delivery Planning System
 */

import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  PlayArrow as SimulateIcon,
  Compare as CompareIcon,
  ExpandMore as ExpandMoreIcon,
  Science as ExperimentIcon,
} from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import { useAuth } from "context/AuthContext";

const API_BASE_URL = "http://localhost:3001/api";

function SimulationDashboard() {
  const { getAuthHeaders } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState({
    name: "Scenario 1",
    warehouse_id: 1,
    week_number: getCurrentWeek(),
    year: new Date().getFullYear(),
    max_daily_distance: 600,
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }

  const fetchWarehouses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-warehouses`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Failed to fetch warehouses");
      const data = await response.json();
      setWarehouses(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const runSimulation = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_BASE_URL}/generate-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(currentScenario),
      });

      if (!response.ok) throw new Error("Failed to run simulation");
      const data = await response.json();

      // Add scenario to results
      const newScenario = {
        ...currentScenario,
        id: Date.now(),
        results: data,
        timestamp: new Date().toISOString(),
      };

      setScenarios([newScenario, ...scenarios.slice(0, 4)]); // Keep last 5 scenarios
      setSuccess(`Simulation completed! Generated ${data.summary.total_deliveries} deliveries.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScenarioComparison = () => {
    if (scenarios.length < 2) return null;

    const latest = scenarios[0];
    const previous = scenarios[1];

    return {
      deliveries: latest.results.summary.total_deliveries - previous.results.summary.total_deliveries,
      distance: latest.results.summary.total_distance_km - previous.results.summary.total_distance_km,
      efficiency: ((latest.results.summary.total_deliveries / latest.results.summary.total_distance_km) -
        (previous.results.summary.total_deliveries / previous.results.summary.total_distance_km)) * 1000,
    };
  };

  const predefinedScenarios = [
    { name: "Conservative (500km)", max_daily_distance: 500 },
    { name: "Standard (600km)", max_daily_distance: 600 },
    { name: "Aggressive (800km)", max_daily_distance: 800 },
    { name: "Maximum (1000km)", max_daily_distance: 1000 },
  ];

  const comparison = getScenarioComparison();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Grid container spacing={3}>
            {/* Scenario Configuration */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <SoftTypography variant="h5" fontWeight="medium" mb={2}>
                    Scenario Configuration
                  </SoftTypography>

                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label="Scenario Name"
                      value={currentScenario.name}
                      onChange={(e) =>
                        setCurrentScenario({ ...currentScenario, name: e.target.value })
                      }
                    />
                  </Box>

                  <Box mb={2}>
                    <FormControl fullWidth>
                      <InputLabel>Warehouse</InputLabel>
                      <Select
                        value={currentScenario.warehouse_id}
                        onChange={(e) =>
                          setCurrentScenario({ ...currentScenario, warehouse_id: e.target.value })
                        }
                      >
                        {warehouses.map((warehouse) => (
                          <MenuItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.code} - {warehouse.location}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label="Week Number"
                      type="number"
                      value={currentScenario.week_number}
                      onChange={(e) =>
                        setCurrentScenario({ ...currentScenario, week_number: parseInt(e.target.value) })
                      }
                      inputProps={{ min: 1, max: 53 }}
                    />
                  </Box>

                  <Box mb={3}>
                    <Typography gutterBottom>
                      Max Daily Distance: {currentScenario.max_daily_distance} km
                    </Typography>
                    <Slider
                      value={currentScenario.max_daily_distance}
                      onChange={(e, value) =>
                        setCurrentScenario({ ...currentScenario, max_daily_distance: value })
                      }
                      min={300}
                      max={1200}
                      step={50}
                      marks={[
                        { value: 300, label: "300" },
                        { value: 600, label: "600" },
                        { value: 900, label: "900" },
                        { value: 1200, label: "1200" },
                      ]}
                    />
                  </Box>

                  <SoftButton
                    variant="gradient"
                    color="primary"
                    fullWidth
                    startIcon={loading ? <CircularProgress size={20} /> : <SimulateIcon />}
                    onClick={runSimulation}
                    disabled={loading}
                  >
                    {loading ? "Running..." : "Run Simulation"}
                  </SoftButton>

                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Quick Scenarios:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {predefinedScenarios.map((scenario) => (
                        <Chip
                          key={scenario.name}
                          label={scenario.name}
                          onClick={() =>
                            setCurrentScenario({ ...currentScenario, ...scenario })
                          }
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Results & Comparison */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <SoftTypography variant="h5" fontWeight="medium" mb={2}>
                    Simulation Results
                  </SoftTypography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {success}
                    </Alert>
                  )}

                  {comparison && (
                    <Box mb={3}>
                      <Typography variant="h6" mb={1}>
                        Comparison with Previous Scenario
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6" color={comparison.deliveries >= 0 ? "success.main" : "error.main"}>
                              {comparison.deliveries >= 0 ? "+" : ""}{comparison.deliveries}
                            </Typography>
                            <Typography variant="caption">Deliveries</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={4}>
                          <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6" color={comparison.distance <= 0 ? "success.main" : "warning.main"}>
                              {comparison.distance >= 0 ? "+" : ""}{Math.round(comparison.distance * 100) / 100}
                            </Typography>
                            <Typography variant="caption">Distance (km)</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={4}>
                          <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6" color={comparison.efficiency >= 0 ? "success.main" : "error.main"}>
                              {comparison.efficiency >= 0 ? "+" : ""}{Math.round(comparison.efficiency * 100) / 100}
                            </Typography>
                            <Typography variant="caption">Efficiency</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {scenarios.length === 0 ? (
                    <Alert severity="info">
                      Run your first simulation to see results and comparisons.
                    </Alert>
                  ) : (
                    <Box>
                      {scenarios.map((scenario, index) => (
                        <Accordion key={scenario.id} defaultExpanded={index === 0}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                              <Typography variant="h6">{scenario.name}</Typography>
                              <Box display="flex" gap={1}>
                                <Chip
                                  label={`${scenario.results.summary.total_deliveries} deliveries`}
                                  color="primary"
                                  size="small"
                                />
                                <Chip
                                  label={`${Math.round(scenario.results.summary.total_distance_km)} km`}
                                  color="secondary"
                                  size="small"
                                />
                                <Chip
                                  label={`${scenario.max_daily_distance}km limit`}
                                  color="info"
                                  size="small"
                                />
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Performance Metrics
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                  <Table size="small">
                                    <TableBody>
                                      <TableRow>
                                        <TableCell>Total Deliveries</TableCell>
                                        <TableCell>{scenario.results.summary.total_deliveries}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Total Distance</TableCell>
                                        <TableCell>{Math.round(scenario.results.summary.total_distance_km * 100) / 100} km</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Execution Time</TableCell>
                                        <TableCell>{scenario.results.summary.execution_time_seconds}s</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Stores Served</TableCell>
                                        <TableCell>{scenario.results.summary.stores_served}</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Daily Distance Distribution
                                </Typography>
                                <Grid container spacing={1}>
                                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, dayIndex) => (
                                    <Grid item xs key={day}>
                                      <Paper sx={{ p: 1, textAlign: "center" }} variant="outlined">
                                        <Typography variant="caption">{day}</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                          {Math.round(scenario.results.summary.daily_distances[dayIndex])}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </SoftBox>
      </SoftBox>
    </DashboardLayout>
  );
}

export default SimulationDashboard;

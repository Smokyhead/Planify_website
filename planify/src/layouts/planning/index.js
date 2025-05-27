/**
 * Planning Dashboard
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
  Chip,
} from "@mui/material";
import {
  PlayArrow as GenerateIcon,
  Download as ExportIcon,
  Assessment as AnalyticsIcon,
} from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import { useAuth } from "context/AuthContext";

const API_BASE_URL = "http://localhost:3001/api";

function Planning() {
  const { getAuthHeaders } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generationParams, setGenerationParams] = useState({
    warehouse_id: 1,
    week_number: getCurrentWeek(),
    year: new Date().getFullYear(),
    max_daily_distance: 600,
  });
  const [lastGeneration, setLastGeneration] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);

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

  const generateSchedule = async () => {
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
        body: JSON.stringify(generationParams),
      });

      if (!response.ok) throw new Error("Failed to generate schedule");
      const data = await response.json();

      setLastGeneration(data);
      setSuccess(`Schedule generated successfully! ${data.summary.total_deliveries} deliveries planned.`);

      // Fetch the formatted schedule data
      await fetchScheduleData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/export-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          week_number: generationParams.week_number,
          year: generationParams.year,
          warehouse_id: generationParams.warehouse_id,
          format: "json",
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch schedule data");
      const data = await response.json();
      setScheduleData(data);
    } catch (err) {
      console.error("Error fetching schedule data:", err);
    }
  };

  const exportSchedule = async (format) => {
    try {
      const response = await fetch(`${API_BASE_URL}/export-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          week_number: generationParams.week_number,
          year: generationParams.year,
          warehouse_id: generationParams.warehouse_id,
          format: format,
        }),
      });

      if (!response.ok) throw new Error("Failed to export schedule");

      if (format === "csv") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `delivery_schedule_week_${generationParams.week_number}_${generationParams.year}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess("CSV file downloaded successfully!");
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `delivery_schedule_week_${generationParams.week_number}_${generationParams.year}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess("JSON file downloaded successfully!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getDayColor = (hasDelivery, hasDelay) => {
    if (!hasDelivery) return "default";
    if (hasDelay) return "warning";
    return "success";
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Grid container spacing={3}>
            {/* Generation Parameters */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <SoftTypography variant="h5" fontWeight="medium" mb={2}>
                    Schedule Generation
                  </SoftTypography>

                  <Box mb={2}>
                    <FormControl fullWidth>
                      <InputLabel>Warehouse</InputLabel>
                      <Select
                        value={generationParams.warehouse_id}
                        onChange={(e) =>
                          setGenerationParams({ ...generationParams, warehouse_id: e.target.value })
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
                      value={generationParams.week_number}
                      onChange={(e) =>
                        setGenerationParams({ ...generationParams, week_number: parseInt(e.target.value) })
                      }
                      inputProps={{ min: 1, max: 53 }}
                    />
                  </Box>

                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label="Year"
                      type="number"
                      value={generationParams.year}
                      onChange={(e) =>
                        setGenerationParams({ ...generationParams, year: parseInt(e.target.value) })
                      }
                      inputProps={{ min: 2024, max: 2030 }}
                    />
                  </Box>

                  <Box mb={3}>
                    <Typography gutterBottom>
                      Max Daily Distance: {generationParams.max_daily_distance} km
                    </Typography>
                    <Slider
                      value={generationParams.max_daily_distance}
                      onChange={(e, value) =>
                        setGenerationParams({ ...generationParams, max_daily_distance: value })
                      }
                      min={300}
                      max={1000}
                      step={50}
                      marks={[
                        { value: 300, label: "300km" },
                        { value: 600, label: "600km" },
                        { value: 1000, label: "1000km" },
                      ]}
                    />
                  </Box>

                  <SoftButton
                    variant="gradient"
                    color="primary"
                    fullWidth
                    startIcon={loading ? <CircularProgress size={20} /> : <GenerateIcon />}
                    onClick={generateSchedule}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate Schedule"}
                  </SoftButton>
                </CardContent>
              </Card>
            </Grid>

            {/* Results Summary */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <SoftTypography variant="h5" fontWeight="medium" mb={2}>
                    Generation Results
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

                  {lastGeneration && (
                    <Box>
                      <Grid container spacing={2} mb={3}>
                        <Grid item xs={3}>
                          <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h4" color="primary">
                              {lastGeneration.summary.total_deliveries}
                            </Typography>
                            <Typography variant="caption">Total Deliveries</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={3}>
                          <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h4" color="secondary">
                              {lastGeneration.summary.total_distance_km}
                            </Typography>
                            <Typography variant="caption">Total Distance (km)</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={3}>
                          <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h4" color="info">
                              {lastGeneration.summary.stores_served}
                            </Typography>
                            <Typography variant="caption">Stores Served</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={3}>
                          <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h4" color="success">
                              {lastGeneration.summary.execution_time_seconds}s
                            </Typography>
                            <Typography variant="caption">Generation Time</Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Box mb={3}>
                        <Typography variant="h6" mb={1}>
                          Daily Distance Distribution
                        </Typography>
                        <Grid container spacing={1}>
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                            <Grid item xs key={day}>
                              <Paper sx={{ p: 1, textAlign: "center" }}>
                                <Typography variant="caption">{day}</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {lastGeneration.summary.daily_distances[index]} km
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>

                      <Box display="flex" gap={2}>
                        <SoftButton
                          variant="outlined"
                          color="info"
                          startIcon={<ExportIcon />}
                          onClick={() => exportSchedule("json")}
                        >
                          Export JSON
                        </SoftButton>
                        <SoftButton
                          variant="outlined"
                          color="success"
                          startIcon={<ExportIcon />}
                          onClick={() => exportSchedule("csv")}
                        >
                          Export CSV
                        </SoftButton>
                      </Box>
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

export default Planning;
/**
 * Schedule Visualization Dashboard
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  LocalShipping as DeliveryIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

const API_BASE_URL = "http://localhost:3001/api";

function ScheduleVisualization() {
  const [warehouses, setWarehouses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    warehouse_id: 1,
    week_number: getCurrentWeek(),
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (warehouses.length > 0) {
      fetchSchedules();
    }
  }, [filters, warehouses]);

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }

  const fetchWarehouses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-warehouses`);
      if (!response.ok) throw new Error("Failed to fetch warehouses");
      const data = await response.json();
      setWarehouses(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        warehouse_id: filters.warehouse_id,
      });

      const response = await fetch(
        `${API_BASE_URL}/schedules/${filters.week_number}/${filters.year}?${queryParams}`
      );

      if (!response.ok) throw new Error("Failed to fetch schedules");
      const data = await response.json();
      setSchedules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const groupSchedulesByDay = () => {
    const days = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    schedules.forEach((schedule) => {
      if (days[schedule.delivery_day_of_week]) {
        days[schedule.delivery_day_of_week].push(schedule);
      }
    });

    return days;
  };

  const getDeliveryChip = (contractType, hasDelay) => {
    let color = contractType === "COMEAU" ? "primary" : "secondary";
    if (hasDelay) color = "warning";

    return (
      <Chip
        label={contractType}
        color={color}
        size="small"
        icon={hasDelay ? <WarningIcon /> : <DeliveryIcon />}
      />
    );
  };

  const getDayStats = (daySchedules) => {
    const totalDistance = daySchedules.reduce((sum, s) => sum + parseFloat(s.estimated_distance_km || 0), 0);
    const delayedDeliveries = daySchedules.filter(s => s.delay_days > 0).length;

    return {
      totalDeliveries: daySchedules.length,
      totalDistance: Math.round(totalDistance * 100) / 100,
      delayedDeliveries,
    };
  };

  const groupedSchedules = groupSchedulesByDay();

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
            {/* Filters */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <SoftTypography variant="h4" fontWeight="medium" mb={2}>
                    Schedule Visualization
                  </SoftTypography>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Warehouse</InputLabel>
                        <Select
                          value={filters.warehouse_id}
                          onChange={(e) => setFilters({ ...filters, warehouse_id: e.target.value })}
                        >
                          {warehouses.map((warehouse) => (
                            <MenuItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.code} - {warehouse.location}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Week Number"
                        type="number"
                        value={filters.week_number}
                        onChange={(e) => setFilters({ ...filters, week_number: parseInt(e.target.value) })}
                        inputProps={{ min: 1, max: 53 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Year"
                        type="number"
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                        inputProps={{ min: 2024, max: 2030 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box display="flex" alignItems="center">
                        <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {schedules.length} total deliveries
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Weekly Schedule View */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <SoftTypography variant="h5" fontWeight="medium" mb={2}>
                    Week {filters.week_number}, {filters.year}
                  </SoftTypography>

                  {schedules.length === 0 ? (
                    <Alert severity="info">
                      No schedules found for the selected week. Generate a schedule first.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {Object.entries(groupedSchedules).map(([day, daySchedules]) => {
                        const stats = getDayStats(daySchedules);
                        return (
                          <Grid item xs={12} key={day}>
                            <Accordion>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                                  <Typography variant="h6">{day}</Typography>
                                  <Box display="flex" gap={2} alignItems="center">
                                    <Chip
                                      label={`${stats.totalDeliveries} deliveries`}
                                      color="primary"
                                      size="small"
                                    />
                                    <Chip
                                      label={`${stats.totalDistance} km`}
                                      color="secondary"
                                      size="small"
                                    />
                                    {stats.delayedDeliveries > 0 && (
                                      <Chip
                                        label={`${stats.delayedDeliveries} delayed`}
                                        color="warning"
                                        size="small"
                                        icon={<WarningIcon />}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails>
                                {daySchedules.length === 0 ? (
                                  <Typography color="textSecondary">No deliveries scheduled</Typography>
                                ) : (
                                  <TableContainer component={Paper}>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell><strong>Store</strong></TableCell>
                                          <TableCell><strong>Address</strong></TableCell>
                                          <TableCell><strong>Contract</strong></TableCell>
                                          <TableCell><strong>Distance</strong></TableCell>
                                          <TableCell><strong>Delay</strong></TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {daySchedules.map((schedule) => (
                                          <TableRow key={`${schedule.store_id}-${schedule.delivery_date}`}>
                                            <TableCell>
                                              <Typography variant="body2" fontWeight="bold">
                                                {schedule.store_code}
                                              </Typography>
                                              <Typography variant="caption" color="textSecondary">
                                                {schedule.store_name}
                                              </Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Typography variant="caption">
                                                {schedule.store_name} {/* Address would be here if available */}
                                              </Typography>
                                            </TableCell>
                                            <TableCell>
                                              {getDeliveryChip(schedule.contract_type, schedule.delay_days > 0)}
                                            </TableCell>
                                            <TableCell>
                                              {Math.round(parseFloat(schedule.estimated_distance_km || 0) * 100) / 100} km
                                            </TableCell>
                                            <TableCell>
                                              {schedule.delay_days > 0 ? (
                                                <Chip
                                                  label={`${schedule.delay_days} day(s)`}
                                                  color="warning"
                                                  size="small"
                                                />
                                              ) : (
                                                <Chip label="On time" color="success" size="small" />
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                )}
                              </AccordionDetails>
                            </Accordion>
                          </Grid>
                        );
                      })}
                    </Grid>
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

export default ScheduleVisualization;

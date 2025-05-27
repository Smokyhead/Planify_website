/**
 * Store Management Dashboard
 * Enhanced Planify - Delivery Planning System
 */

import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon, LocationOn as LocationIcon } from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

const API_BASE_URL = "http://localhost:3001/api";

function StoreManagement() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newStore, setNewStore] = useState({
    code: "",
    name: "",
    address: "",
    gps_lat: "",
    gps_lng: "",
    opening_hours: "08:00",
    closing_hours: "21:00",
    unloading_time_minutes: 30,
  });
  const [newContract, setNewContract] = useState({
    contract_type: "COMEAU",
    frequency_per_week: 3,
    start_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/get-stores`);
      if (!response.ok) throw new Error("Failed to fetch stores");
      const data = await response.json();
      setStores(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStore = async () => {
    try {
      // Add store
      const storeResponse = await fetch(`${API_BASE_URL}/add-store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStore),
      });

      if (!storeResponse.ok) throw new Error("Failed to add store");
      const storeData = await storeResponse.json();

      // Add contract
      const contractData = {
        store_id: storeData.id,
        ...newContract,
      };

      const contractResponse = await fetch(`${API_BASE_URL}/add-contract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contractData),
      });

      if (!contractResponse.ok) throw new Error("Failed to add contract");

      // Reset form and refresh data
      setNewStore({
        code: "",
        name: "",
        address: "",
        gps_lat: "",
        gps_lng: "",
        opening_hours: "08:00",
        closing_hours: "21:00",
        unloading_time_minutes: 30,
      });
      setNewContract({
        contract_type: "COMEAU",
        frequency_per_week: 3,
        start_date: new Date().toISOString().split('T')[0],
      });
      setOpenDialog(false);
      fetchStores();
    } catch (err) {
      setError(err.message);
    }
  };

  const getContractChip = (contractType, frequency) => {
    const color = contractType === "COMEAU" ? "primary" : "secondary";
    return (
      <Chip
        label={`${contractType} (${frequency}/week)`}
        color={color}
        size="small"
      />
    );
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
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <SoftTypography variant="h4" fontWeight="medium">
                      Store Management
                    </SoftTypography>
                    <SoftButton
                      variant="gradient"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenDialog(true)}
                    >
                      Add Store
                    </SoftButton>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Code</strong></TableCell>
                          <TableCell><strong>Store Name</strong></TableCell>
                          <TableCell><strong>Address</strong></TableCell>
                          <TableCell><strong>Contract</strong></TableCell>
                          <TableCell><strong>Hours</strong></TableCell>
                          <TableCell><strong>GPS</strong></TableCell>
                          <TableCell><strong>Unloading</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stores.map((store) => (
                          <TableRow key={store.id}>
                            <TableCell>{store.code}</TableCell>
                            <TableCell>{store.name}</TableCell>
                            <TableCell>{store.address}</TableCell>
                            <TableCell>
                              {store.contract_type ?
                                getContractChip(store.contract_type, store.frequency_per_week) :
                                <Chip label="No Contract" color="default" size="small" />
                              }
                            </TableCell>
                            <TableCell>
                              {store.opening_hours} - {store.closing_hours}
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <LocationIcon fontSize="small" color="action" />
                                <Typography variant="caption" ml={0.5}>
                                  {parseFloat(store.gps_lat).toFixed(4)}, {parseFloat(store.gps_lng).toFixed(4)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{store.unloading_time_minutes} min</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </SoftBox>

        {/* Add Store Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add New Store</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Store Code"
                  value={newStore.code}
                  onChange={(e) => setNewStore({ ...newStore, code: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Store Name"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={newStore.address}
                  onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="GPS Latitude"
                  type="number"
                  value={newStore.gps_lat}
                  onChange={(e) => setNewStore({ ...newStore, gps_lat: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="GPS Longitude"
                  type="number"
                  value={newStore.gps_lng}
                  onChange={(e) => setNewStore({ ...newStore, gps_lng: e.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Opening Hours"
                  type="time"
                  value={newStore.opening_hours}
                  onChange={(e) => setNewStore({ ...newStore, opening_hours: e.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Closing Hours"
                  type="time"
                  value={newStore.closing_hours}
                  onChange={(e) => setNewStore({ ...newStore, closing_hours: e.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Unloading Time (min)"
                  type="number"
                  value={newStore.unloading_time_minutes}
                  onChange={(e) => setNewStore({ ...newStore, unloading_time_minutes: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Contract Type</InputLabel>
                  <Select
                    value={newContract.contract_type}
                    onChange={(e) => {
                      const type = e.target.value;
                      setNewContract({
                        ...newContract,
                        contract_type: type,
                        frequency_per_week: type === "COMEAU" ? 3 : 1,
                      });
                    }}
                  >
                    <MenuItem value="COMEAU">COMEAU (3/week)</MenuItem>
                    <MenuItem value="COMDET">COMDET (1/week)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Contract Start Date"
                  type="date"
                  value={newContract.start_date}
                  onChange={(e) => setNewContract({ ...newContract, start_date: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddStore} variant="contained">
              Add Store
            </Button>
          </DialogActions>
        </Dialog>
      </SoftBox>
    </DashboardLayout>
  );
}

export default StoreManagement;

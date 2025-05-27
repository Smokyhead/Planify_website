import { capitalize } from "@mui/material";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import {
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  DialogContentText
} from "@mui/material";
import SoftInput from "components/SoftInput";

import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Table from "examples/Tables/Table";
import { useState, useEffect } from "react";
import { useAuth } from "context/AuthContext";

function MyWarehouses() {
  const { getAuthHeaders } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInactiveWarehouses, setShowInactiveWarehouses] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState(null);

  const columns = [
    { name: "Code", align: "left" },
    { name: "Localisation", align: "left" },
    { name: "Capacité KM", align: "left" },
    { name: "Horaire", align: "left" },
    { name: "Action", align: "center" },
  ];

  const rows = warehouses.map((wh) => ({
    Code: (
      <SoftTypography ml={2} variant="caption" color="secondary" fontWeight="medium">
        {wh.code}
      </SoftTypography>
    ),
    Localisation: (
      <SoftTypography variant="caption" color="secondary" fontWeight="medium">
        {wh.location}
      </SoftTypography>
    ),
    "Capacité KM": (
      <SoftTypography variant="caption" color="secondary" fontWeight="medium">
        {wh.capacity_km}
      </SoftTypography>
    ),
    Horaire: (
      <SoftTypography variant="caption" color="secondary" fontWeight="medium">
        {wh.schedule}
      </SoftTypography>
    ),
    Action: (
      <SoftBox display="flex" gap={1}>
        <Tooltip title={wh.active_status !== false ? "Modifier l&apos;entrepôt" : "Entrepôt inactif"}>
          <span>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditWarehouse(wh.id)}
              disabled={loading || wh.active_status === false}
            >
              <SoftTypography
                variant="caption"
                color={wh.active_status !== false ? "primary" : "secondary"}
                fontWeight="medium"
              >
                Edit
              </SoftTypography>
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={wh.active_status !== false ? "Supprimer l&apos;entrepôt" : "Entrepôt déjà supprimé"}>
          <span>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteWarehouse(wh)}
              disabled={loading || wh.active_status === false}
            >
              <SoftTypography
                variant="caption"
                color={wh.active_status !== false ? "error" : "secondary"}
                fontWeight="medium"
              >
                Delete
              </SoftTypography>
            </IconButton>
          </span>
        </Tooltip>
      </SoftBox>
    ),
  }));

  const [formData, setFormData] = useState({
    code: "",
    location: "",
    capacity_km: "",
    schedule: "",
    gps_lat: "",
    gps_lng: "",
    shifts: 1, // default 1 shift
    start1: "",
    end1: "",
    start2: "",
    end2: "",
  });

  const [editFormData, setEditFormData] = useState({
    code: "",
    location: "",
    capacity_km: "",
    schedule: "",
    gps_lat: "",
    gps_lng: "",
    active_status: true,
    shifts: 1,
    start1: "",
    end1: "",
    start2: "",
    end2: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const handleToggleAdd = () => {
    setShowAddForm((prev) => !prev);
  };

  ////////////////////

  const handleAddWarehouse = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:3001/api/add-warehouse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          code: formData.code,
          location: formData.location,
          capacity_km: formData.capacity_km,
          schedule: buildSchedule(),
          gps_lat: formData.gps_lat || null,
          gps_lng: formData.gps_lng || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to add warehouse');

      setSuccess('Entrepôt ajouté avec succès!');
      fetchWarehouses(); // Refresh data
      setShowAddForm(false);
      setFormData({
        code: "",
        location: "",
        capacity_km: "",
        schedule: "",
        gps_lat: "",
        gps_lng: "",
        shifts: 1,
        start1: "",
        end1: "",
        start2: "",
        end2: ""
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const url = `http://localhost:3001/api/get-warehouses${showInactiveWarehouses ? '?include_inactive=true' : ''}`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!res.ok) throw new Error('Failed to fetch warehouses');

      const data = await res.json();
      setWarehouses(data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération :", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [showInactiveWarehouses]);

  // Edit warehouse handler
  const handleEditWarehouse = async (warehouseId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/get-warehouse/${warehouseId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch warehouse');
      const warehouse = await response.json();

      // Parse schedule to extract shifts and times
      const scheduleData = parseSchedule(warehouse.schedule);

      setEditingWarehouse(warehouse);
      setEditFormData({
        code: warehouse.code,
        location: warehouse.location,
        capacity_km: warehouse.capacity_km,
        schedule: warehouse.schedule,
        gps_lat: warehouse.gps_lat || "",
        gps_lng: warehouse.gps_lng || "",
        active_status: warehouse.active_status !== false,
        ...scheduleData
      });
      setShowEditDialog(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update warehouse handler
  const handleUpdateWarehouse = async (e) => {
    e.preventDefault();
    if (!editingWarehouse) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/update-warehouse/${editingWarehouse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          code: editFormData.code,
          location: editFormData.location,
          capacity_km: editFormData.capacity_km,
          schedule: buildScheduleFromEditForm(),
          gps_lat: editFormData.gps_lat || null,
          gps_lng: editFormData.gps_lng || null,
          active_status: editFormData.active_status,
        }),
      });

      if (!response.ok) throw new Error('Failed to update warehouse');

      setSuccess('Entrepôt mis à jour avec succès!');
      setShowEditDialog(false);
      setEditingWarehouse(null);
      fetchWarehouses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete warehouse handler
  const handleDeleteWarehouse = (warehouse) => {
    setDeletingWarehouse(warehouse);
    setShowDeleteDialog(true);
    setError(null);
  };

  const confirmDeleteWarehouse = async () => {
    if (!deletingWarehouse) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/delete-warehouse/${deletingWarehouse.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to delete warehouse');

      setSuccess(`Entrepôt ${deletingWarehouse.code} supprimé avec succès!`);
      setShowDeleteDialog(false);
      setDeletingWarehouse(null);
      fetchWarehouses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteWarehouse = () => {
    setShowDeleteDialog(false);
    setDeletingWarehouse(null);
    setError(null);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const buildSchedule = () => {
    if (formData.shifts === 1) {
      return `${formData.start1} - ${formData.end1}`;
    } else {
      return `${formData.start1} - ${formData.end1}, ${formData.start2} - ${formData.end2}`;
    }
  };

  const buildScheduleFromEditForm = () => {
    if (editFormData.shifts === 1) {
      return `${editFormData.start1} - ${editFormData.end1}`;
    } else {
      return `${editFormData.start1} - ${editFormData.end1}, ${editFormData.start2} - ${editFormData.end2}`;
    }
  };

  const parseSchedule = (schedule) => {
    // Parse schedule string to extract shifts and times
    // Example: "08:00 - 12:00, 14:00 - 18:00" or "24/7" or "08:00 - 17:00"
    const defaultData = {
      shifts: 1,
      start1: "",
      end1: "",
      start2: "",
      end2: ""
    };

    if (!schedule || schedule === "24/7") {
      return defaultData;
    }

    const parts = schedule.split(',').map(part => part.trim());
    if (parts.length === 1) {
      // Single shift
      const timeMatch = parts[0].match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      if (timeMatch) {
        return {
          shifts: 1,
          start1: timeMatch[1],
          end1: timeMatch[2],
          start2: "",
          end2: ""
        };
      }
    } else if (parts.length === 2) {
      // Two shifts
      const time1Match = parts[0].match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      const time2Match = parts[1].match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      if (time1Match && time2Match) {
        return {
          shifts: 2,
          start1: time1Match[1],
          end1: time1Match[2],
          start2: time2Match[1],
          end2: time2Match[2]
        };
      }
    }

    return defaultData;
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox mb={3}>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftTypography textTransform={capitalize} variant="h6">
              Ajouter un entrepot
            </SoftTypography>
            {!showAddForm && (
              <SoftBox display="flex" alignItems="center">
                <SoftButton variant="gradient" color="info" size="small" onClick={handleToggleAdd}>
                  Ajouter
                </SoftButton>
              </SoftBox>
            )}
          </SoftBox>

          {error && (
            <SoftBox px={3}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </SoftBox>
          )}

          {success && (
            <SoftBox px={3}>
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            </SoftBox>
          )}
          {showAddForm && (
            <SoftBox px={3} pb={3}>
              <SoftBox>
                <Grid
                  container
                  spacing={3}
                  mb={3}
                  alignItems="center"
                  justifyContent="center"
                  direction="row"
                >
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <SoftInput
                      placeholder="Code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <SoftInput
                      placeholder="Localisation"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  spacing={3}
                  mb={3}
                  alignItems="center"
                  justifyContent="center"
                  direction="row"
                >
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <SoftInput
                      placeholder="Capacité en KM par jour"
                      name="capacity_km"
                      value={formData.capacity_km}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <select
                      name="shifts"
                      value={formData.shifts}
                      onChange={(e) => setFormData({ ...formData, shifts: Number(e.target.value) })}
                      style={{ width: "100%", height: "40px", borderRadius: "8px", padding: "5px" }}
                    >
                      <option value={1}>1 Poste</option>
                      <option value={2}>2 Postes</option>
                    </select>
                  </Grid>
                </Grid>
                <Grid
                  container
                  spacing={3}
                  mb={3}
                  alignItems="center"
                  justifyContent="center"
                  direction="row"
                >
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <SoftInput
                      placeholder="Latitude GPS (ex: 48.8566)"
                      name="gps_lat"
                      type="number"
                      step="any"
                      value={formData.gps_lat}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <SoftInput
                      placeholder="Longitude GPS (ex: 2.3522)"
                      name="gps_lng"
                      type="number"
                      step="any"
                      value={formData.gps_lng}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  {formData.shifts >= 1 && (
                    <>
                      <Grid item xs={12} sm={3} md={2} lg={2} xl={2}>
                        <SoftTypography>
                          <label style={{ fontSize: "14px", fontWeight: "bold" }}>Ouverture</label>
                        </SoftTypography>
                      </Grid>
                      <Grid item xs={12} sm={9} md={4} lg={4} xl={4}>
                        <SoftInput
                          type="time"
                          label="Heure d'ouverture"
                          name="start1"
                          value={formData.start1}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3} md={2} lg={2} xl={2}>
                        <SoftTypography>
                          <label style={{ fontSize: "14px", fontWeight: "bold" }}>Fermeture</label>
                        </SoftTypography>
                      </Grid>
                      <Grid item xs={12} sm={9} md={4} lg={4} xl={4}>
                        <SoftInput
                          type="time"
                          label="Heure de fermeture"
                          name="end1"
                          value={formData.end1}
                          onChange={handleInputChange}
                        />
                      </Grid>
                    </>
                  )}

                  {formData.shifts === 2 && (
                    <>
                      <Grid item xs={12} sm={3} md={2} lg={2} xl={2}>
                        <SoftTypography>
                          <label style={{ fontSize: "14px", fontWeight: "bold" }}>Ouverture</label>
                        </SoftTypography>
                      </Grid>
                      <Grid item xs={12} sm={9} md={4} lg={4} xl={4}>
                        <SoftInput
                          type="time"
                          label="Heure d'ouverture (Shift 2)"
                          name="start2"
                          value={formData.start2}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3} md={2} lg={2} xl={2}>
                        <SoftTypography>
                          <label style={{ fontSize: "14px", fontWeight: "bold" }}>Fermeture</label>
                        </SoftTypography>
                      </Grid>
                      <Grid item xs={12} sm={9} md={4} lg={4} xl={4}>
                        <SoftInput
                          type="time"
                          label="Heure de fermeture (Shift 2)"
                          name="end2"
                          value={formData.end2}
                          onChange={handleInputChange}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
                <Grid
                  container
                  spacing={3}
                  mb={3}
                  alignItems="center"
                  justifyContent="center"
                  direction="row"
                >
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <SoftButton
                      sx={{ width: "100%" }}
                      variant="gradient"
                      color="secondary"
                      size="medium"
                      onClick={handleToggleAdd}
                    >
                      Annuler
                    </SoftButton>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <SoftButton
                      sx={{ width: "100%" }}
                      variant="gradient"
                      color="primary"
                      size="medium"
                      onClick={handleAddWarehouse}
                    >
                      Soumettre
                    </SoftButton>
                  </Grid>
                </Grid>
              </SoftBox>
            </SoftBox>
          )}
        </Card>
      </SoftBox>

      {/* Liste des Entrepots */}
      <SoftBox>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftBox>
              <SoftTypography variant="h6">Mes entrepots ({warehouses.length})</SoftTypography>
              <FormControlLabel
                control={
                  <Switch
                    checked={showInactiveWarehouses}
                    onChange={(e) => setShowInactiveWarehouses(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <SoftTypography variant="caption" color="text">
                    Afficher les entrepôts inactifs
                  </SoftTypography>
                }
              />
            </SoftBox>
            <Tooltip title="Actualiser les entrepôts">
              <IconButton onClick={fetchWarehouses} disabled={loading}>
                <SoftTypography variant="caption" color="primary" fontWeight="medium">
                  ↻
                </SoftTypography>
              </IconButton>
            </Tooltip>
          </SoftBox>
          <SoftBox
            mb={3}
            sx={{
              "& .MuiTableRow-root:not(:last-child)": {
                "& td": {
                  borderBottom: ({ borders: { borderWidth, borderColor } }) =>
                    `${borderWidth[1]} solid ${borderColor}`,
                },
              },
            }}
          >
            {loading && warehouses.length === 0 ? (
              <SoftBox p={3} textAlign="center">
                <CircularProgress />
              </SoftBox>
            ) : warehouses.length === 0 ? (
              <SoftBox p={3} textAlign="center">
                <SoftTypography variant="body2" color="text">
                  Aucun entrepôt trouvé. Ajoutez votre premier entrepôt ci-dessus.
                </SoftTypography>
              </SoftBox>
            ) : (
              <Table columns={columns} rows={rows} />
            )}
          </SoftBox>
        </Card>
      </SoftBox>

      {/* Edit Warehouse Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <SoftTypography variant="h6">
            Modifier l&apos;entrepôt {editingWarehouse?.code}
          </SoftTypography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleUpdateWarehouse}>
            <Grid container spacing={3} mt={1}>
              <Grid item xs={12} sm={6}>
                <SoftInput
                  placeholder="Code"
                  name="code"
                  value={editFormData.code}
                  onChange={handleEditInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SoftInput
                  placeholder="Localisation"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SoftInput
                  placeholder="Capacité en KM par jour"
                  name="capacity_km"
                  value={editFormData.capacity_km}
                  onChange={handleEditInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editFormData.active_status}
                      onChange={handleEditInputChange}
                      name="active_status"
                    />
                  }
                  label="Entrepôt actif"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SoftInput
                  placeholder="Latitude GPS (ex: 48.8566)"
                  name="gps_lat"
                  type="number"
                  step="any"
                  value={editFormData.gps_lat}
                  onChange={handleEditInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SoftInput
                  placeholder="Longitude GPS (ex: 2.3522)"
                  name="gps_lng"
                  type="number"
                  step="any"
                  value={editFormData.gps_lng}
                  onChange={handleEditInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <select
                  name="shifts"
                  value={editFormData.shifts}
                  onChange={(e) => setEditFormData({ ...editFormData, shifts: Number(e.target.value) })}
                  style={{ width: "100%", height: "40px", borderRadius: "8px", padding: "5px" }}
                >
                  <option value={1}>1 Poste</option>
                  <option value={2}>2 Postes</option>
                </select>
              </Grid>
              <Grid item xs={12} sm={6}></Grid>
              {editFormData.shifts >= 1 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <SoftInput
                      type="time"
                      label="Heure d'ouverture"
                      name="start1"
                      value={editFormData.start1}
                      onChange={handleEditInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SoftInput
                      type="time"
                      label="Heure de fermeture"
                      name="end1"
                      value={editFormData.end1}
                      onChange={handleEditInputChange}
                    />
                  </Grid>
                </>
              )}
              {editFormData.shifts === 2 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <SoftInput
                      type="time"
                      label="Heure d'ouverture (Shift 2)"
                      name="start2"
                      value={editFormData.start2}
                      onChange={handleEditInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SoftInput
                      type="time"
                      label="Heure de fermeture (Shift 2)"
                      name="end2"
                      value={editFormData.end2}
                      onChange={handleEditInputChange}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleUpdateWarehouse}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Mettre à jour'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={cancelDeleteWarehouse}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <SoftTypography variant="h6" color="error">
            Confirmer la suppression
          </SoftTypography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <SoftTypography variant="body2" color="text">
              Êtes-vous sûr de vouloir supprimer cet entrepôt ?
            </SoftTypography>
            {deletingWarehouse && (
              <SoftBox mt={2} p={2} sx={{ backgroundColor: 'grey.100', borderRadius: 1 }}>
                <SoftTypography variant="body2" fontWeight="medium" color="text">
                  Entrepôt: {deletingWarehouse.code}
                </SoftTypography>
                <SoftTypography variant="body2" color="text">
                  Localisation: {deletingWarehouse.location}
                </SoftTypography>
                <SoftTypography variant="body2" color="text">
                  Capacité: {deletingWarehouse.capacity_km} km/jour
                </SoftTypography>
              </SoftBox>
            )}
            <SoftBox mt={2}>
              <Alert severity="warning">
                <SoftTypography variant="body2">
                  Cette action désactivera l&apos;entrepôt. Il ne sera plus visible dans la liste active mais restera dans la base de données.
                </SoftTypography>
              </Alert>
            </SoftBox>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={cancelDeleteWarehouse}
            disabled={loading}
            variant="outlined"
          >
            Annuler
          </Button>
          <Button
            onClick={confirmDeleteWarehouse}
            disabled={loading}
            variant="contained"
            color="error"
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default MyWarehouses;

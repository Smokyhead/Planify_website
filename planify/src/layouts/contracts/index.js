// @mui material components
import { capitalize } from "@mui/material";
import Card from "@mui/material/Card";
import {
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
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

import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Table from "examples/Tables/Table";
import { useState, useEffect } from "react";
import SoftInput from "components/SoftInput";
import Grid from "@mui/material/Grid";
import SoftBadge from "components/SoftBadge";
import { useAuth } from "context/AuthContext";

function MyContracts() {
  const { getAuthHeaders } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInactiveContracts, setShowInactiveContracts] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [deletingContract, setDeletingContract] = useState(null);
  const [formData, setFormData] = useState({
    store_id: '',
    contract_type: 'COMEAU',
    frequency_per_week: 3,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  });
  const [editFormData, setEditFormData] = useState({
    store_id: '',
    contract_type: 'COMEAU',
    frequency_per_week: 3,
    start_date: '',
    end_date: '',
    active_status: true,
  });

  useEffect(() => {
    fetchContracts();
    fetchStores();
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [showInactiveContracts]);

  const fetchContracts = async () => {
    try {
      const url = `http://localhost:3001/api/get-contracts${showInactiveContracts ? '?include_inactive=true' : ''}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch contracts');
      const data = await response.json();
      setContracts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/get-stores', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch stores');
      const data = await response.json();
      setStores(data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  const handleToggleAdd = () => {
    setShowAddForm((prev) => !prev);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/add-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add contract');

      setSuccess('Contract added successfully!');
      setFormData({
        store_id: '',
        contract_type: 'COMEAU',
        frequency_per_week: 3,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      });
      setShowAddForm(false);
      fetchContracts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditContract = async (contractId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/get-contract/${contractId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch contract');
      const contract = await response.json();

      setEditingContract(contract);
      setEditFormData({
        store_id: contract.store_id,
        contract_type: contract.contract_type,
        frequency_per_week: contract.frequency_per_week,
        start_date: contract.start_date ? contract.start_date.split('T')[0] : '',
        end_date: contract.end_date ? contract.end_date.split('T')[0] : '',
        active_status: contract.active_status,
      });
      setShowEditDialog(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContract = async (e) => {
    e.preventDefault();
    if (!editingContract) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/update-contract/${editingContract.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error('Failed to update contract');

      setSuccess('Contract updated successfully!');
      setShowEditDialog(false);
      setEditingContract(null);
      fetchContracts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = (contract) => {
    setDeletingContract(contract);
    setShowDeleteDialog(true);
    setError(null);
  };

  const confirmDeleteContract = async () => {
    if (!deletingContract) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/delete-contract/${deletingContract.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to delete contract');

      setSuccess(`Contract for ${deletingContract.store_name || `Store ${deletingContract.store_id}`} deleted successfully!`);
      setShowDeleteDialog(false);
      setDeletingContract(null);
      fetchContracts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteContract = () => {
    setShowDeleteDialog(false);
    setDeletingContract(null);
    setError(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Generate dynamic table data
  const generateTableData = () => {
    const columns = [
      { name: "Id", align: "center" },
      { name: "Type", align: "left" },
      { name: "Magasin", align: "left" },
      { name: "Fréquence", align: "left" },
      { name: "Status", align: "left" },
      { name: "Dates", align: "left" },
      { name: "Action", align: "center" },
    ];

    const rows = contracts.map((contract) => ({
      Id: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          {contract.id}
        </SoftTypography>
      ),
      Type: (
        <Chip
          label={contract.contract_type}
          color={contract.contract_type === 'COMEAU' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
      Magasin: (
        <SoftBox display="flex" flexDirection="column">
          <SoftTypography variant="caption" fontWeight="medium" color="text">
            {contract.store_name || `Store ${contract.store_id}`}
          </SoftTypography>
          <SoftTypography variant="caption" color="secondary">
            Code: {contract.store_code || contract.store_id}
          </SoftTypography>
        </SoftBox>
      ),
      Fréquence: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          {contract.frequency_per_week}/semaine
        </SoftTypography>
      ),
      Status: (
        <SoftBadge
          variant="gradient"
          badgeContent={contract.active_status ? "Actif" : "Supprimé"}
          color={contract.active_status ? "success" : "error"}
          size="xs"
          container
        />
      ),
      Dates: (
        <SoftBox display="flex" flexDirection="column">
          <SoftTypography variant="caption" color="text">
            Début: {new Date(contract.start_date).toLocaleDateString()}
          </SoftTypography>
          <SoftTypography variant="caption" color="secondary">
            Fin: {new Date(contract.end_date).toLocaleDateString()}
          </SoftTypography>
        </SoftBox>
      ),
      Action: (
        <SoftBox display="flex" gap={1}>
          <Tooltip title={contract.active_status ? "Modifier le contrat" : "Contrat inactif"}>
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEditContract(contract.id)}
                disabled={loading || !contract.active_status}
              >
                <SoftTypography
                  variant="caption"
                  color={contract.active_status ? "primary" : "secondary"}
                  fontWeight="medium"
                >
                  Edit
                </SoftTypography>
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={contract.active_status ? "Supprimer le contrat" : "Contrat déjà supprimé"}>
            <span>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteContract(contract)}
                disabled={loading || !contract.active_status}
              >
                <SoftTypography
                  variant="caption"
                  color={contract.active_status ? "error" : "secondary"}
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

    return { columns, rows };
  };

  const tableData = generateTableData();

  if (loading && contracts.length === 0) {
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
      <SoftBox mb={3}>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftTypography textTransform={capitalize} variant="h6">
              Ajouter un contrat
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
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Magasin</InputLabel>
                      <Select
                        name="store_id"
                        value={formData.store_id}
                        onChange={handleInputChange}
                        required
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Sélectionner un magasin
                        </MenuItem>
                        {stores.map((store) => (
                          <MenuItem key={store.id} value={store.id}>
                            {store.code} - {store.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Type de contrat</InputLabel>
                      <Select
                        name="contract_type"
                        value={formData.contract_type}
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="COMEAU">COMEAU</MenuItem>
                        <MenuItem value="COMDET">COMDET</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <SoftInput
                      placeholder="Fréquence par semaine"
                      type="number"
                      name="frequency_per_week"
                      value={formData.frequency_per_week}
                      onChange={handleInputChange}
                      inputProps={{ min: 1, max: 7 }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SoftInput
                      placeholder="Date de début"
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <SoftInput
                      placeholder="Date de fin"
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <SoftButton
                      variant="gradient"
                      color="success"
                      size="small"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Ajouter'}
                    </SoftButton>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SoftButton
                      variant="gradient"
                      color="error"
                      size="small"
                      onClick={handleToggleAdd}
                      type="button"
                    >
                      Annuler
                    </SoftButton>
                  </Grid>
                </Grid>
              </form>
            </SoftBox>
          )}
        </Card>
      </SoftBox>
      <SoftBox>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftBox>
              <SoftTypography variant="h6">Mes contrats ({contracts.length})</SoftTypography>
              <FormControlLabel
                control={
                  <Switch
                    checked={showInactiveContracts}
                    onChange={(e) => setShowInactiveContracts(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <SoftTypography variant="caption" color="text">
                    Afficher les contrats inactifs
                  </SoftTypography>
                }
              />
            </SoftBox>
            <Tooltip title="Actualiser les contrats">
              <IconButton onClick={fetchContracts} disabled={loading}>
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
            {contracts.length === 0 ? (
              <SoftBox p={3} textAlign="center">
                <SoftTypography variant="body2" color="text">
                  Aucun contrat trouvé. Ajoutez votre premier contrat ci-dessus.
                </SoftTypography>
              </SoftBox>
            ) : (
              <Table columns={tableData.columns} rows={tableData.rows} />
            )}
          </SoftBox>
        </Card>
      </SoftBox>

      {/* Edit Contract Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <SoftTypography variant="h6">
            Modifier le contrat {editingContract?.id}
          </SoftTypography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleUpdateContract}>
            <Grid container spacing={3} mt={1}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Magasin</InputLabel>
                  <Select
                    name="store_id"
                    value={editFormData.store_id}
                    onChange={handleEditInputChange}
                    required
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Sélectionner un magasin
                    </MenuItem>
                    {stores.map((store) => (
                      <MenuItem key={store.id} value={store.id}>
                        {store.code} - {store.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type de contrat</InputLabel>
                  <Select
                    name="contract_type"
                    value={editFormData.contract_type}
                    onChange={handleEditInputChange}
                    required
                  >
                    <MenuItem value="COMEAU">COMEAU</MenuItem>
                    <MenuItem value="COMDET">COMDET</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <SoftInput
                  placeholder="Fréquence par semaine"
                  type="number"
                  name="frequency_per_week"
                  value={editFormData.frequency_per_week}
                  onChange={handleEditInputChange}
                  inputProps={{ min: 1, max: 7 }}
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
                  label="Contrat actif"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SoftInput
                  placeholder="Date de début"
                  type="date"
                  name="start_date"
                  value={editFormData.start_date}
                  onChange={handleEditInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SoftInput
                  placeholder="Date de fin"
                  type="date"
                  name="end_date"
                  value={editFormData.end_date}
                  onChange={handleEditInputChange}
                  required
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleUpdateContract}
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
        onClose={cancelDeleteContract}
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
              Êtes-vous sûr de vouloir supprimer ce contrat ?
            </SoftTypography>
            {deletingContract && (
              <SoftBox mt={2} p={2} sx={{ backgroundColor: 'grey.100', borderRadius: 1 }}>
                <SoftTypography variant="body2" fontWeight="medium" color="text">
                  Contrat #{deletingContract.id}
                </SoftTypography>
                <SoftTypography variant="body2" color="text">
                  Magasin: {deletingContract.store_name || `Store ${deletingContract.store_id}`}
                </SoftTypography>
                <SoftTypography variant="body2" color="text">
                  Type: {deletingContract.contract_type}
                </SoftTypography>
                <SoftTypography variant="body2" color="text">
                  Fréquence: {deletingContract.frequency_per_week}/semaine
                </SoftTypography>
              </SoftBox>
            )}
            <SoftBox mt={2}>
              <Alert severity="warning">
                <SoftTypography variant="body2">
                  Cette action désactivera le contrat. Il ne sera plus visible dans la liste active mais restera dans la base de données.
                </SoftTypography>
              </Alert>
            </SoftBox>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={cancelDeleteContract}
            disabled={loading}
            variant="outlined"
          >
            Annuler
          </Button>
          <Button
            onClick={confirmDeleteContract}
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

export default MyContracts;

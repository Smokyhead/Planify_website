/**
 * Store Management Dashboard
 * Enhanced Planify - Delivery Planning System
 */

import { useState, useEffect } from 'react';
import { Chip } from '@mui/material';

// Soft UI Dashboard React components
import SoftBox from 'components/SoftBox';
import SoftTypography from 'components/SoftTypography';
import SoftBadge from 'components/SoftBadge';

// Soft UI Dashboard React examples
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';

// Shared components
import CRUDTable from 'components/shared/CRUDTable';
import CRUDForm from 'components/shared/CRUDForm';
import useCRUD from 'hooks/useCRUD';

const API_BASE_URL = 'http://localhost:3001/api';

function Stores() {
  const {
    data: stores,
    loading,
    error,
    success,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    clearMessages,
  } = useCRUD(`${API_BASE_URL}/get-stores`, 'magasin');

  const [showInactive, setShowInactive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    gps_lat: '',
    gps_lng: '',
    opening_hours: '08:00',
    closing_hours: '21:00',
    unloading_time_minutes: 30,
    active_status: true,
  });

  useEffect(() => {
    fetchAll(showInactive);
  }, [fetchAll, showInactive]);

  const handleAdd = () => {
    setEditingStore(null);
    setFormData({
      code: '',
      name: '',
      address: '',
      gps_lat: '',
      gps_lng: '',
      opening_hours: '08:00',
      closing_hours: '21:00',
      unloading_time_minutes: 30,
      active_status: true,
    });
    setShowForm(true);
    clearMessages();
  };

  const handleEdit = async (store) => {
    try {
      const storeData = await fetchOne(store.id);
      setEditingStore(storeData);
      setFormData({
        code: storeData.code || '',
        name: storeData.name || '',
        address: storeData.address || '',
        gps_lat: storeData.gps_lat || '',
        gps_lng: storeData.gps_lng || '',
        opening_hours: storeData.opening_hours || '08:00',
        closing_hours: storeData.closing_hours || '21:00',
        unloading_time_minutes: storeData.unloading_time_minutes || 30,
        active_status: storeData.active_status !== false,
      });
      setShowForm(true);
    } catch (err) {
      console.error('Error fetching store:', err);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingStore) {
        await update(editingStore.id, data);
      } else {
        await create(data);
      }
      setShowForm(false);
      fetchAll(showInactive);
    } catch (err) {
      console.error('Error saving store:', err);
    }
  };

  const handleDelete = async (store) => {
    try {
      await remove(store.id);
      fetchAll(showInactive);
    } catch (err) {
      console.error('Error deleting store:', err);
    }
  };

  const handleToggleInactive = (show) => {
    setShowInactive(show);
  };

  const handleRefresh = () => {
    fetchAll(showInactive);
  };

  // Table columns with render functions
  const tableColumns = [
    {
      name: 'Id',
      render: (store) => (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          {store.id}
        </SoftTypography>
      ),
    },
    {
      name: 'Code',
      render: (store) => (
        <SoftTypography variant="caption" fontWeight="medium" color="text">
          {store.code}
        </SoftTypography>
      ),
    },
    {
      name: 'Nom',
      render: (store) => (
        <SoftBox display="flex" flexDirection="column">
          <SoftTypography variant="caption" fontWeight="medium" color="text">
            {store.name}
          </SoftTypography>
          <SoftTypography variant="caption" color="secondary">
            GPS: {store.gps_lat}, {store.gps_lng}
          </SoftTypography>
        </SoftBox>
      ),
    },
    {
      name: 'Adresse',
      render: (store) => (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          {store.address}
        </SoftTypography>
      ),
    },
    {
      name: 'Horaires',
      render: (store) => (
        <SoftBox display="flex" flexDirection="column">
          <SoftTypography variant="caption" color="text">
            {store.opening_hours} - {store.closing_hours}
          </SoftTypography>
          <SoftTypography variant="caption" color="secondary">
            Déchargement: {store.unloading_time_minutes}min
          </SoftTypography>
        </SoftBox>
      ),
    },
    {
      name: 'Status',
      render: (store) => (
        <SoftBadge
          variant="gradient"
          badgeContent={store.active_status !== false ? 'Actif' : 'Supprimé'}
          color={store.active_status !== false ? 'success' : 'error'}
          size="xs"
          container
        />
      ),
    },
    {
      name: 'Contrat',
      render: (store) => (
        store.contract_type ? (
          <Chip
            label={`${store.contract_type} (${store.frequency_per_week}/sem)`}
            color={store.contract_type === 'COMEAU' ? 'primary' : 'secondary'}
            size="small"
          />
        ) : (
          <SoftTypography variant="caption" color="secondary">
            Aucun contrat
          </SoftTypography>
        )
      ),
    },
  ];

  // Form fields configuration
  const formFields = [
    {
      name: 'code',
      label: 'Code magasin',
      required: true,
      placeholder: 'Ex: ST001',
    },
    {
      name: 'name',
      label: 'Nom du magasin',
      required: true,
      placeholder: 'Ex: Magasin Paris Centre',
    },
    {
      name: 'address',
      label: 'Adresse complète',
      required: true,
      placeholder: 'Ex: 123 Rue de la Paix, 75001 Paris',
      gridSize: { xs: 12 },
    },
    {
      name: 'gps_lat',
      label: 'Latitude GPS',
      type: 'number',
      required: true,
      placeholder: 'Ex: 48.8566',
      inputProps: { step: 'any' },
    },
    {
      name: 'gps_lng',
      label: 'Longitude GPS',
      type: 'number',
      required: true,
      placeholder: 'Ex: 2.3522',
      inputProps: { step: 'any' },
    },
    {
      name: 'opening_hours',
      label: 'Heure d\'ouverture',
      type: 'time',
      required: true,
    },
    {
      name: 'closing_hours',
      label: 'Heure de fermeture',
      type: 'time',
      required: true,
    },
    {
      name: 'unloading_time_minutes',
      label: 'Temps de déchargement (minutes)',
      type: 'number',
      required: true,
      inputProps: { min: 1, max: 120 },
    },
  ];

  if (editingStore) {
    formFields.push({
      name: 'active_status',
      label: 'Magasin actif',
      type: 'switch',
      gridSize: { xs: 12 },
    });
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <CRUDTable
          title="Mes magasins"
          data={stores}
          columns={tableColumns}
          loading={loading}
          error={error}
          success={success}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          showInactive={showInactive}
          onToggleInactive={handleToggleInactive}
          addButtonText="Ajouter un magasin"
          entityName="magasin"
        />

        <CRUDForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
          title={editingStore ? `Modifier le magasin ${editingStore.code}` : 'Ajouter un nouveau magasin'}
          fields={formFields}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          error={error}
          isEdit={!!editingStore}
        />
      </SoftBox>
    </DashboardLayout>
  );
}

export default Stores;

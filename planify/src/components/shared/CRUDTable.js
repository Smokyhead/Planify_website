import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  CircularProgress,
} from '@mui/material';
import SoftBox from 'components/SoftBox';
import SoftTypography from 'components/SoftTypography';
import SoftButton from 'components/SoftButton';
import Table from 'examples/Tables/Table';

/**
 * Reusable CRUD Table Component
 * Eliminates table duplication across the application
 */
const CRUDTable = ({
  title,
  data = [],
  columns = [],
  loading = false,
  error = null,
  success = null,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  showInactive = false,
  onToggleInactive,
  addButtonText = 'Ajouter',
  entityName = 'élément',
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingItem && onDelete) {
      onDelete(deletingItem);
      setShowDeleteDialog(false);
      setDeletingItem(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeletingItem(null);
  };

  // Generate table data with action buttons
  const generateTableData = () => {
    const tableColumns = [
      ...columns,
      { name: "Action", align: "center" },
    ];

    const rows = data.map((item) => {
      const row = {};

      // Map data to columns
      columns.forEach(col => {
        if (col.render) {
          row[col.name] = col.render(item);
        } else if (col.field) {
          row[col.name] = (
            <SoftTypography variant="caption" color="secondary" fontWeight="medium">
              {item[col.field]}
            </SoftTypography>
          );
        }
      });

      // Add action buttons
      row.Action = (
        <SoftBox display="flex" gap={1}>
          <Tooltip title={item.active_status !== false ? `Modifier ${entityName}` : `${entityName} inactif`}>
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit && onEdit(item)}
                disabled={loading || item.active_status === false}
              >
                <SoftTypography
                  variant="caption"
                  color={item.active_status !== false ? "primary" : "secondary"}
                  fontWeight="medium"
                >
                  Edit
                </SoftTypography>
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={item.active_status !== false ? `Supprimer ${entityName}` : `${entityName} déjà supprimé`}>
            <span>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteClick(item)}
                disabled={loading || item.active_status === false}
              >
                <SoftTypography
                  variant="caption"
                  color={item.active_status !== false ? "error" : "secondary"}
                  fontWeight="medium"
                >
                  Delete
                </SoftTypography>
              </IconButton>
            </span>
          </Tooltip>
        </SoftBox>
      );

      return row;
    });

    return { columns: tableColumns, rows };
  };

  const tableData = generateTableData();

  return (
    <>
      <Card>
        <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
          <SoftBox>
            <SoftTypography variant="h6">{title} ({data.length})</SoftTypography>
            {onToggleInactive && (
              <FormControlLabel
                control={
                  <Switch
                    checked={showInactive}
                    onChange={(e) => onToggleInactive(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <SoftTypography variant="caption" color="text">
                    Afficher les éléments inactifs
                  </SoftTypography>
                }
              />
            )}
          </SoftBox>
          <SoftBox display="flex" gap={2}>
            {onRefresh && (
              <Tooltip title="Actualiser">
                <IconButton onClick={onRefresh} disabled={loading}>
                  <SoftTypography variant="caption" color="primary" fontWeight="medium">
                    ↻
                  </SoftTypography>
                </IconButton>
              </Tooltip>
            )}
            {onAdd && (
              <SoftButton variant="gradient" color="info" size="small" onClick={onAdd}>
                {addButtonText}
              </SoftButton>
            )}
          </SoftBox>
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

        <SoftBox>
          {loading && data.length === 0 ? (
            <SoftBox display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </SoftBox>
          ) : (
            <Table columns={tableData.columns} rows={tableData.rows} />
          )}
        </SoftBox>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleDeleteCancel}
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
              Êtes-vous sûr de vouloir supprimer cet {entityName} ?
            </SoftTypography>
            {deletingItem && (
              <SoftBox mt={2} p={2} sx={{ backgroundColor: 'grey.100', borderRadius: 1 }}>
                <SoftTypography variant="body2" fontWeight="medium" color="text">
                  {deletingItem.name || deletingItem.code || `ID: ${deletingItem.id}`}
                </SoftTypography>
              </SoftBox>
            )}
            <SoftBox mt={2}>
              <Alert severity="warning">
                <SoftTypography variant="body2">
                  Cette action désactivera l&apos;{entityName}. Il ne sera plus visible dans la liste active mais restera dans la base de données.
                </SoftTypography>
              </Alert>
            </SoftBox>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            disabled={loading}
            variant="outlined"
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={loading}
            variant="contained"
            color="error"
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

CRUDTable.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      render: PropTypes.func,
      field: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  success: PropTypes.string,
  onAdd: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onRefresh: PropTypes.func,
  showInactive: PropTypes.bool,
  onToggleInactive: PropTypes.func,
  addButtonText: PropTypes.string,
  entityName: PropTypes.string,
};

CRUDTable.defaultProps = {
  data: [],
  columns: [],
  loading: false,
  error: null,
  success: null,
  onAdd: null,
  onEdit: null,
  onDelete: null,
  onRefresh: null,
  showInactive: false,
  onToggleInactive: null,
  addButtonText: 'Ajouter',
  entityName: 'élément',
};

export default CRUDTable;

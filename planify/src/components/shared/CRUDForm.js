import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SoftBox from 'components/SoftBox';
import SoftTypography from 'components/SoftTypography';
import SoftInput from 'components/SoftInput';
import SoftButton from 'components/SoftButton';

/**
 * Reusable CRUD Form Component
 * Eliminates form duplication across the application
 */
const CRUDForm = ({
  open,
  onClose,
  onSubmit,
  title,
  fields,
  formData,
  setFormData,
  loading = false,
  error = null,
  isEdit = false,
}) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field) => {
    const {
      name,
      label,
      type = 'text',
      required = false,
      disabled = false,
      options = [],
      placeholder,
      inputProps = {},
      gridSize = { xs: 12, sm: 6 }
    } = field;

    const value = formData[name] || '';

    switch (type) {
      case 'select':
        return (
          <Grid item {...gridSize} key={name}>
            <FormControl fullWidth>
              <InputLabel>{label}</InputLabel>
              <Select
                name={name}
                value={value}
                onChange={handleInputChange}
                required={required}
                disabled={disabled}
                displayEmpty
              >
                {placeholder && (
                  <MenuItem value="" disabled>
                    {placeholder}
                  </MenuItem>
                )}
                {options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        );

      case 'switch':
        return (
          <Grid item {...gridSize} key={name}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(value)}
                  onChange={handleInputChange}
                  name={name}
                  disabled={disabled}
                />
              }
              label={label}
            />
          </Grid>
        );

      case 'textarea':
        return (
          <Grid item {...gridSize} key={name}>
            <SoftInput
              placeholder={placeholder || label}
              label={label}
              name={name}
              value={value}
              onChange={handleInputChange}
              required={required}
              disabled={disabled}
              multiline
              rows={4}
              {...inputProps}
            />
          </Grid>
        );

      default:
        return (
          <Grid item {...gridSize} key={name}>
            <SoftInput
              placeholder={placeholder || label}
              label={label}
              name={name}
              type={type}
              value={value}
              onChange={handleInputChange}
              required={required}
              disabled={disabled}
              {...inputProps}
            />
          </Grid>
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <SoftTypography variant="h6">
          {title}
        </SoftTypography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} mt={1}>
            {fields.map(renderField)}
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : (isEdit ? 'Mettre à jour' : 'Créer')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CRUDForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
      required: PropTypes.bool,
      disabled: PropTypes.bool,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
      placeholder: PropTypes.string,
      inputProps: PropTypes.object,
      gridSize: PropTypes.object,
    })
  ).isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  isEdit: PropTypes.bool,
};

CRUDForm.defaultProps = {
  loading: false,
  error: null,
  isEdit: false,
};

export default CRUDForm;

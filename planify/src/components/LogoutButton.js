/**
 * Logout Button Component
 * Enhanced Planify - Delivery Planning System
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  IconButton,
  Tooltip
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import SoftButton from 'components/SoftButton';

const LogoutButton = ({ variant = 'icon' }) => {
  const [open, setOpen] = React.useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/authentication/sign-in');
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (variant === 'button') {
    return (
      <>
        <SoftButton
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleClickOpen}
          size="small"
        >
          Logout
        </SoftButton>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-description"
        >
          <DialogTitle id="logout-dialog-title">
            Confirm Logout
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="logout-dialog-description">
              Are you sure you want to logout, {user?.name}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleLogout} color="error" autoFocus>
              Logout
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Tooltip title={`Logout (${user?.name})`}>
        <IconButton
          onClick={handleClickOpen}
          color="error"
          size="small"
        >
          <LogoutIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout, {user?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogoutButton;

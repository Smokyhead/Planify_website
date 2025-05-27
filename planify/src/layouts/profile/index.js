import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Avatar,
  Divider
} from "@mui/material";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import SoftButton from "components/SoftButton";
import SoftBadge from "components/SoftBadge";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Authentication
import { useAuth } from "context/AuthContext";

function Profile() {
  const { getAuthHeaders, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Profile form data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    role: ""
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/profile', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const userData = await response.json();
      setUser(userData);
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        department: userData.department || "",
        role: userData.role || ""
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      setSuccess('Profil mis à jour avec succès!');
      setIsEditing(false);
      fetchProfile(); // Refresh profile data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setSuccess('Mot de passe modifié avec succès!');
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'user': return 'info';
      default: return 'secondary';
    }
  };

  if (loading && !user) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox py={3}>
          <SoftBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </SoftBox>
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
                <SoftBox p={3}>
                  <SoftBox display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mr: 3,
                        bgcolor: 'primary.main',
                        fontSize: '2rem'
                      }}
                    >
                      {getInitials(user?.name)}
                    </Avatar>
                    <SoftBox>
                      <SoftTypography variant="h4" fontWeight="medium">
                        {user?.name || 'Utilisateur'}
                      </SoftTypography>
                      <SoftTypography variant="body2" color="text">
                        {user?.email}
                      </SoftTypography>
                      <SoftBox mt={1}>
                        <SoftBadge
                          variant="gradient"
                          badgeContent={user?.role || 'user'}
                          color={getRoleColor(user?.role)}
                          size="sm"
                        />
                      </SoftBox>
                    </SoftBox>
                  </SoftBox>

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

                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                      <Tab label="Informations personnelles" />
                      <Tab label="Sécurité" />
                      <Tab label="Activité" />
                    </Tabs>
                  </Box>

                  {/* Tab Content */}
                  {tabValue === 0 && (
                    <SoftBox>
                      <SoftBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <SoftTypography variant="h6">
                          Informations personnelles
                        </SoftTypography>
                        <SoftButton
                          variant={isEditing ? "outlined" : "gradient"}
                          color={isEditing ? "secondary" : "info"}
                          onClick={() => {
                            if (isEditing) {
                              // Reset form data
                              setProfileData({
                                name: user?.name || "",
                                email: user?.email || "",
                                phone: user?.phone || "",
                                department: user?.department || "",
                                role: user?.role || ""
                              });
                            }
                            setIsEditing(!isEditing);
                            setError(null);
                            setSuccess(null);
                          }}
                        >
                          {isEditing ? 'Annuler' : 'Modifier'}
                        </SoftButton>
                      </SoftBox>

                      <form onSubmit={handleUpdateProfile}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <SoftInput
                              placeholder="Nom complet"
                              label="Nom"
                              name="name"
                              value={profileData.name}
                              onChange={handleProfileInputChange}
                              disabled={!isEditing}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <SoftInput
                              placeholder="Email"
                              label="Email"
                              name="email"
                              type="email"
                              value={profileData.email}
                              onChange={handleProfileInputChange}
                              disabled={!isEditing}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <SoftInput
                              placeholder="Téléphone"
                              label="Téléphone"
                              name="phone"
                              value={profileData.phone}
                              onChange={handleProfileInputChange}
                              disabled={!isEditing}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <SoftInput
                              placeholder="Département"
                              label="Département"
                              name="department"
                              value={profileData.department}
                              onChange={handleProfileInputChange}
                              disabled={!isEditing}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <SoftInput
                              placeholder="Rôle"
                              label="Rôle"
                              name="role"
                              value={profileData.role}
                              onChange={handleProfileInputChange}
                              disabled={true} // Role should not be editable by user
                            />
                          </Grid>
                        </Grid>

                        {isEditing && (
                          <SoftBox mt={3} display="flex" gap={2}>
                            <SoftButton
                              type="submit"
                              variant="gradient"
                              color="success"
                              disabled={loading}
                            >
                              {loading ? <CircularProgress size={20} /> : 'Sauvegarder'}
                            </SoftButton>
                          </SoftBox>
                        )}
                      </form>
                    </SoftBox>
                  )}

                  {tabValue === 1 && (
                    <SoftBox>
                      <SoftTypography variant="h6" mb={3}>
                        Sécurité du compte
                      </SoftTypography>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <SoftBox p={3}>
                              <SoftTypography variant="h6" mb={2}>
                                Mot de passe
                              </SoftTypography>
                              <SoftTypography variant="body2" color="text" mb={3}>
                                Dernière modification: {formatDate(user?.updated_at) || 'Jamais'}
                              </SoftTypography>
                              <SoftButton
                                variant="gradient"
                                color="warning"
                                onClick={() => setShowPasswordDialog(true)}
                              >
                                Changer le mot de passe
                              </SoftButton>
                            </SoftBox>
                          </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <SoftBox p={3}>
                              <SoftTypography variant="h6" mb={2}>
                                Sessions
                              </SoftTypography>
                              <SoftTypography variant="body2" color="text" mb={3}>
                                Dernière connexion: {formatDate(user?.last_login)}
                              </SoftTypography>
                              <SoftButton
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                  logout();
                                  window.location.href = '/authentication/sign-in';
                                }}
                              >
                                Déconnecter toutes les sessions
                              </SoftButton>
                            </SoftBox>
                          </Card>
                        </Grid>
                      </Grid>
                    </SoftBox>
                  )}

                  {tabValue === 2 && (
                    <SoftBox>
                      <SoftTypography variant="h6" mb={3}>
                        Activité du compte
                      </SoftTypography>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <SoftBox p={3}>
                              <SoftTypography variant="subtitle2" color="text">
                                Compte créé
                              </SoftTypography>
                              <SoftTypography variant="h6">
                                {formatDate(user?.created_at)}
                              </SoftTypography>
                            </SoftBox>
                          </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <SoftBox p={3}>
                              <SoftTypography variant="subtitle2" color="text">
                                Dernière connexion
                              </SoftTypography>
                              <SoftTypography variant="h6">
                                {formatDate(user?.last_login) || 'Première connexion'}
                              </SoftTypography>
                            </SoftBox>
                          </Card>
                        </Grid>

                        <Grid item xs={12}>
                          <Card variant="outlined">
                            <SoftBox p={3}>
                              <SoftTypography variant="h6" mb={2}>
                                Statistiques d&apos;utilisation
                              </SoftTypography>
                              <Grid container spacing={2}>
                                <Grid item xs={6} md={3}>
                                  <SoftBox textAlign="center">
                                    <SoftTypography variant="h4" color="info">
                                      0
                                    </SoftTypography>
                                    <SoftTypography variant="caption" color="text">
                                      Contrats créés
                                    </SoftTypography>
                                  </SoftBox>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <SoftBox textAlign="center">
                                    <SoftTypography variant="h4" color="success">
                                      0
                                    </SoftTypography>
                                    <SoftTypography variant="caption" color="text">
                                      Entrepôts gérés
                                    </SoftTypography>
                                  </SoftBox>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <SoftBox textAlign="center">
                                    <SoftTypography variant="h4" color="warning">
                                      0
                                    </SoftTypography>
                                    <SoftTypography variant="caption" color="text">
                                      Plannings générés
                                    </SoftTypography>
                                  </SoftBox>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <SoftBox textAlign="center">
                                    <SoftTypography variant="h4" color="error">
                                      {user?.role === 'admin' ? 'Admin' : 'User'}
                                    </SoftTypography>
                                    <SoftTypography variant="caption" color="text">
                                      Niveau d&apos;accès
                                    </SoftTypography>
                                  </SoftBox>
                                </Grid>
                              </Grid>
                            </SoftBox>
                          </Card>
                        </Grid>
                      </Grid>
                    </SoftBox>
                  )}
                </SoftBox>
              </Card>
            </Grid>
          </Grid>
        </SoftBox>

        {/* Password Change Dialog */}
        <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <SoftTypography variant="h6">
              Changer le mot de passe
            </SoftTypography>
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleChangePassword}>
              <SoftBox mt={2}>
                <SoftInput
                  placeholder="Mot de passe actuel"
                  label="Mot de passe actuel"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                  fullWidth
                />
              </SoftBox>
              <SoftBox mt={2}>
                <SoftInput
                  placeholder="Nouveau mot de passe"
                  label="Nouveau mot de passe"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  required
                  fullWidth
                />
              </SoftBox>
              <SoftBox mt={2}>
                <SoftInput
                  placeholder="Confirmer le nouveau mot de passe"
                  label="Confirmer le nouveau mot de passe"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  required
                  fullWidth
                />
              </SoftBox>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPasswordDialog(false)} disabled={loading}>
              Annuler
            </Button>
            <Button
              onClick={handleChangePassword}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Changer le mot de passe'}
            </Button>
          </DialogActions>
        </Dialog>
      </SoftBox>
    </DashboardLayout>
  );
}

export default Profile;

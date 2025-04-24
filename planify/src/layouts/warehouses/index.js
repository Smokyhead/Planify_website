import { capitalize } from "@mui/material";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import SoftInput from "components/SoftInput";

import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Table from "examples/Tables/Table";
import { useState, useEffect } from "react";

function MyWarehouses() {
  const [warehouses, setWarehouses] = useState([]);

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
      <SoftTypography variant="caption" color="secondary" fontWeight="medium">
        EDIT
      </SoftTypography>
    ),
  }));

  const [formData, setFormData] = useState({
    code: "",
    location: "",
    capacity_km: "",
    schedule: "",
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
      await fetch("http://localhost:3001/api/add-warehouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      fetchWarehouses(); // Refresh data
      setShowAddForm(false);
      setFormData({ code: "", location: "", capacity_km: "", schedule: "" });
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/get-warehouses");
      const data = await res.json();
      setWarehouses(data);
    } catch (err) {
      console.error("Erreur lors de la récupération :", err);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

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
                    <SoftInput
                      placeholder="Horaire de travail"
                      name="schedule"
                      value={formData.schedule}
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
            <SoftTypography variant="h6">Mes entrepots</SoftTypography>
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
            <Table columns={columns} rows={rows} />
          </SoftBox>
        </Card>
      </SoftBox>
    </DashboardLayout>
  );
}

export default MyWarehouses;

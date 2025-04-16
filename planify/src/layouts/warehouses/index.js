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
import warehousesTableData from "layouts/warehouses/data/TableData";
import { useState } from "react";

function MyWarehouses() {
  const { columns, rows } = warehousesTableData;

  const [showAddForm, setShowAddForm] = useState(false);
  const handleToggleAdd = () => {
    setShowAddForm((prev) => !prev);
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
                    <SoftInput placeholder="Code"></SoftInput>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <SoftInput placeholder="Localisation"></SoftInput>
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
                    <SoftInput placeholder="Capacité en kilomètres par jour"></SoftInput>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <SoftInput placeholder="Horaire"></SoftInput>
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

// @mui material components
import { capitalize } from "@mui/material";
import Card from "@mui/material/Card";

import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Table from "examples/Tables/Table";
import contractsTableData from "layouts/contracts/data/TableData";
import { useState } from "react";
import SoftInput from "components/SoftInput";
import Grid from "@mui/material/Grid";

function MyContracts() {
  const { columns, rows } = contractsTableData;
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
                    <SoftInput placeholder="Type"></SoftInput>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <SoftInput placeholder="Magasin"></SoftInput>
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
                    <SoftInput placeholder="Fréquence"></SoftInput>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <SoftInput placeholder="Commentaire"></SoftInput>
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
      <SoftBox>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftTypography variant="h6">Mes contracts</SoftTypography>
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

export default MyContracts;

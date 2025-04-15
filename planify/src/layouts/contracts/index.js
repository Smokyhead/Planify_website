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

function MyContracts() {
  const { columns, rows } = contractsTableData;
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox mb={3}>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftTypography textTransform={capitalize} variant="h6">
              Ajouter un contrat
            </SoftTypography>
            <SoftBox display="flex" alignItems="center">
              <SoftButton
              variant="gradient"
              color="info"
              size="small"
              >Ajouter</SoftButton>
            </SoftBox>
          </SoftBox>
        </Card>
      </SoftBox>
      <SoftBox>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftTypography variant="h6">Mes contracts</SoftTypography>
          </SoftBox>
          <SoftBox mb={3}
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

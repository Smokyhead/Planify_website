// @mui material components
import { capitalize } from "@mui/material";
import Card from "@mui/material/Card";

import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Table from "examples/Tables/Table";
import authorsTableData from "layouts/warehouses/data/TableData";

function MyWarehouses() {
  const { columns, rows } = authorsTableData;
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox mb={3}>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftTypography textTransform={capitalize} variant="h6">
              Ajouter un entrepot
            </SoftTypography>
            <SoftBox display="flex" alignItems="center">
              <SoftButton
              variant="gradient"
              color="info"
              size="small"
              >Ajouter nouveau</SoftButton>
            </SoftBox>
          </SoftBox>
        </Card>
      </SoftBox>
      <SoftBox>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftTypography variant="h6">Mes entrepots</SoftTypography>
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

export default MyWarehouses;

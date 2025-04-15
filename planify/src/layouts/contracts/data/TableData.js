import SoftTypography from "components/SoftTypography";
import SoftBox from "components/SoftBox";
import SoftBadge from "components/SoftBadge";

const contractsTableData = {
  columns: [
    { name: "Id", align: "center" },
    { name: "Type", align: "left" },
    { name: "Magasin", align: "left" },
    { name: "Fréquence", align: "left" },
    { name: "Status", align: "left" },
    { name: "Commentaire", align: "left" },
    { name: "Action", align: "center" },
  ],

  rows: [
    {
      Id: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          1
        </SoftTypography>
      ),
      Type: (
        <SoftTypography
          textTransform="uppercase"
          variant="caption"
          color="secondary"
          fontWeight="medium"
        >
          comeau
        </SoftTypography>
      ),
      Magasin: (
        <SoftBox display="flex" flexDirection="column">
          <SoftTypography variant="caption" fontWeight="medium" color="text">
            Magasin 1
          </SoftTypography>
          <SoftTypography variant="caption" color="secondary">
            ID: 53
          </SoftTypography>
        </SoftBox>
      ),
      Fréquence: (
        <SoftTypography
          textTransform="capitalize"
          variant="caption"
          color="secondary"
          fontWeight="medium"
        >
          2/semaine
        </SoftTypography>
      ),
      Status: (
        <SoftBadge variant="gradient" badgeContent="Actif" color="success" size="xs" container />
      ),
      Commentaire: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          -
        </SoftTypography>
      ),
      Action: (
        <SoftTypography
          component="a"
          href="#"
          variant="caption"
          color="secondary"
          fontWeight="medium"
        >
          Edit
        </SoftTypography>
      ),
    },
    {
      Id: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          2
        </SoftTypography>
      ),
      Type: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          comprod1
        </SoftTypography>
      ),
      Magasin: (
        <SoftBox display="flex" flexDirection="column">
          <SoftTypography variant="caption" fontWeight="medium" color="text">
            Magasin 2
          </SoftTypography>
          <SoftTypography variant="caption" color="secondary">
            ID: 12
          </SoftTypography>
        </SoftBox>
      ),
      Fréquence: (
        <SoftTypography
          textTransform="capitalize"
          variant="caption"
          color="secondary"
          fontWeight="medium"
        >
          2/mois
        </SoftTypography>
      ),
      Status: (
        <SoftBadge
          variant="gradient"
          badgeContent="Non actif"
          color="secondary"
          size="xs"
          container
        />
      ),
      Commentaire: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          -
        </SoftTypography>
      ),
      Action: (
        <SoftTypography
          component="a"
          href="#"
          variant="caption"
          color="secondary"
          fontWeight="medium"
        >
          Edit
        </SoftTypography>
      ),
    },
    {
      Id: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          3
        </SoftTypography>
      ),
      Type: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          comprod3
        </SoftTypography>
      ),
      Magasin: (
        <SoftBox display="flex" flexDirection="column">
          <SoftTypography variant="caption" fontWeight="medium" color="text">
            Magasin 3
          </SoftTypography>
          <SoftTypography variant="caption" color="secondary">
            ID: 5
          </SoftTypography>
        </SoftBox>
      ),
      Fréquence: (
        <SoftTypography
          textTransform="capitalize"
          variant="caption"
          color="secondary"
          fontWeight="medium"
        >
          1/mois
        </SoftTypography>
      ),
      Status: (
        <SoftBadge variant="gradient" badgeContent="Actif" color="success" size="xs" container />
      ),
      Commentaire: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          -
        </SoftTypography>
      ),
      Action: (
        <SoftTypography
          component="a"
          href="#"
          variant="caption"
          color="secondary"
          fontWeight="medium"
        >
          Edit
        </SoftTypography>
      ),
    },
  ],
};

export default contractsTableData;

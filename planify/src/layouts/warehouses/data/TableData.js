import SoftTypography from "components/SoftTypography";

const authorsTableData = {
  columns: [
    { name: "Code", align: "center" },
    { name: "Localisation", align: "left" },
    { name: "Capacité KM", align: "left" },
    { name: "Horaire", align: "left" },
    { name: "Action", align: "center" },
  ],

  rows: [
    {
      Code: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          654321
        </SoftTypography>
      ),
      Localisation: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          Sfax (34.7406° N, 10.7603° E)
        </SoftTypography>
      ),
      "Capacité KM": (
        <SoftTypography
          textTransform="capitalize"
          variant="caption"
          color="secondary"
          fontWeight="medium"
        >
          600 Km/jour
        </SoftTypography>
      ),
      Horaire: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          08:00 - 12:00, 14:00 - 18:00
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
      Code: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          987125
        </SoftTypography>
      ),
      Localisation: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          Bizerte (37.2744° N, 9.8739° E)
        </SoftTypography>
      ),
      "Capacité KM": (
        <SoftTypography
          textTransform="capitalize"
          variant="caption"
          color="secondary"
          fontWeight="medium"
        >
          1000 Km/jour
        </SoftTypography>
      ),
      Horaire: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          07:00 - 13:00, 14:00 - 18:00
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
      Code: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          657159
        </SoftTypography>
      ),
      Localisation: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          Gabès (33.8815° N, 10.0982° E)
        </SoftTypography>
      ),
      "Capacité KM": (
        <SoftTypography
          textTransform="capitalize"
          variant="caption"
          color="secondary"
          fontWeight="medium"
        >
          350 Km/jour
        </SoftTypography>
      ),
      Horaire: (
        <SoftTypography variant="caption" color="secondary" fontWeight="medium">
          08:00 - 12:00, 14:00 - 18:00
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

export default authorsTableData;

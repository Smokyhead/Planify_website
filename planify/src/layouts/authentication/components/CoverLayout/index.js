// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import Card from "@mui/material/Card";

import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import PageLayout from "examples/LayoutContainers/PageLayout";

function CoverLayout({ color, header, title, description, image, top, children }) {
  return (
    <PageLayout>
      <DefaultNavbar
        action={{
          type: "external",
          route: "",
          label: "Se connecter",
          color: "dark",
        }}
      />
      <Grid
        container
        justifyContent="center"
        sx={{
          minHeight: "75vh",
          margin: 0,
        }}
      >
        <Grid item xs={11} sm={8} md={5} xl={3} mt={20}>
          <Card p={2} mt={top}>
            <SoftBox >
              <SoftBox pt={3} px={3}>
                {!header ? (
                  <>
                    <SoftBox mb={1}>
                      <SoftTypography variant="h3" fontWeight="bold" color={color} textGradient>
                        {title}
                      </SoftTypography>
                    </SoftBox>
                    <SoftTypography variant="body2" fontWeight="regular" color="text">
                      {description}
                    </SoftTypography>
                  </>
                ) : (
                  header
                )}
              </SoftBox>
              <SoftBox p={3}>{children}</SoftBox>
            </SoftBox>
          </Card>
        </Grid>
      </Grid>
    </PageLayout>
  );
}

// Setting default values for the props of CoverLayout
CoverLayout.defaultProps = {
  header: "",
  title: "",
  description: "",
  color: "info",
  top: 20,
};

// Typechecking props for the CoverLayout
CoverLayout.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
    "light",
  ]),
  header: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string.isRequired,
  top: PropTypes.number,
  children: PropTypes.node.isRequired,
};

export default CoverLayout;

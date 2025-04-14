import { forwardRef } from "react";

import PropTypes from "prop-types";

import SoftTypography from "components/SoftTypography";

import SoftProgressRoot from "components/SoftProgress/SoftProgressRoot";

const SoftProgress = forwardRef(({ variant, color, value, label, ...rest }, ref) => (
  <>
    {label && (
      <SoftTypography variant="button" fontWeight="medium" color="text">
        {value}%
      </SoftTypography>
    )}
    <SoftProgressRoot
      {...rest}
      ref={ref}
      variant="determinate"
      value={value}
      ownerState={{ color, value, variant }}
    />
  </>
));

// Setting default values for the props of SoftProgress
SoftProgress.defaultProps = {
  variant: "contained",
  color: "info",
  value: 0,
  label: false,
};

// Typechecking props for the SoftProgress
SoftProgress.propTypes = {
  variant: PropTypes.oneOf(["contained", "gradient"]),
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  value: PropTypes.number,
  label: PropTypes.bool,
};

export default SoftProgress;

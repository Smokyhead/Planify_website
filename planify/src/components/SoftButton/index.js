import { forwardRef } from "react";

import PropTypes from "prop-types";

import SoftButtonRoot from "components/SoftButton/SoftButtonRoot";

const SoftButton = forwardRef(
  ({ onClick, color, variant, size, circular, iconOnly, children, ...rest }, ref) => (
    <SoftButtonRoot
      {...rest}
      ref={ref}
      color="primary"
      variant={variant === "gradient" ? "contained" : variant}
      size={size}
      ownerState={{ color, variant, size, circular, iconOnly }}
      onClick={onClick}
    >
      {children}
    </SoftButtonRoot>
  )
);

// Setting default values for the props of SoftButton
SoftButton.defaultProps = {
  size: "medium",
  variant: "contained",
  color: "white",
  circular: false,
  iconOnly: false,
};

// Typechecking props for the SoftButton
SoftButton.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["text", "contained", "outlined", "gradient"]),
  color: PropTypes.oneOf([
    "white",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  circular: PropTypes.bool,
  iconOnly: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

export default SoftButton;

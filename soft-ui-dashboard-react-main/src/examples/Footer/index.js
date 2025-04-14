import SoftBox from "components/SoftBox";

function Footer() {

  return (
    <SoftBox
      width="100%"
      display="flex"
      flexDirection={{ xs: "column", lg: "row" }}
      justifyContent="space-between"
      alignItems="center"
      px={1.5}
    >
    </SoftBox>
  );
}

export default Footer;

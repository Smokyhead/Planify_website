// react-router-dom components
import * as React from "react";
import { Box } from "@mui/material";
import SoftBox from "components/SoftBox";
import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";
import CircularProgress from "@mui/material/CircularProgress";

function SignIn() {
  const [isLoading, setIsLoading] = React.useState(false);

  const navigate = useNavigate();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateInputs()) return;

    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    const startTime = Date.now();

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const timeElapsed = Date.now() - startTime;
      const waitTime = Math.max(3000 - timeElapsed, 0); // wait to complete 3s

      setTimeout(async () => {
        if (response.ok) {
          const result = await response.json();
          console.log("Login successful:", result);
          navigate("/tableau-de-bord", { state: { user: result.user } });
        } else {
          console.error("Login failed:", await response.text());
          // show error
        }

        setIsLoading(false);
      }, waitTime);
    } catch (err) {
      console.error("Login error:", err);
      setIsLoading(false);
    }
  };

  const validateInputs = () => {
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Veuillez entrer une adresse email valide.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  return (
    <CoverLayout
      title="Bienvenue"
      description="Entrer vos informations d'identification pour vous connecter à votre compte"
    >
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(83, 83, 83, 0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress sx={{ color: "#101d54" }} />
        </Box>
      )}
      <SoftBox>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth>
            <SoftBox mt={1}>
              <FormLabel htmlFor="email" sx={{ fontSize: "1rem", fontWeight: "bold" }}>
                Email
              </FormLabel>
            </SoftBox>
            <SoftInput
              fullWidth
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              type="email"
              name="email"
              placeholder="example@example.com"
              autoComplete="email"
              autoFocus
              required
              variant="outlined"
              color={emailError ? "error" : "primary"}
            />
          </FormControl>
          <FormControl fullWidth>
            <SoftBox mt={1}>
              <FormLabel htmlFor="password" sx={{ fontSize: "1rem", fontWeight: "bold" }}>
                Mot de passe
              </FormLabel>
            </SoftBox>
            <SoftInput
              fullWidth
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              required
              variant="outlined"
              color={passwordError ? "error" : "primary"}
            />
          </FormControl>

          <SoftBox mt={2} mb={1}>
            <SoftButton type="submit" variant="gradient" color="primary" fullWidth>
              Se connecter
            </SoftButton>
          </SoftBox>
        </form>
        <SoftBox
          component={Link}
          //to={route}
          mt={3}
          display="flex"
          alignItems="center"
          sx={{ cursor: "pointer", userSelect: "none" }}
        >
          <SoftTypography
            variant="button"
            fontWeight="regular"
            color={"dark"}
            textTransform="capitalize"
            sx={{ width: "100%", lineHeight: 0 }}
          >
            Mot de passe oublié ?
          </SoftTypography>
        </SoftBox>
      </SoftBox>
    </CoverLayout>
  );
}

export default SignIn;

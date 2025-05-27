// react-router-dom components
import * as React from "react";
import { Box, Alert } from "@mui/material";
import SoftBox from "components/SoftBox";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";
import CircularProgress from "@mui/material/CircularProgress";

function SignIn() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateInputs()) return;

    setIsLoading(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    try {
      console.log("Attempting login with:", email);
      const result = await login(email, password);
      console.log("Login result:", result);

      if (result.success) {
        // Redirect to the page they were trying to visit or dashboard
        const from = location.state?.from?.pathname || "/tableau-de-bord";
        console.log("Redirecting to:", from);
        navigate(from, { replace: true });
      } else {
        console.log("Login failed:", result.error);
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
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

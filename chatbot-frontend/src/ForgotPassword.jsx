import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Grid,
  InputLabel,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import Wrds from "././assets/Wrds White.webp";
import { useTheme, useMediaQuery } from "@mui/material";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleSubmit = async () => {
    if (!email) {
      toast.warn("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${apiBaseUrl}/api/ai/forgot-password`, {
        email,
      });
      toast.success(res.data.message || "Reset link sent to email");
      setEmail(""); // Clear email on success
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Something went wrong";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: isSmallScreen ? "flex-start" : "center",
          justifyContent: "space-between",
          px: { xs: 1, sm: 2, md: 2, lg: 2 },
          bgcolor: "#1268fb",
          zIndex: 100,
          width: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          height: { xs: "66px", sm: "63px", md: "84px", lg: "84px" },
          minHeight: { xs: "50px", sm: "55px", lg: "60px" },
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          py: isSmallScreen ? 1 : 0,
        }}
      >
        <img src={Wrds} height={53} width={155} alt="Logo" />
      </Box>

      {/* Main Content */}
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          p: { xs: 5, sm: 10, md: 2, lg: 2 },
          width: "100vw",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Grid item xs={12} sm={8} md={4}>
          <Grid
            container
            direction="column"
            alignItems="center"
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: "white",
              boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.35)",
            }}
          >
            <Typography variant="h5" textAlign="center">
              Forgot Password
            </Typography>

            <Typography
              variant="body2"
              sx={{ mt: 1, mb: 1, textAlign: "center" }}
            >
              Enter your registered email. We’ll send you a reset link.
            </Typography>

            <Box sx={{ width: "100%" }}>
              <InputLabel sx={{}}>
                Email <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <TextField
                fullWidth
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForgotPassword;

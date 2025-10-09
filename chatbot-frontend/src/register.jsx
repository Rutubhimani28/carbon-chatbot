// import React, { useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Link,
//   CircularProgress,
//   InputLabel,
// } from "@mui/material";
// import { useDispatch } from "react-redux";
// import { register } from "../store/slices/authSlice";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { Link as RouterLink } from "react-router-dom";

// const Register = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [generalError, setGeneralError] = useState("");

//   // Updated validation schema to match backend
//   const validationSchema = Yup.object({
//     username: Yup.string().required("Username is required"),
//     email: Yup.string().email("Invalid email").required("Email is required"),
//     password: Yup.string()
//       .min(6, "Password must be at least 6 characters")
//       .required("Password is required"),
//   });

//   const formik = useFormik({
//     initialValues: {
//       username: "",
//       email: "",
//       password: "",
//     },
//     validationSchema,
//     onSubmit: async (values) => {
//       setLoading(true);
//       setGeneralError("");
//       try {
//         const res = await dispatch(register(values));
//         if (res?.payload?.status === 201) {
//           toast.success("Register successful!");
//           navigate("/login");
//         } else {
//           setGeneralError(res?.payload?.error || "Registration failed");
//         }
//       } catch (err) {
//         setGeneralError(err?.message || "Registration failed");
//       } finally {
//         setLoading(false);
//       }
//     },
//   });

//   return (
//     <Box
//       sx={{
//         marginTop: 12,
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//       }}
//     >
//       <Box
//         sx={{
//           padding: 4,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           width: "100%",
//           maxWidth: 400,
//           border: "1px solid #ccc",
//           borderRadius: 4,
//           boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.35)",
//           boxSizing: "border-box",
//         }}
//       >
//         {generalError && (
//           <Typography color="error" sx={{ mb: 2 }}>
//             {generalError}
//           </Typography>
//         )}
//         <Typography component="h1" variant="h5">
//           Sign Up
//         </Typography>
//         <form
//           onSubmit={formik.handleSubmit}
//           style={{ width: "100%", marginTop: 16 }}
//         >
//           {/* Username */}
//           <Box sx={{ mb: 2 }}>
//             <InputLabel>
//               Username <span style={{ color: "red" }}>*</span>
//             </InputLabel>
//             <TextField
//               fullWidth
//               size="small"
//               name="username"
//               value={formik.values.username}
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               error={formik.touched.username && Boolean(formik.errors.username)}
//               helperText={formik.touched.username && formik.errors.username}
//             />
//           </Box>

//           {/* Email */}
//           <Box sx={{ mb: 2 }}>
//             <InputLabel>
//               Email <span style={{ color: "red" }}>*</span>
//             </InputLabel>
//             <TextField
//               fullWidth
//               size="small"
//               name="email"
//               value={formik.values.email}
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               error={formik.touched.email && Boolean(formik.errors.email)}
//               helperText={formik.touched.email && formik.errors.email}
//             />
//           </Box>

//           {/* Password */}
//           <Box sx={{ mb: 2 }}>
//             <InputLabel>
//               Password <span style={{ color: "red" }}>*</span>
//             </InputLabel>
//             <TextField
//               fullWidth
//               size="small"
//               type="password"
//               name="password"
//               value={formik.values.password}
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               error={formik.touched.password && Boolean(formik.errors.password)}
//               helperText={formik.touched.password && formik.errors.password}
//             />
//           </Box>

//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{ mt: 2, mb: 2 }}
//             disabled={loading}
//           >
//             {loading ? <CircularProgress size={24} /> : "Sign Up"}
//           </Button>

//           <Box sx={{ textAlign: "center" }}>
//             <span>Already have an account? </span>
//             <Link component={RouterLink} to="/login" variant="body2">
//               Sign In
//             </Link>
//           </Box>
//         </form>
//       </Box>
//     </Box>
//   );
// };

// export default Register;
// ------------------------------------------------------------------------

// import React, { useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Link,
//   CircularProgress,
//   InputLabel,
//   Alert,
// } from "@mui/material";
// import { useDispatch } from "react-redux";
// // import { register } from "../store/slices/authSlice";
// import { register } from "../store/slices/authSlice"; // This should now work
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { Link as RouterLink } from "react-router-dom";

// const Register = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [generalError, setGeneralError] = useState("");

//   const validationSchema = Yup.object({
//     username: Yup.string().required("Username is required"),
//     email: Yup.string().email("Invalid email").required("Email is required"),
//     password: Yup.string()
//       .min(6, "Password must be at least 6 characters")
//       .required("Password is required"),
//   });

//   const formik = useFormik({
//     initialValues: {
//       username: "",
//       email: "",
//       password: "",
//     },
//     validationSchema,
//     onSubmit: async (values) => {
//       setLoading(true);
//       setGeneralError("");
//       try {
//         const result = await dispatch(register(values));

//         if (result.payload?.status === 201) {
//           toast.success("Registration successful!");
//           navigate("/login");
//         } else {
//           const errorMsg = result.payload?.error || "Registration failed";
//           setGeneralError(errorMsg);
//           toast.error(errorMsg);
//         }
//       } catch (err) {
//         const errorMsg = err.response?.data?.error || "Registration failed";
//         setGeneralError(errorMsg);
//         toast.error(errorMsg);
//       } finally {
//         setLoading(false);
//       }
//     },
//   });

//   return (
//     <Box
//       sx={{
//         marginTop: 12,
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//       }}
//     >
//       <Box
//         sx={{
//           padding: 4,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           width: "100%",
//           maxWidth: 400,
//           border: "1px solid #ccc",
//           borderRadius: 4,
//           boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.35)",
//           boxSizing: "border-box",
//         }}
//       >
//         <Typography component="h1" variant="h5">
//           Sign Up
//         </Typography>

//         {generalError && (
//           <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
//             {generalError}
//           </Alert>
//         )}

//         <form
//           onSubmit={formik.handleSubmit}
//           style={{ width: "100%", marginTop: 16 }}
//         >
//           {/* Username */}
//           <Box sx={{ mb: 2 }}>
//             <InputLabel>
//               Username <span style={{ color: "red" }}>*</span>
//             </InputLabel>
//             <TextField
//               fullWidth
//               size="small"
//               name="username"
//               value={formik.values.username}
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               error={formik.touched.username && Boolean(formik.errors.username)}
//               helperText={formik.touched.username && formik.errors.username}
//             />
//           </Box>

//           {/* Email */}
//           <Box sx={{ mb: 2 }}>
//             <InputLabel>
//               Email <span style={{ color: "red" }}>*</span>
//             </InputLabel>
//             <TextField
//               fullWidth
//               size="small"
//               name="email"
//               value={formik.values.email}
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               error={formik.touched.email && Boolean(formik.errors.email)}
//               helperText={formik.touched.email && formik.errors.email}
//             />
//           </Box>

//           {/* Password */}
//           <Box sx={{ mb: 2 }}>
//             <InputLabel>
//               Password <span style={{ color: "red" }}>*</span>
//             </InputLabel>
//             <TextField
//               fullWidth
//               size="small"
//               type="password"
//               name="password"
//               value={formik.values.password}
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               error={formik.touched.password && Boolean(formik.errors.password)}
//               helperText={formik.touched.password && formik.errors.password}
//             />
//           </Box>

//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{ mt: 2, mb: 2 }}
//             disabled={loading}
//           >
//             {loading ? <CircularProgress size={24} /> : "Sign Up"}
//           </Button>

//           <Box sx={{ textAlign: "center" }}>
//             <span>Already have an account? </span>
//             <Link component={RouterLink} to="/login" variant="body2">
//               Sign In
//             </Link>
//           </Box>
//         </form>
//       </Box>
//     </Box>
//   );
// };

// export default Register;

// -----------------------------------------------------------

// import React, { useState } from "react";
// import axios from "axios";

// const Register = () => {
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//   });
//   const [message, setMessage] = useState("");

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     try {
//       const res = await axios.post(
//         "https://carbon-chatbot.onrender.com/api/ai/register",
//         formData
//       );
//       setMessage(res.data.message);
//     } catch (err) {
//       setMessage(err.response?.data?.error || "Registration failed");
//     }
//   };

//   return (
//     <div style={{ maxWidth: 400, margin: "auto" }}>
//       <h2>Register</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           name="username"
//           placeholder="Username"
//           value={formData.username}
//           onChange={handleChange}
//           required
//         />
//         <br />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />
//         <br />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />
//         <br />
//         <button type="submit">Register</button>
//       </form>
//       <p>{message}</p>
//     </div>
//   );
// };

// export default Register;

import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  InputLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${apiBaseUrl}/api/ai/register`, formData);

      setMessage(res.data.message);

      // ✅ success pachi login page par navigate
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        marginTop: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 400,
          border: "1px solid #ccc",
          borderRadius: 4,
          boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.35)",
        }}
      >
        {message && (
          <Typography
            color={message.includes("failed") ? "error" : "success.main"}
            sx={{ mb: 2 }}
          >
            {message}
          </Typography>
        )}

        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: 16 }}>
          {/* Username */}
          <Box sx={{ mb: 2 }}>
            <InputLabel>Username</InputLabel>
            <TextField
              fullWidth
              size="small"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Box>

          {/* Email */}
          <Box sx={{ mb: 2 }}>
            <InputLabel>Email</InputLabel>
            <TextField
              fullWidth
              size="small"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Box>

          {/* Password */}
          <Box sx={{ mb: 2}}>
            <InputLabel>Password</InputLabel>
            <TextField
              fullWidth
              size="small"
              // type="password"
              type={showPassword ? "text" : "password"} // 👁️ show/hide
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                     
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon />
                      ) : (
                        <VisibilityOutlinedIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {/* <Tooltip title={showPassword ? "Hide Password" : "Show Password"}>
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 40, // 👈 Adjust karo if alignment thodu off hoy
                }}
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon />
                ) : (
                  <VisibilityOutlinedIcon />
                )}
              </IconButton>
            </Tooltip> */}
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <span>Already have an account?</span>{" "}
            <Link component={RouterLink} to="/login" variant="body2">
              Sign In
            </Link>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Register;

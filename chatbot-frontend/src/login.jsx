// -------------------------------------------

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Alert,
//   Link,
//   CircularProgress,
//   InputLabel,
// } from "@mui/material";
// import { useDispatch, useSelector } from "react-redux";
// // import { login } from "../store/slices/authSlice";

// import { toast } from "react-toastify";
// import { Link as RouterLink } from "react-router-dom";

// const validationSchema = Yup.object({
//   username: Yup.string().required("Username is required"),
//   password: Yup.string().required("Password is required"),
// });

// const Login = () => {
//   const navigate = useNavigate();
//   const [error, setError] = useState("");
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(false);

//   const formik = useFormik({
//     initialValues: {
//       username: "",
//       password: "",
//     },
//     validationSchema,
//     onSubmit: async (values) => {
//       setLoading(true);
//       setError("");
//       try {
//         const result = await dispatch(login(values));

//         if (result.payload?.status === 200) {
//           // Store user data in localStorage
//           localStorage.setItem("user", JSON.stringify(result.payload.data));
//           toast.success("Login successful!");

//           // Navigate to home page after successful login
//           navigate("/");
//         } else {
//           const errorMsg = result.payload?.error || "Login failed!";
//           setError(errorMsg);
//           toast.error(errorMsg);
//         }
//       } catch (err) {
//         const errorMsg = err.response?.data?.error || "Login failed!";
//         setError(errorMsg);
//         toast.error(errorMsg);
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     },
//   });

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         marginTop: 30,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Box
//         elevation={3}
//         sx={{
//           padding: 4,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           width: "100%",
//           maxWidth: 400,
//           borderRadius: 4,
//           p: 4,
//           bgcolor: "white",
//           boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.35)",
//           boxSizing: "border-box",
//         }}
//       >
//         <Typography component="h1" variant="h5">
//           Sign In
//         </Typography>

//         {error && (
//           <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
//             {error}
//           </Alert>
//         )}

//         <form
//           onSubmit={formik.handleSubmit}
//           style={{ width: "100%", marginTop: 16 }}
//         >
//           <InputLabel sx={{ mt: 2 }}>
//             Username <span style={{ color: "red" }}>*</span>
//           </InputLabel>
//           <TextField
//             size="small"
//             required
//             fullWidth
//             id="username"
//             name="username"
//             autoComplete="username"
//             autoFocus
//             value={formik.values.username}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             error={formik.touched.username && Boolean(formik.errors.username)}
//             helperText={formik.touched.username && formik.errors.username}
//           />

//           <InputLabel sx={{ mt: 2 }}>
//             Password <span style={{ color: "red" }}>*</span>
//           </InputLabel>
//           <TextField
//             size="small"
//             required
//             fullWidth
//             name="password"
//             type="password"
//             id="password"
//             autoComplete="current-password"
//             value={formik.values.password}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             error={formik.touched.password && Boolean(formik.errors.password)}
//             helperText={formik.touched.password && formik.errors.password}
//           />

//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{ mt: 3, mb: 2 }}
//             disabled={formik.isSubmitting || loading}
//           >
//             {loading ? (
//               <CircularProgress size={24} color="inherit" />
//             ) : (
//               "Sign In"
//             )}
//           </Button>
//         </form>

//         <Box sx={{ textAlign: "center", mt: 1 }}>
//           <span>Don't have an account?</span>
//           <Link
//             component={RouterLink}
//             to="/register"
//             variant="body2"
//             onClick={(e) => e.stopPropagation()}
//             underline="hover"
//             sx={{ cursor: "pointer", ml: 0.5 }}
//           >
//             Sign Up
//           </Link>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default Login;
// --------------------------------------------------

// import React, { useState } from "react";
// import axios from "axios";

// const Login = () => {
//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//   });
//   const [message, setMessage] = useState("");
//   const [user, setUser] = useState(null);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     try {
//       const res = await axios.post(
//         "http://localhost:8080/api/ai/login",
//         formData
//       );
//       setMessage(res.data.message);
//       setUser(res.data.data); // user data save local state ma
//       localStorage.setItem("user", JSON.stringify(res.data.data)); // optional (refresh pachi pan data store rehse)
//     } catch (err) {
//       setMessage(err.response?.data?.error || "Login failed");
//     }
//   };

//   return (
//     <div style={{ maxWidth: 400, margin: "auto" }}>
//       <h2>Login</h2>
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
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />
//         <br />
//         <button type="submit">Login</button>
//       </form>
//       <p>{message}</p>

//       {user && (
//         <div>
//           <h3>Welcome, {user.username}</h3>
//           <p>Email: {user.email}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
  InputLabel,
} from "@mui/material";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/ai/login",
        formData
      );
      setMessage(res.data.message);

      setUser(res.data.data);
      localStorage.setItem("user", JSON.stringify(res.data.data));

      const userData = {
        id: res.data.data.id,
        username: res.data.data.username,
        email: res.data.data.email,
        // Add any other fields you need
      };
      localStorage.setItem("user", JSON.stringify(userData));

      // ✅ navigate to home after success
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        marginTop: 30,
        justifyContent: "center",
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
          borderRadius: 4,
          bgcolor: "white",
          boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.35)",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>

        {message && (
          <Alert
            severity={message.includes("failed") ? "error" : "success"}
            sx={{ mt: 2, width: "100%" }}
          >
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: 16 }}>
          {/* Username */}
          <InputLabel sx={{ mt: 2 }}>
            Username <span style={{ color: "red" }}>*</span>
          </InputLabel>
          <TextField
            size="small"
            required
            fullWidth
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
          />

          {/* Password */}
          <InputLabel sx={{ mt: 2 }}>
            Password <span style={{ color: "red" }}>*</span>
          </InputLabel>
          <TextField
            size="small"
            required
            fullWidth
            name="password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <Box sx={{ textAlign: "center", mt: 1 }}>
          <span>Don't have an account?</span>
          <Link
            component={RouterLink}
            to="/register"
            variant="body2"
            underline="hover"
            sx={{ cursor: "pointer" }}
          >
            {" Sign Up"}
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;

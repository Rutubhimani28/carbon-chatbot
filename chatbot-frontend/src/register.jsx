// // import React, { useState } from "react";
// // import { useFormik } from "formik";
// // import * as Yup from "yup";
// // import {
// //   Box,
// //   TextField,
// //   Button,
// //   Typography,
// //   Link,
// //   CircularProgress,
// //   InputLabel,
// // } from "@mui/material";
// // import { useDispatch } from "react-redux";
// // import { register } from "../store/slices/authSlice";
// // import { useNavigate } from "react-router-dom";
// // import { toast } from "react-toastify";
// // import { Link as RouterLink } from "react-router-dom";

// // const Register = () => {
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();
// //   const [loading, setLoading] = useState(false);
// //   const [generalError, setGeneralError] = useState("");

// //   // Updated validation schema to match backend
// //   const validationSchema = Yup.object({
// //     username: Yup.string().required("Username is required"),
// //     email: Yup.string().email("Invalid email").required("Email is required"),
// //     password: Yup.string()
// //       .min(6, "Password must be at least 6 characters")
// //       .required("Password is required"),
// //   });

// //   const formik = useFormik({
// //     initialValues: {
// //       username: "",
// //       email: "",
// //       password: "",
// //     },
// //     validationSchema,
// //     onSubmit: async (values) => {
// //       setLoading(true);
// //       setGeneralError("");
// //       try {
// //         const res = await dispatch(register(values));
// //         if (res?.payload?.status === 201) {
// //           toast.success("Register successful!");
// //           navigate("/login");
// //         } else {
// //           setGeneralError(res?.payload?.error || "Registration failed");
// //         }
// //       } catch (err) {
// //         setGeneralError(err?.message || "Registration failed");
// //       } finally {
// //         setLoading(false);
// //       }
// //     },
// //   });

// //   return (
// //     <Box
// //       sx={{
// //         marginTop: 12,
// //         display: "flex",
// //         flexDirection: "column",
// //         alignItems: "center",
// //       }}
// //     >
// //       <Box
// //         sx={{
// //           padding: 4,
// //           display: "flex",
// //           flexDirection: "column",
// //           alignItems: "center",
// //           width: "100%",
// //           maxWidth: 400,
// //           border: "1px solid #ccc",
// //           borderRadius: 4,
// //           boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.35)",
// //           boxSizing: "border-box",
// //         }}
// //       >
// //         {generalError && (
// //           <Typography color="error" sx={{ mb: 2 }}>
// //             {generalError}
// //           </Typography>
// //         )}
// //         <Typography component="h1" variant="h5">
// //           Sign Up
// //         </Typography>
// //         <form
// //           onSubmit={formik.handleSubmit}
// //           style={{ width: "100%", marginTop: 16 }}
// //         >
// //           {/* Username */}
// //           <Box sx={{ mb: 2 }}>
// //             <InputLabel>
// //               Username <span style={{ color: "red" }}>*</span>
// //             </InputLabel>
// //             <TextField
// //               fullWidth
// //               size="small"
// //               name="username"
// //               value={formik.values.username}
// //               onChange={formik.handleChange}
// //               onBlur={formik.handleBlur}
// //               error={formik.touched.username && Boolean(formik.errors.username)}
// //               helperText={formik.touched.username && formik.errors.username}
// //             />
// //           </Box>

// //           {/* Email */}
// //           <Box sx={{ mb: 2 }}>
// //             <InputLabel>
// //               Email <span style={{ color: "red" }}>*</span>
// //             </InputLabel>
// //             <TextField
// //               fullWidth
// //               size="small"
// //               name="email"
// //               value={formik.values.email}
// //               onChange={formik.handleChange}
// //               onBlur={formik.handleBlur}
// //               error={formik.touched.email && Boolean(formik.errors.email)}
// //               helperText={formik.touched.email && formik.errors.email}
// //             />
// //           </Box>

// //           {/* Password */}
// //           <Box sx={{ mb: 2 }}>
// //             <InputLabel>
// //               Password <span style={{ color: "red" }}>*</span>
// //             </InputLabel>
// //             <TextField
// //               fullWidth
// //               size="small"
// //               type="password"
// //               name="password"
// //               value={formik.values.password}
// //               onChange={formik.handleChange}
// //               onBlur={formik.handleBlur}
// //               error={formik.touched.password && Boolean(formik.errors.password)}
// //               helperText={formik.touched.password && formik.errors.password}
// //             />
// //           </Box>

// //           <Button
// //             type="submit"
// //             fullWidth
// //             variant="contained"
// //             sx={{ mt: 2, mb: 2 }}
// //             disabled={loading}
// //           >
// //             {loading ? <CircularProgress size={24} /> : "Sign Up"}
// //           </Button>

// //           <Box sx={{ textAlign: "center" }}>
// //             <span>Already have an account? </span>
// //             <Link component={RouterLink} to="/login" variant="body2">
// //               Sign In
// //             </Link>
// //           </Box>
// //         </form>
// //       </Box>
// //     </Box>
// //   );
// // };

// // export default Register;
// // ------------------------------------------------------------------------

// // import React, { useState } from "react";
// // import { useFormik } from "formik";
// // import * as Yup from "yup";
// // import {
// //   Box,
// //   TextField,
// //   Button,
// //   Typography,
// //   Link,
// //   CircularProgress,
// //   InputLabel,
// //   Alert,
// // } from "@mui/material";
// // import { useDispatch } from "react-redux";
// // // import { register } from "../store/slices/authSlice";
// // import { register } from "../store/slices/authSlice"; // This should now work
// // import { useNavigate } from "react-router-dom";
// // import { toast } from "react-toastify";
// // import { Link as RouterLink } from "react-router-dom";

// // const Register = () => {
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();
// //   const [loading, setLoading] = useState(false);
// //   const [generalError, setGeneralError] = useState("");

// //   const validationSchema = Yup.object({
// //     username: Yup.string().required("Username is required"),
// //     email: Yup.string().email("Invalid email").required("Email is required"),
// //     password: Yup.string()
// //       .min(6, "Password must be at least 6 characters")
// //       .required("Password is required"),
// //   });

// //   const formik = useFormik({
// //     initialValues: {
// //       username: "",
// //       email: "",
// //       password: "",
// //     },
// //     validationSchema,
// //     onSubmit: async (values) => {
// //       setLoading(true);
// //       setGeneralError("");
// //       try {
// //         const result = await dispatch(register(values));

// //         if (result.payload?.status === 201) {
// //           toast.success("Registration successful!");
// //           navigate("/login");
// //         } else {
// //           const errorMsg = result.payload?.error || "Registration failed";
// //           setGeneralError(errorMsg);
// //           toast.error(errorMsg);
// //         }
// //       } catch (err) {
// //         const errorMsg = err.response?.data?.error || "Registration failed";
// //         setGeneralError(errorMsg);
// //         toast.error(errorMsg);
// //       } finally {
// //         setLoading(false);
// //       }
// //     },
// //   });

// //   return (
// //     <Box
// //       sx={{
// //         marginTop: 12,
// //         display: "flex",
// //         flexDirection: "column",
// //         alignItems: "center",
// //       }}
// //     >
// //       <Box
// //         sx={{
// //           padding: 4,
// //           display: "flex",
// //           flexDirection: "column",
// //           alignItems: "center",
// //           width: "100%",
// //           maxWidth: 400,
// //           border: "1px solid #ccc",
// //           borderRadius: 4,
// //           boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.35)",
// //           boxSizing: "border-box",
// //         }}
// //       >
// //         <Typography component="h1" variant="h5">
// //           Sign Up
// //         </Typography>

// //         {generalError && (
// //           <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
// //             {generalError}
// //           </Alert>
// //         )}

// //         <form
// //           onSubmit={formik.handleSubmit}
// //           style={{ width: "100%", marginTop: 16 }}
// //         >
// //           {/* Username */}
// //           <Box sx={{ mb: 2 }}>
// //             <InputLabel>
// //               Username <span style={{ color: "red" }}>*</span>
// //             </InputLabel>
// //             <TextField
// //               fullWidth
// //               size="small"
// //               name="username"
// //               value={formik.values.username}
// //               onChange={formik.handleChange}
// //               onBlur={formik.handleBlur}
// //               error={formik.touched.username && Boolean(formik.errors.username)}
// //               helperText={formik.touched.username && formik.errors.username}
// //             />
// //           </Box>

// //           {/* Email */}
// //           <Box sx={{ mb: 2 }}>
// //             <InputLabel>
// //               Email <span style={{ color: "red" }}>*</span>
// //             </InputLabel>
// //             <TextField
// //               fullWidth
// //               size="small"
// //               name="email"
// //               value={formik.values.email}
// //               onChange={formik.handleChange}
// //               onBlur={formik.handleBlur}
// //               error={formik.touched.email && Boolean(formik.errors.email)}
// //               helperText={formik.touched.email && formik.errors.email}
// //             />
// //           </Box>

// //           {/* Password */}
// //           <Box sx={{ mb: 2 }}>
// //             <InputLabel>
// //               Password <span style={{ color: "red" }}>*</span>
// //             </InputLabel>
// //             <TextField
// //               fullWidth
// //               size="small"
// //               type="password"
// //               name="password"
// //               value={formik.values.password}
// //               onChange={formik.handleChange}
// //               onBlur={formik.handleBlur}
// //               error={formik.touched.password && Boolean(formik.errors.password)}
// //               helperText={formik.touched.password && formik.errors.password}
// //             />
// //           </Box>

// //           <Button
// //             type="submit"
// //             fullWidth
// //             variant="contained"
// //             sx={{ mt: 2, mb: 2 }}
// //             disabled={loading}
// //           >
// //             {loading ? <CircularProgress size={24} /> : "Sign Up"}
// //           </Button>

// //           <Box sx={{ textAlign: "center" }}>
// //             <span>Already have an account? </span>
// //             <Link component={RouterLink} to="/login" variant="body2">
// //               Sign In
// //             </Link>
// //           </Box>
// //         </form>
// //       </Box>
// //     </Box>
// //   );
// // };

// // export default Register;

// // -----------------------------------------------------------

// // import React, { useState } from "react";
// // import axios from "axios";

// // const Register = () => {
// //   const [formData, setFormData] = useState({
// //     username: "",
// //     email: "",
// //     password: "",
// //   });
// //   const [message, setMessage] = useState("");

// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setMessage("");

// //     try {
// //       const res = await axios.post(
// //         "https://carbon-chatbot.onrender.com/api/ai/register",
// //         formData
// //       );
// //       setMessage(res.data.message);
// //     } catch (err) {
// //       setMessage(err.response?.data?.error || "Registration failed");
// //     }
// //   };

// //   return (
// //     <div style={{ maxWidth: 400, margin: "auto" }}>
// //       <h2>Register</h2>
// //       <form onSubmit={handleSubmit}>
// //         <input
// //           type="text"
// //           name="username"
// //           placeholder="Username"
// //           value={formData.username}
// //           onChange={handleChange}
// //           required
// //         />
// //         <br />
// //         <input
// //           type="email"
// //           name="email"
// //           placeholder="Email"
// //           value={formData.email}
// //           onChange={handleChange}
// //           required
// //         />
// //         <br />
// //         <input
// //           type="password"
// //           name="password"
// //           placeholder="Password"
// //           value={formData.password}
// //           onChange={handleChange}
// //           required
// //         />
// //         <br />
// //         <button type="submit">Register</button>
// //       </form>
// //       <p>{message}</p>
// //     </div>
// //   );
// // };

// // export default Register;

// import React, { useState } from "react";
// import { useNavigate, Link as RouterLink } from "react-router-dom";
// import axios from "axios";
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Link,
//   CircularProgress,
//   InputLabel,
//   IconButton,
//   InputAdornment,
// } from "@mui/material";
// import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

// const Register = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//   });
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setLoading(true);

//     try {
//       const res = await axios.post(`${apiBaseUrl}/api/ai/register`, formData);
//       setMessage(res.data.message);

//       // ✅ success pachi login page par navigate
//       setTimeout(() => {
//         navigate("/login");
//       }, 1000);
//     } catch (err) {
//       setMessage(err.response?.data?.error || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

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
//         }}
//       >
//         {message && (
//           <Typography
//             color={message.includes("failed") ? "error" : "success.main"}
//             sx={{ mb: 2 }}
//           >
//             {message}
//           </Typography>
//         )}

//         <Typography component="h1" variant="h5">
//           Sign Up
//         </Typography>

//         <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: 16 }}>
//           {/* Username */}
//           <Box sx={{ mb: 2 }}>
//             <InputLabel>Username</InputLabel>
//             <TextField
//               fullWidth
//               size="small"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               required
//             />
//           </Box>

//           {/* Email */}
//           <Box sx={{ mb: 2 }}>
//             <InputLabel>Email</InputLabel>
//             <TextField
//               fullWidth
//               size="small"
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </Box>

//           {/* Password */}
//           <Box sx={{ mb: 2 }}>
//             <InputLabel>Password</InputLabel>
//             <TextField
//               fullWidth
//               size="small"
//               // type="password"
//               type={showPassword ? "text" : "password"} // 👁️ show/hide
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton
//                       onClick={() => setShowPassword(!showPassword)}
//                       edge="end"
//                     >
//                       {showPassword ? (
//                         <VisibilityOffOutlinedIcon />
//                       ) : (
//                         <VisibilityOutlinedIcon />
//                       )}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//             />
//             {/* <Tooltip title={showPassword ? "Hide Password" : "Show Password"}>
//               <IconButton
//                 onClick={() => setShowPassword(!showPassword)}
//                 sx={{
//                   position: "absolute",
//                   right: 8,
//                   top: 40, // 👈 Adjust karo if alignment thodu off hoy
//                 }}
//               >
//                 {showPassword ? (
//                   <VisibilityOffOutlinedIcon />
//                 ) : (
//                   <VisibilityOutlinedIcon />
//                 )}
//               </IconButton>
//             </Tooltip> */}
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
//             <span>Already have an account?</span>{" "}
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
  MenuItem,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Words2 from "././assets/words2.png"; // path adjust karo
import { useTheme, useMediaQuery } from "@mui/material";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    // country: "",
    dateOfBirth: null,
    ageGroup: "",
    parentName: "",
    parentEmail: "",
    parentMobile: "",
    subscriptionPlan: "",
    childPlan: "",
    subscriptionType: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // Country options
  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "India",
    "Germany",
    "France",
    "Japan",
    "Brazil",
    "Other",
  ];
  const ageGroups = ["<13", "13-14", "15-17", "18+"];
  const subscriptionPlans = ["Nova", "Supernova"];
  const novaOptions = ["Glow Up", "Level Up", "Rise Up"];
  const superNovaOptions = ["Step Up", "Speed Up", "Scale Up"];
  const subscriptionTypes = ["Monthly", "Yearly"];

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.mobile ||
      !formData.dateOfBirth ||
      !formData.ageGroup ||
      !formData.subscriptionPlan ||
      !formData.childPlan ||
      !formData.subscriptionType
    ) {
      toast.error("Please fill all required fields!");
      setLoading(false);
      return;
    }

    // Password length validation
    // if (formData.password.length < 6) {
    //   toast.error("Password must be at least 6 characters long!");
    //   setLoading(false);
    //   return;
    // }

    // EMAIL VALIDATION
    if (formData.ageGroup !== "<13" && !formData.email) {
      toast.error("Email is required for users aged 13 or above.");
      setLoading(false);
      return;
    }

    // PARENT VALIDATION
    if (["<13", "13-14", "15-17"].includes(formData.ageGroup)) {
      if (
        !formData.parentName ||
        !formData.parentEmail ||
        !formData.parentMobile
      ) {
        toast.error("Parent details are required for users under 18.");
        setLoading(false);
        return;
      }
    }

    // CONSENT VALIDATION
    if (!formData.agree) {
      toast.error("Please agree to the consent before submitting.");
      setLoading(false);
      return;
    }

    // Prepare data for backend
    const submitData = {
      ...formData,
      email:
        formData.ageGroup === "<13" ? formData.parentEmail : formData.email,
      dateOfBirth: formData.dateOfBirth
        ? formData.dateOfBirth.toISOString().split("T")[0]
        : null,
    };

    try {
      const res = await axios.post(`${apiBaseUrl}/api/ai/register`, submitData);
      console.log(res);
      // ✅ Success toaster
      toast.success("Registration successful! Redirecting to login...");

      // Form reset
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        dateOfBirth: null,
        ageGroup: "",
        parentName: "",
        parentEmail: "",
        parentMobile: "",
        subscriptionPlan: "",
        childPlan: "",
        subscriptionType: "",
        agree: false,
      });

      // ✅ Success pachi login page par navigate
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.details ||
        "Registration failed";
      // ✅ Error toaster
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <>
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
            // height: isSmallScreen
            //   ? "auto"
            height: { xs: "80px", sm: "85px", lg: "102px" },
            minHeight: isSmallScreen ? "75px" : "102px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            py: isSmallScreen ? 1 : 0,
          }}
        >
          {/* HEADER CONTENT */}
          <img src={Words2} height={90} width={180} alt="Logo" />
        </Box>

        {/* <Box
          sx={{
            marginTop: { xs: 1, sm: 4, md: 8 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: { xs: 1, sm: 2, md: 2 },
            width: "100vw", // 🔹 Full width on mobile
            maxWidth: "100%", // 🔹 Prevent overflow
            height: "100vh", // full screen height
              // overflowY: "auto", // content scroll only
              // overflowX: "hidden",
            pt: { xs: "90px", sm: "100px", md: "120px" },
            // overflowX: "hidden",
            // flexWrap: "wrap",
          }}
        > */}
        <Box
          sx={{
            marginTop: { xs: 1, sm: 4, md: 3 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: { xs: 1, sm: 2, md: 2 },
            width: "100vw",
            maxWidth: "100%",
            minHeight: "100vh",
            // overflow: "visible",
            pt: { xs: "90px", sm: "100px", md: "70px" }, // compensate header height
          }}
        >
          <Box
            sx={{
              padding: { xs: "13px", sm: 3, md: 4 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              // width: "100%",
              maxWidth: { xs: "77%", sm: 450, md: 500, lg: 500 },
              border: "1px solid #ccc",
              borderRadius: 4,
              boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.35)",
              // mt: { xs: "112px", sm: 12, md: "45px" },
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{ mb: { xs: 2, sm: 2, md: 2 } }}
            >
              Create Account
            </Typography>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              {/* First Name & Last Name - In one row */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <InputLabel
                    sx={{
                      fontSize: { xs: "17px", sm: "19px", md: "19px" },
                      fontFamily: "Calibri, sans-serif",
                    }}
                  >
                    First Name *
                  </InputLabel>
                  <TextField
                    fullWidth
                    size="small"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    InputProps={{
                      sx: {
                        width: { xs: "230px", sm: "210px" },
                        height: { xs: 30, sm: 42 },
                        fontSize: { xs: "15px", sm: "17px" },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <InputLabel
                    sx={{
                      fontSize: { xs: "17px", sm: "19px", md: "19px" },
                      fontFamily: "Calibri, sans-serif",
                    }}
                  >
                    Last Name *
                  </InputLabel>
                  <TextField
                    fullWidth
                    size="small"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    InputProps={{
                      sx: {
                        width: { xs: "230px", sm: "210px" },
                        height: { xs: 30, sm: 42 },
                        fontSize: { xs: "15px", sm: "17px" },
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Country & Date of Birth - In one row */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 1.5, sm: 2 },
                  mb: { xs: 1.5, sm: 2 },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <InputLabel
                    sx={{
                      fontSize: { xs: "17px", sm: "19px", md: "19px" },
                      fontFamily: "Calibri, sans-serif",
                    }}
                  >
                    Date of Birth *
                  </InputLabel>
                  <DatePicker
                    value={formData.dateOfBirth}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        required: true,
                        InputProps: {
                          sx: {
                            width: { xs: "230px", sm: "210px" },
                            height: { xs: 30, sm: 42 },
                            fontSize: { xs: "15px", sm: "17px" },
                          },
                        },
                      },
                    }}
                    maxDate={new Date()}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <InputLabel
                    sx={{
                      fontSize: { xs: "17px", sm: "19px", md: "19px" },
                      fontFamily: "Calibri, sans-serif",
                    }}
                  >
                    Age Group *
                  </InputLabel>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    name="ageGroup"
                    value={formData.ageGroup}
                    required
                    onChange={handleChange}
                    InputProps={{
                      sx: {
                        width: { xs: "230px", sm: "210px" },
                        height: { xs: 30, sm: 42 },
                        fontSize: { xs: "15px", sm: "17px" },
                      },
                    }}
                  >
                    {ageGroups.map((age) => (
                      <MenuItem key={age} value={age}>
                        {age}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>

              {/* Email */}
              {formData.ageGroup !== "<13" && (
                <Box sx={{ mb: 2 }}>
                  <InputLabel
                    sx={{
                      fontSize: { xs: "17px", sm: "19px", md: "19px" },
                      fontFamily: "Calibri, sans-serif",
                    }}
                  >
                    Email {formData.ageGroup === "<13" ? "(Optional)" : "*"}
                  </InputLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={formData.ageGroup === "<13"}
                    onChange={handleChange}
                    required={formData.ageGroup !== "<13"}
                    InputProps={{
                      sx: {
                        width: { xs: "230px", sm: "440px" },
                        height: { xs: 30, sm: 42 },
                        fontSize: { xs: "15px", sm: "17px" },
                      },
                    }}
                  />
                </Box>
              )}

              {/* Mobile */}
              {formData.ageGroup !== "<13" && (
                <Box sx={{ mb: 2 }}>
                  <InputLabel
                    sx={{
                      fontSize: { xs: "17px", sm: "19px", md: "19px" },
                      fontFamily: "Calibri, sans-serif",
                    }}
                  >
                    Mobile Number *
                  </InputLabel>
                  <TextField
                    fullWidth
                    size="small"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    required
                    InputProps={{
                      sx: {
                        width: { xs: "230px", sm: "440px" },
                        height: { xs: 30, sm: 42 },
                        fontSize: { xs: "15px", sm: "17px" },
                      },
                    }}
                  />
                </Box>
              )}

              {/* Username */}
              {/* <Box sx={{ mb: 2 }}>
              <InputLabel>Username *</InputLabel>
              <TextField
                fullWidth
                size="small"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Box> */}

              {/* Password */}
              {/* <Box sx={{ mb: 2 }}>
              <InputLabel>Password *</InputLabel>
              <TextField
                fullWidth
                size="small"
                type={showPassword ? "text" : "password"}
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
            </Box> */}

              {/* Parent Fields If Under 18 */}
              {(formData.ageGroup === "<13" ||
                formData.ageGroup === "13-14" ||
                formData.ageGroup === "15-17") && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <InputLabel
                      sx={{
                        fontSize: { xs: "17px", sm: "19px", md: "19px" },
                        fontFamily: "Calibri, sans-serif",
                      }}
                    >
                      Parent/Guardian Name *
                    </InputLabel>
                    <TextField
                      fullWidth
                      size="small"
                      name="parentName"
                      required
                      onChange={handleChange}
                      InputProps={{
                        sx: {
                          width: { xs: "230px", sm: "440px" },
                          height: { xs: 30, sm: 42 },
                          fontSize: { xs: "15px", sm: "17px" },
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <InputLabel
                      sx={{
                        fontSize: { xs: "17px", sm: "19px", md: "19px" },
                        fontFamily: "Calibri, sans-serif",
                      }}
                    >
                      Parent Email *
                    </InputLabel>
                    <TextField
                      fullWidth
                      size="small"
                      name="parentEmail"
                      required
                      onChange={handleChange}
                      InputProps={{
                        sx: {
                          width: { xs: "230px", sm: "440px" },
                          height: { xs: 30, sm: 42 },
                          fontSize: { xs: "15px", sm: "17px" },
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <InputLabel
                      sx={{
                        fontSize: { xs: "17px", sm: "19px", md: "19px" },
                        fontFamily: "Calibri, sans-serif",
                      }}
                    >
                      Parent Mobile *
                    </InputLabel>
                    <TextField
                      fullWidth
                      size="small"
                      name="parentMobile"
                      required
                      onChange={handleChange}
                      InputProps={{
                        sx: {
                          width: { xs: "230px", sm: "440px" },
                          height: { xs: 30, sm: 42 },
                          fontSize: { xs: "15px", sm: "17px" },
                        },
                      }}
                    />
                  </Box>
                </>
              )}

              {/* Subscription Plan */}
              <Box sx={{ mb: 2 }}>
                <InputLabel
                  sx={{
                    fontSize: { xs: "17px", sm: "19px", md: "19px" },
                    fontFamily: "Calibri, sans-serif",
                  }}
                >
                  Subscription Plan *
                </InputLabel>
                <TextField
                  select
                  fullWidth
                  size="small"
                  name="subscriptionPlan"
                  value={formData.subscriptionPlan}
                  onChange={handleChange}
                  required
                  InputProps={{
                    sx: {
                      width: { xs: "230px", sm: "440px" },
                      height: { xs: 30, sm: 42 },
                      fontSize: { xs: "15px", sm: "17px" },
                    },
                  }}
                >
                  {subscriptionPlans.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Sub Options */}
              {formData.subscriptionPlan && (
                <Box sx={{ mb: 2 }}>
                  <InputLabel
                    sx={{
                      fontSize: { xs: "17px", sm: "19px", md: "19px" },
                      fontFamily: "Calibri, sans-serif",
                    }}
                  >
                    Plan Option *
                  </InputLabel>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    name="childPlan"
                    value={formData.childPlan}
                    onChange={handleChange}
                    required
                    InputProps={{
                      sx: {
                        width: { xs: "230px", sm: "440px" },
                        height: { xs: 30, sm: 42 },
                        fontSize: { xs: "15px", sm: "17px" },
                      },
                    }}
                  >
                    {(formData.subscriptionPlan === "Nova"
                      ? novaOptions
                      : superNovaOptions
                    ).map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}

              {/* Subscription Type */}
              <Box sx={{ mb: 2 }}>
                <InputLabel
                  sx={{
                    fontSize: { xs: "17px", sm: "19px", md: "19px" },
                    fontFamily: "Calibri, sans-serif",
                  }}
                >
                  Subscription Type *
                </InputLabel>
                <TextField
                  select
                  fullWidth
                  size="small"
                  name="subscriptionType"
                  onChange={handleChange}
                  required
                  InputProps={{
                    sx: {
                      width: { xs: "230px", sm: "440px" },
                      height: { xs: 30, sm: 42 },
                      fontSize: { xs: "15px", sm: "17px" },
                    },
                  }}
                >
                  {subscriptionTypes.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Consent Checkbox */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Checkbox
                  checked={formData.agree}
                  onChange={(e) =>
                    setFormData({ ...formData, agree: e.target.checked })
                  }
                />
                <Typography
                  sx={{
                    fontSize: { xs: "17px", sm: "19px", md: "19px" },
                    fontFamily: "Calibri, sans-serif",
                  }}
                >
                  I consent the above information is correct *
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: { xs: 1, sm: 2 },
                  mb: { xs: 1, sm: 2 },
                  fontSize: { xs: "14px", sm: "16px" },
                  padding: { xs: "10px", sm: "14px" },
                  width: { xs: "230px", sm: "440px" },
                  height: { xs: 36, sm: 42 },
                }}
                disabled={loading}
                size="large"
              >
                {loading ? <CircularProgress size={24} /> : "Create Account"}
              </Button>

              <Box
                sx={{
                  textAlign: "center",
                  fontSize: { xs: "14px", sm: "16px" },
                  fontFamily: "Calibri, sans-serif",
                }}
              >
                <span>Already have an account? </span>
                <Link component={RouterLink} to="/login" variant="body2">
                  Sign In
                </Link>
              </Box>
            </form>
          </Box>
        </Box>
      </>
    </LocalizationProvider>
  );
};

export default Register;

// import React, { useState } from "react";
// import { useNavigate, Link as RouterLink } from "react-router-dom";
// import axios from "axios";
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Link,
//   CircularProgress,
//   InputLabel,
//   IconButton,
//   InputAdornment,
//   MenuItem,
//   Alert,
// } from "@mui/material";
// import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// const Register = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     mobile: "",
//     country: "",
//     dateOfBirth: null,
//     username: "",
//     password: "",
//   });
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");

//   const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

//   // Country options
//   const countries = [
//     "United States",
//     "Canada",
//     "United Kingdom",
//     "Australia",
//     "India",
//     "Germany",
//     "France",
//     "Japan",
//     "Brazil",
//     "Other",
//   ];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleDateChange = (date) => {
//     setFormData((prev) => ({
//       ...prev,
//       dateOfBirth: date,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");
//     setLoading(true);

//     // Validation
//     if (
//       !formData.firstName ||
//       !formData.lastName ||
//       !formData.email ||
//       !formData.mobile ||
//       !formData.country ||
//       !formData.dateOfBirth ||
//       !formData.username ||
//       !formData.password
//     ) {
//       setError("All fields are required");
//       setLoading(false);
//       return;
//     }

//     // Prepare data for backend
//     const submitData = {
//       ...formData,
//       dateOfBirth: formData.dateOfBirth
//         ? formData.dateOfBirth.toISOString().split("T")[0]
//         : null,
//     };

//     try {
//       const res = await axios.post(`${apiBaseUrl}/api/ai/register`, submitData);
//       setMessage(res.data.message || "Registration successful!");

//       // ✅ Success pachi login page par navigate
//       setTimeout(() => {
//         navigate("/login");
//       }, 2000);
//     } catch (err) {
//       const errorMsg =
//         err.response?.data?.error ||
//         err.response?.data?.details ||
//         "Registration failed";
//       setError(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Box
//         sx={{
//           marginTop: 8,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           padding: 2,
//         }}
//       >
//         <Box
//           sx={{
//             padding: 4,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             width: "100%",
//             maxWidth: 500,
//             border: "1px solid #ccc",
//             borderRadius: 4,
//             boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.35)",
//           }}
//         >
//           {error && (
//             <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
//               {error}
//             </Alert>
//           )}

//           {message && (
//             <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
//               {message}
//             </Alert>
//           )}

//           <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
//             Create Account
//           </Typography>

//           <form onSubmit={handleSubmit} style={{ width: "100%" }}>
//             {/* First Name & Last Name - In one row */}
//             <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
//               <Box sx={{ flex: 1 }}>
//                 <InputLabel>First Name *</InputLabel>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="firstName"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                   required
//                 />
//               </Box>
//               <Box sx={{ flex: 1 }}>
//                 <InputLabel>Last Name *</InputLabel>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="lastName"
//                   value={formData.lastName}
//                   onChange={handleChange}
//                   required
//                 />
//               </Box>
//             </Box>

//             {/* Email */}
//             <Box sx={{ mb: 2 }}>
//               <InputLabel>Email *</InputLabel>
//               <TextField
//                 fullWidth
//                 size="small"
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//               />
//             </Box>

//             {/* Mobile */}
//             <Box sx={{ mb: 2 }}>
//               <InputLabel>Mobile Number *</InputLabel>
//               <TextField
//                 fullWidth
//                 size="small"
//                 name="mobile"
//                 value={formData.mobile}
//                 onChange={handleChange}
//                 placeholder="+1234567890"
//                 required
//               />
//             </Box>

//             {/* Country & Date of Birth - In one row */}
//             <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
//               <Box sx={{ flex: 1 }}>
//                 <InputLabel>Country *</InputLabel>
//                 <TextField
//                   select
//                   fullWidth
//                   size="small"
//                   name="country"
//                   value={formData.country}
//                   onChange={handleChange}
//                   required
//                 >
//                   {countries.map((country) => (
//                     <MenuItem key={country} value={country}>
//                       {country}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               </Box>
//               <Box sx={{ flex: 1 }}>
//                 <InputLabel>Date of Birth *</InputLabel>
//                 <DatePicker
//                   value={formData.dateOfBirth}
//                   onChange={handleDateChange}
//                   slotProps={{
//                     textField: {
//                       size: "small",
//                       fullWidth: true,
//                       required: true,
//                     },
//                   }}
//                   maxDate={new Date()}
//                 />
//               </Box>
//             </Box>

//             {/* Username */}
//             <Box sx={{ mb: 2 }}>
//               <InputLabel>Username *</InputLabel>
//               <TextField
//                 fullWidth
//                 size="small"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 required
//               />
//             </Box>

//             {/* Password */}
//             <Box sx={{ mb: 2 }}>
//               <InputLabel>Password *</InputLabel>
//               <TextField
//                 fullWidth
//                 size="small"
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton
//                         onClick={() => setShowPassword(!showPassword)}
//                         edge="end"
//                       >
//                         {showPassword ? (
//                           <VisibilityOffOutlinedIcon />
//                         ) : (
//                           <VisibilityOutlinedIcon />
//                         )}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//             </Box>

//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               sx={{ mt: 2, mb: 2 }}
//               disabled={loading}
//               size="large"
//             >
//               {loading ? <CircularProgress size={24} /> : "Create Account"}
//             </Button>

//             <Box sx={{ textAlign: "center" }}>
//               <span>Already have an account? </span>
//               <Link component={RouterLink} to="/login" variant="body2">
//                 Sign In
//               </Link>
//             </Box>
//           </form>
//         </Box>
//       </Box>
//     </LocalizationProvider>
//   );
// };

// export default Register;

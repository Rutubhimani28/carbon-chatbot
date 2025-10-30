
// -----------------------------------------------------------------------------
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router-dom";
import ChatUI from "./ChatUi";
import Login from "./login";
import Register from "./register";

function App() {
  return (
    <>
     <ToastContainer
        // position="top-right"
        // autoClose={3000}
        // hideProgressBar={false}
        // newestOnTop={false}
        // closeOnClick
        // rtl={false}
        // pauseOnFocusLoss
        // draggable
        // pauseOnHover
      />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ChatUI />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;


// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Routes, Route, Navigate } from "react-router-dom";
// import ChatUI from "./ChatUi";
// import Login from "./login";
// import Register from "./register";
// import { useSelector } from "react-redux";

// function App() {
//   const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
//   return (
//     <>
//       <Routes>
//         <Route 
//           path="/register" 
//           element={!isAuthenticated ? <Register /> : <Navigate to="/" />} 
//         />
//         <Route 
//           path="/login" 
//           element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
//         />
//         <Route 
//           path="/" 
//           element={isAuthenticated ? <ChatUI /> : <Navigate to="/login" />} 
//         />
//       </Routes>
//       <ToastContainer />
//     </>
//   );
// }

// export default App;
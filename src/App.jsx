
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";

import HomeScreen from "./pages/HomeScreen";
import ScanQRCode from "./pages/ScanQRCode";
import CheckToken from "./pages/CheckToken";
import ConfirmDetails from "./pages/ConfirmDetails";
import QueueStatus from "./pages/QueueStatus";
import FinalCall from "./pages/FinalCall";
import CustomerArrived from "./pages/CustomerArrived";
import TokenConfirmed from "./pages/TokenConfirmed";

import TokenCallListener from "./components/TokenCallListener";

import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginLanding from "./pages/auth/LoginLanding";
import Layout from "./components/layout/Layout";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import StaffManagement from "./pages/owner/StaffManagement";
import Profile from "./pages/owner/Profile";
import MenuManagement from "./pages/owner/MenuManagement";
import StaffDashboard from "./pages/staff/StaffDashboard";
import AnalyticsAndReports from "./pages/owner/AnalyticsAndReports";

// Listener sirf customer routes par active rahega
function CustomerLayout() {
  return (
    <>
      <TokenCallListener />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* CUSTOMER ROUTES */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/check-token" element={<CheckToken />} />
          <Route path="/details/:id" element={<ConfirmDetails />} />
          <Route path="/token-conform" element={<TokenConfirmed />} />
          <Route path="/queue-status" element={<QueueStatus />} />

        </Route>
        {/* In routes par bhi listener active nhi rahega */}
        <Route path="/scan-qr" element={<ScanQRCode />} />
        <Route path="/final-call" element={<FinalCall />} />
        <Route path="/arrived" element={<CustomerArrived />} />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<LoginLanding />} />

        <Route
          path="/login/owner"
          element={
            <Login
              role="owner"
              title="Owner Portal"
              subtitle="Sign In to Access Your Account"
            />
          }
        />

        <Route
          path="/login/staff"
          element={
            <Login
              role="staff"
              title="Staff Portal"
              subtitle="Sign In to Access Your Account"
            />
          }
        />

        {/* PROTECTED OWNER / STAFF ROUTES */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN", "OWNER", "STAFF"]}
            />
          }
        >
          <Route element={<Layout />}>
            <Route
              element={<ProtectedRoute allowedRoles={["OWNER"]} />}
            >
              <Route
                path="/owner/dashboard"
                element={<OwnerDashboard />}
              />
              <Route
                path="/owner/staff"
                element={<StaffManagement />}
              />
              <Route
                path="/owner/menu"
                element={<MenuManagement />}
              />
              <Route
                path="/owner/analytics"
                element={<AnalyticsAndReports />}
              />
              <Route
                path="/owner/profile"
                element={<Profile />}
              />
            </Route>
          </Route>

          <Route
            element={<ProtectedRoute allowedRoles={["STAFF"]} />}
          >
            <Route
              path="/staff/dashboard"
              element={<StaffDashboard />}
            />
          </Route>
        </Route>

        {/* DEFAULT ROUTE */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

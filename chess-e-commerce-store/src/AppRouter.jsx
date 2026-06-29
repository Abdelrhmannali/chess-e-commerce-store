import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import App from "./App";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function LegacyResetRedirect({ children }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token") || params.get("reset_token");
  const email = params.get("email");

  if (token && email && location.pathname === "/") {
    return (
      <Navigate
        to={`/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`}
        replace
      />
    );
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/*"
          element={
            <LegacyResetRedirect>
              <App />
            </LegacyResetRedirect>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

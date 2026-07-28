import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import DashboardPage from "../pages/dashboard/DashboardPage";

import MainLayout from "../layouts/MainLayout";
import { ROUTES } from "../constants/routes";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path={ROUTES.LOGIN}
        element={<LoginPage />}
      />

      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={<ForgotPasswordPage />}
      />

      <Route
        path={ROUTES.RESET_PASSWORD}
        element={<ResetPasswordPage />}
      />

      {/* Private application layout */}
      <Route element={<MainLayout />}>
        <Route
          path={ROUTES.DASHBOARD}
          element={<DashboardPage />}
        />
      </Route>

      {/* Redirections */}
      <Route
        path="/"
        element={<Navigate to={ROUTES.LOGIN} replace />}
      />

      <Route
        path="*"
        element={<Navigate to={ROUTES.LOGIN} replace />}
      />
    </Routes>
  );
}

export default AppRoutes;
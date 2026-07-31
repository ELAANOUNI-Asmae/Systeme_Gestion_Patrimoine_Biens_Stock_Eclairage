import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import { ROUTES } from "../constants/routes";

// Auth
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

// Dashboard
import DashboardPage from "../pages/dashboard/DashboardPage";

// Users
import UsersPage from "../pages/users/UsersPage";
import AddUserPage from "../pages/users/AddUserPage";
import EditUserPage from "../pages/users/EditUserPage";
import UserDetailsPage from "../pages/users/UserDetailsPage";

// Roles
import RolesPage from "../pages/roles/RolesPage";
import AddRolePage from "../pages/roles/AddRolePage";
import EditRolePage from "../pages/roles/EditRolePage";
import RoleDetailsPage from "../pages/roles/RoleDetailsPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Pages publiques */}
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

      {/* Pages protégées */}
      <Route element={<MainLayout />}>
        {/* Dashboard */}
        <Route
          path={ROUTES.DASHBOARD}
          element={<DashboardPage />}
        />

        {/* Utilisateurs */}
        <Route
          path={ROUTES.USERS}
          element={<UsersPage />}
        />

        <Route
          path={ROUTES.ADD_USER}
          element={<AddUserPage />}
        />

        <Route
          path={ROUTES.USER_DETAILS}
          element={<UserDetailsPage />}
        />

        <Route
          path={ROUTES.EDIT_USER}
          element={<EditUserPage />}
        />

        {/* Rôles */}
        <Route
          path={ROUTES.ROLES}
          element={<RolesPage />}
        />

        <Route
          path={ROUTES.ADD_ROLE}
          element={<AddRolePage />}
        />

        <Route
          path={ROUTES.ROLE_DETAILS}
          element={<RoleDetailsPage />}
        />

        <Route
          path={ROUTES.EDIT_ROLE}
          element={<EditRolePage />}
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
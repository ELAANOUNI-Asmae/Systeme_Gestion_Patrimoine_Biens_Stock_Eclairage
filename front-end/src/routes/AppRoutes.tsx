import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import ProtectedRoute from "./ProtectedRoute";
import PermissionRoute from "./PermissionRoute";

import {
  ROUTES,
} from "../constants/routes";

import {
  NOTIFICATION_ACCESS_PERMISSIONS,
  REPORT_ACCESS_PERMISSIONS,
  PERMISSIONS,
} from "../constants/permissions";

// ======================================================
// AUTH
// ======================================================

import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

// ======================================================
// PUBLIC
// ======================================================

import PublicFailureReportPage from "../pages/public/PublicFailureReportPage";

// ======================================================
// DASHBOARD
// ======================================================

import DashboardPage from "../pages/dashboard/DashboardPage";

// ======================================================
// USERS
// ======================================================

import UsersPage from "../pages/users/UsersPage";
import AddUserPage from "../pages/users/AddUserPage";
import EditUserPage from "../pages/users/EditUserPage";
import UserDetailsPage from "../pages/users/UserDetailsPage";

// ======================================================
// ROLES
// ======================================================

import RolesPage from "../pages/roles/RolesPage";
import AddRolePage from "../pages/roles/AddRolePage";
import EditRolePage from "../pages/roles/EditRolePage";
import RoleDetailsPage from "../pages/roles/RoleDetailsPage";

// ======================================================
// BIENS
// ======================================================

import BiensPage from "../pages/biens/BiensPage";
import AddBienPage from "../pages/biens/AddBienPage";
import EditBienPage from "../pages/biens/EditBienPage";
import BienDetailsPage from "../pages/biens/BienDetailsPage";
import BiensArchivePage from "../pages/biens/BiensArchivePage";

// ======================================================
// STOCK
// ======================================================

import StockPage from "../pages/stock/StockPage";
import AddArticlePage from "../pages/stock/AddArticlePage";
import EditArticlePage from "../pages/stock/EditArticlePage";
import ArticleDetailsPage from "../pages/stock/ArticleDetailsPage";
import StockHistoryPage from "../pages/stock/StockHistoryPage";

// ======================================================
// ECLAIRAGE
// ======================================================

import LightingPage from "../pages/lighting/LightingPage";
import AddLightPage from "../pages/lighting/AddLightPage";
import EditLightPage from "../pages/lighting/EditLightPage";
import LightDetailsPage from "../pages/lighting/LightDetailsPage";
import LightingHistoryPage from "../pages/lighting/LightingHistoryPage";

// ======================================================
// REPORTS
// ======================================================

import ReportsPage from "../pages/reports/ReportsPage";

// ======================================================
// NOTIFICATIONS
// ======================================================

import NotificationsPage from "../pages/notifications/NotificationsPage";

// ======================================================
// PROFILE
// ======================================================

import ProfilePage from "../pages/profile/ProfilePage";

// ======================================================
// SETTINGS
// ======================================================

import SettingsPage from "../pages/settings/SettingsPage";

// ======================================================
// ERRORS
// ======================================================

import UnauthorizedPage from "../pages/errors/UnauthorizedPage";
import NotFoundPage from "../pages/errors/NotFoundPage";
import TeamPage from "../pages/team/TeamPage";

function AppRoutes() {
  return (
    <Routes>
      {/* ==================================================
          PUBLIC ROUTES
      =================================================== */}

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

      <Route
        path={ROUTES.UNAUTHORIZED}
        element={<UnauthorizedPage />}
      />

      <Route
        path={ROUTES.PUBLIC_FAILURE_REPORT}
        element={<PublicFailureReportPage />}
      />

      {/* ==================================================
          AUTHENTICATED ROUTES
      =================================================== */}

      <Route
        element={<ProtectedRoute />}
      >
        <Route
          element={<MainLayout />}
        >
          <Route
            path="/team"
            element={<TeamPage />}
          />
          {/* ==============================================
              DASHBOARD
          =============================================== */}

          <Route
            path={ROUTES.DASHBOARD}
            element={<DashboardPage />}
          />

          {/* ==============================================
              USERS
          =============================================== */}

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.GET_ALL_PROFILS
                }
              />
            }
          >
            <Route
              path={ROUTES.USERS}
              element={<UsersPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.CREATE_USER
                }
              />
            }
          >
            <Route
              path={ROUTES.ADD_USER}
              element={<AddUserPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.GET_PROFIL
                }
              />
            }
          >
            <Route
              path={ROUTES.USER_DETAILS}
              element={<UserDetailsPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.UPDATE_USER
                }
              />
            }
          >
            <Route
              path={ROUTES.EDIT_USER}
              element={<EditUserPage />}
            />
          </Route>

          {/* ==============================================
              ROLES
          =============================================== */}

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.GET_ALL_ROLES
                }
              />
            }
          >
            <Route
              path={ROUTES.ROLES}
              element={<RolesPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.CREATE_ROLE
                }
              />
            }
          >
            <Route
              path={ROUTES.ADD_ROLE}
              element={<AddRolePage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.GET_ROLE_PERMISSIONS
                }
              />
            }
          >
            <Route
              path={ROUTES.ROLE_DETAILS}
              element={<RoleDetailsPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.UPDATE_ROLE
                }
              />
            }
          >
            <Route
              path={ROUTES.EDIT_ROLE}
              element={<EditRolePage />}
            />
          </Route>

          {/* ==============================================
              BIENS
          =============================================== */}

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.GET_ALL_ASSETS
                }
              />
            }
          >
            <Route
              path={ROUTES.BIENS}
              element={<BiensPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.CREATE_ASSET
                }
              />
            }
          >
            <Route
              path={ROUTES.ADD_BIEN}
              element={<AddBienPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.GET_ARCHIVED_ASSETS
                }
              />
            }
          >
            <Route
              path={ROUTES.BIENS_ARCHIVE}
              element={<BiensArchivePage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.GET_ASSET_INFOS
                }
              />
            }
          >
            <Route
              path={ROUTES.BIEN_DETAILS}
              element={<BienDetailsPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.UPDATE_ASSET
                }
              />
            }
          >
            <Route
              path={ROUTES.EDIT_BIEN}
              element={<EditBienPage />}
            />
          </Route>

          {/* ==============================================
              STOCK
          =============================================== */}

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.GET_ALL_ITEMS
                }
              />
            }
          >
            <Route
              path={ROUTES.STOCK}
              element={<StockPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.CREATE_ITEM
                }
              />
            }
          >
            <Route
              path={ROUTES.ADD_ARTICLE}
              element={<AddArticlePage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.GET_ITEM
                }
              />
            }
          >
            <Route
              path={ROUTES.ARTICLE_DETAILS}
              element={<ArticleDetailsPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.GET_STOCK_MOVEMENT_PER_ITEM
                }
              />
            }
          >
            <Route
              path={ROUTES.STOCK_HISTORY}
              element={<StockHistoryPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.UPDATE_ITEM
                }
              />
            }
          >
            <Route
              path={ROUTES.EDIT_ARTICLE}
              element={<EditArticlePage />}
            />
          </Route>

          {/* ==============================================
              ECLAIRAGE PUBLIC
          =============================================== */}

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.GET_ALL_LIGHT_POINT
                }
              />
            }
          >
            <Route
              path={ROUTES.LIGHTING}
              element={<LightingPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.GET_LIGHT_POINT
                }
              />
            }
          >
            <Route
              path={ROUTES.LIGHT_DETAILS}
              element={<LightDetailsPage />}
            />
          </Route>

          {/*
            L'historique contient des pannes
            et des interventions.

            L'utilisateur peut y accéder s'il
            possède au moins une permission
            permettant de consulter ces données.
          */}

          <Route
            element={
              <PermissionRoute
                permissions={[
                  PERMISSIONS.GET_ALL_FAILURE,
                  PERMISSIONS.GET_INTERVENTION,
                  PERMISSIONS.SEARCH_INTERVENTIONS,
                ]}
              />
            }
          >
            <Route
              path={ROUTES.LIGHTING_HISTORY}
              element={<LightingHistoryPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.CREATE_LIGHT_POINT
                }
              />
            }
          >
            <Route
              path={ROUTES.ADD_LIGHT}
              element={<AddLightPage />}
            />
          </Route>

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.UPDATE_LIGHT_POINT
                }
              />
            }
          >
            <Route
              path={ROUTES.EDIT_LIGHT}
              element={<EditLightPage />}
            />
          </Route>

          {/* ==============================================
              REPORTS
          =============================================== */}

          <Route
            element={
              <PermissionRoute
                permissions={REPORT_ACCESS_PERMISSIONS}
              />
            }
          >
            <Route
              path={ROUTES.REPORTS}
              element={<ReportsPage />}
            />
          </Route>

          {/* ==============================================
              NOTIFICATIONS
          =============================================== */}

          <Route
            element={
              <PermissionRoute
                permissions={
                  NOTIFICATION_ACCESS_PERMISSIONS
                }
              />
            }
          >
            <Route
              path={ROUTES.NOTIFICATIONS}
              element={<NotificationsPage />}
            />
          </Route>

          {/* ==============================================
              PROFILE
          =============================================== */}

          {/*
            Le profil personnel utilise /user/me.

            Il reste accessible à tout utilisateur
            authentifié.
          */}

          <Route
            path={ROUTES.PROFILE}
            element={<ProfilePage />}
          />

          {/* ==============================================
              SETTINGS
          =============================================== */}

          {/*
            MANAGE_SETTINGS n'existe pas encore
            dans le Backend.

            Cette route reste donc inaccessible
            jusqu'à l'intégration du module Settings.
          */}

          <Route
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS.MANAGE_SETTINGS
                }
              />
            }
          >
            <Route
              path={ROUTES.SETTINGS}
              element={<SettingsPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* ==================================================
          ROOT
      =================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to={ROUTES.PUBLIC_FAILURE_REPORT}
            replace
          />
        }
      />

      {/* ==================================================
          404
      =================================================== */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}

export default AppRoutes;
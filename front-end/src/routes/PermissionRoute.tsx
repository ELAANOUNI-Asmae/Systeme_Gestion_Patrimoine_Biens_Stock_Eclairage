import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../hooks/useAuth";

import {
  ROUTES,
} from "../constants/routes";

import type {
  Permission,
} from "../constants/permissions";

type PermissionRouteProps = {
  permission?: Permission;
  permissions?: Permission[];
};

function PermissionRoute({
  permission,
  permissions = [],
}: PermissionRouteProps) {
  const {
    isAuthenticated,
    hasPermission,
  } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
      />
    );
  }

  const hasSinglePermission =
    permission
      ? hasPermission(
          permission,
        )
      : false;

  const hasAnyPermission =
    permissions.length > 0
      ? permissions.some(
          (item) =>
            hasPermission(
              item,
            ),
        )
      : false;

  const hasAccess =
    permission
      ? hasSinglePermission
      : permissions.length > 0
        ? hasAnyPermission
        : false;

  if (!hasAccess) {
    return (
      <Navigate
        to={
          ROUTES.UNAUTHORIZED
        }
        replace
      />
    );
  }

  return <Outlet />;
}

export default PermissionRoute;
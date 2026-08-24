import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";

import type { Permission } from "../constants/permissions";

type PermissionRouteProps = {
  permission: Permission;
};

function PermissionRoute({
  permission,
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

  if (!hasPermission(permission)) {
    return (
      <Navigate
        to={ROUTES.UNAUTHORIZED}
        replace
      />
    );
  }

  return <Outlet />;
}

export default PermissionRoute;
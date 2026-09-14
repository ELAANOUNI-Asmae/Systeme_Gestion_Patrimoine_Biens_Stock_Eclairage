import type { ReactNode } from "react";

import { useAuth } from "../../hooks/useAuth";

import type { Permission } from "../../constants/permissions";

interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
}

function PermissionGuard({
  permission,
  children,
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return null;
  }

  return <>{children}</>;
}

export default PermissionGuard;
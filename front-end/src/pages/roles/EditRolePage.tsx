import { ArrowLeft } from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import RoleForm from "../../components/roles/RoleForm";
import { roleService } from "../../services/roleService";

import type {
  Permission,
  Role,
  RoleFormData,
} from "../../types/role";

function EditRolePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | null>(null);

  const [permissions, setPermissions] =
    useState<Permission[]>([]);

  const [loadingPage, setLoadingPage] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roleData, permissionData] =
          await Promise.all([
            roleService.getById(Number(id)),
            roleService.getPermissions(),
          ]);

        setRole(roleData);
        setPermissions(permissionData);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Rôle introuvable.",
        );
      } finally {
        setLoadingPage(false);
      }
    };

    void loadData();
  }, [id]);

  const handleSubmit = async (
    data: RoleFormData,
  ) => {
    try {
      setSaving(true);
      setError("");

      await roleService.update(Number(id), data);
      navigate("/roles");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">
        Chargement du rôle...
      </div>
    );
  }

  if (!role) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        {error || "Rôle introuvable."}
      </div>
    );
  }

  const initialValues: RoleFormData = {
    name: role.name,
    permissionIds: role.permissions.map(
      (permission) => permission.id,
    ),
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          to="/roles"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-orange-600"
        >
          <ArrowLeft size={18} />
          Retour aux rôles
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
          Modifier le rôle
        </h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <RoleForm
        permissions={permissions}
        initialValues={initialValues}
        submitLabel="Enregistrer les modifications"
        loading={saving}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

export default EditRolePage;
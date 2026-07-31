import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import RoleForm from "../../components/roles/RoleForm";
import { roleService } from "../../services/roleService";

import type {
  Permission,
  RoleFormData,
} from "../../types/role";

function AddRolePage() {
  const navigate = useNavigate();

  const [permissions, setPermissions] =
    useState<Permission[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPermissions = async () => {
      const data =
        await roleService.getPermissions();

      setPermissions(data);
    };

    void loadPermissions();
  }, []);

  const handleSubmit = async (
    data: RoleFormData,
  ) => {
    try {
      setLoading(true);
      setError("");

      await roleService.create(data);
      navigate("/roles");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
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
          Ajouter un rôle
        </h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <RoleForm
        permissions={permissions}
        submitLabel="Créer le rôle"
        loading={loading}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

export default AddRolePage;
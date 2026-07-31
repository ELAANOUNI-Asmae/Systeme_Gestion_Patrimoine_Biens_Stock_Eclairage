import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  Permission,
  RoleFormData,
} from "../../types/role";

type RoleFormProps = {
  permissions: Permission[];
  initialValues?: RoleFormData;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (data: RoleFormData) => Promise<void> | void;
};

const emptyValues: RoleFormData = {
  name: "",
  permissionIds: [],
};

function RoleForm({
  permissions,
  initialValues = emptyValues,
  submitLabel,
  loading = false,
  onSubmit,
}: RoleFormProps) {
  const [formData, setFormData] =
    useState<RoleFormData>(initialValues);

  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const togglePermission = (permissionId: number) => {
    setFormData((previousData) => {
      const selected =
        previousData.permissionIds.includes(permissionId);

      return {
        ...previousData,
        permissionIds: selected
          ? previousData.permissionIds.filter(
              (id) => id !== permissionId,
            )
          : [...previousData.permissionIds, permissionId],
      };
    });
  };

  const selectAllPermissions = () => {
    setFormData((previousData) => ({
      ...previousData,
      permissionIds: permissions.map(
        (permission) => permission.id,
      ),
    }));
  };

  const clearPermissions = () => {
    setFormData((previousData) => ({
      ...previousData,
      permissionIds: [],
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Le nom du rôle est obligatoire.");
      return;
    }

    if (formData.permissionIds.length === 0) {
      setError(
        "Sélectionnez au moins une permission.",
      );
      return;
    }

    setError("");

    await onSubmit({
      name: formData.name.trim(),
      permissionIds: formData.permissionIds,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <label className="block text-sm font-medium text-slate-700">
        Nom du rôle <span className="text-red-500">*</span>

        <input
          type="text"
          value={formData.name}
          onChange={(event) =>
            setFormData((previousData) => ({
              ...previousData,
              name: event.target.value,
            }))
          }
          placeholder="Exemple : GESTIONNAIRE_STOCK"
          className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm uppercase outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </label>

      <div className="mt-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">
              Permissions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sélectionnez les actions autorisées pour ce rôle.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAllPermissions}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Tout sélectionner
            </button>

            <button
              type="button"
              onClick={clearPermissions}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Tout désélectionner
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {permissions.map((permission) => {
            const checked =
              formData.permissionIds.includes(permission.id);

            return (
              <label
                key={permission.id}
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
                  checked
                    ? "border-orange-300 bg-orange-50"
                    : "border-slate-200 hover:border-orange-200",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    togglePermission(permission.id)
                  }
                  className="mt-1 h-4 w-4 accent-orange-600"
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    {permission.name}
                  </span>

                  <span className="mt-1 block text-xs text-slate-500">
                    {permission.permission}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default RoleForm;
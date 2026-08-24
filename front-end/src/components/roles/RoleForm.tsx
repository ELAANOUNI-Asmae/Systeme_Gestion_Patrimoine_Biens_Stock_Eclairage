import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { useTranslation } from "react-i18next";

import {
  getPermissionLabel,
} from "../../utils/roleLabels";

import type {
  Permission,
  RoleFormData,
} from "../../types/role";

type RoleFormProps = {
  permissions: Permission[];
  initialValues?: RoleFormData;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (
    data: RoleFormData,
  ) => Promise<void> | void;
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
  const { t } =
    useTranslation();

  const [formData, setFormData] =
    useState<RoleFormData>(
      initialValues,
    );

  const [error, setError] =
    useState("");

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const togglePermission = (
    permissionId: number,
  ) => {
    setFormData(
      (previousData) => {
        const selected =
          previousData.permissionIds.includes(
            permissionId,
          );

        return {
          ...previousData,

          permissionIds: selected
            ? previousData.permissionIds.filter(
                (id) =>
                  id !==
                  permissionId,
              )
            : [
                ...previousData.permissionIds,
                permissionId,
              ],
        };
      },
    );

    setError("");
  };

  const selectAllPermissions =
    () => {
      setFormData(
        (previousData) => ({
          ...previousData,

          permissionIds:
            permissions.map(
              (permission) =>
                permission.id,
            ),
        }),
      );
    };

  const clearPermissions =
    () => {
      setFormData(
        (previousData) => ({
          ...previousData,
          permissionIds: [],
        }),
      );
    };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError(
        t(
          "roles.form.nameRequired",
        ),
      );
      return;
    }

    if (
      formData.permissionIds
        .length === 0
    ) {
      setError(
        t(
          "roles.form.permissionRequired",
        ),
      );
      return;
    }

    setError("");

    await onSubmit({
      name:
        formData.name.trim(),
      permissionIds:
        formData.permissionIds,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        {t("roles.form.name")}{" "}
        <span className="text-red-500">
          *
        </span>

        <input
          type="text"
          value={formData.name}
          onChange={(event) => {
            setFormData(
              (previousData) => ({
                ...previousData,
                name:
                  event.target
                    .value,
              }),
            );

            setError("");
          }}
          placeholder={t(
            "roles.form.namePlaceholder",
          )}
          className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm uppercase text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </label>

      <div className="mt-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {t(
                "roles.form.permissions",
              )}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(
                "roles.form.permissionsDescription",
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                selectAllPermissions
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {t(
                "roles.form.selectAll",
              )}
            </button>

            <button
              type="button"
              onClick={
                clearPermissions
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {t(
                "roles.form.clearAll",
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {permissions.map(
            (permission) => {
              const checked =
                formData.permissionIds.includes(
                  permission.id,
                );

              return (
                <label
                  key={
                    permission.id
                  }
                  className={[
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
                    checked
                      ? "border-orange-300 bg-orange-50 dark:border-orange-500/50 dark:bg-orange-500/10"
                      : "border-slate-200 hover:border-orange-200 dark:border-slate-700 dark:hover:border-orange-500/40",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={
                      checked
                    }
                    onChange={() =>
                      togglePermission(
                        permission.id,
                      )
                    }
                    className="mt-1 h-4 w-4 accent-orange-600"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {getPermissionLabel(
                        permission.permission,
                        t,
                      )}
                    </span>

                    <span className="mt-1 block text-xs font-mono text-slate-500 dark:text-slate-400">
                      {
                        permission.permission
                      }
                    </span>
                  </span>
                </label>
              );
            },
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end rtl:justify-start">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? t(
                "roles.form.saving",
              )
            : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default RoleForm;
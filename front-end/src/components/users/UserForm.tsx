import {
  useState,
  type FormEvent,
} from "react";

import { useTranslation } from "react-i18next";

import { mockRoles } from "../../mock/users";
import type { UserFormData } from "../../types/user";

type UserFormProps = {
  initialValues?: UserFormData;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (data: UserFormData) => Promise<void> | void;
};

const emptyValues: UserFormData = {
  firstname: "",
  lastname: "",

  firstnameAr: "",
  lastnameAr: "",

  email: "",
  gender: "HOMME",
  phone: "",
  cin: "",
  pwd: "",
  roleId: mockRoles[3].id,
};

function UserForm({
  initialValues = emptyValues,
  submitLabel,
  loading = false,
  onSubmit,
}: UserFormProps) {
  const { t } = useTranslation();

  const [formData, setFormData] =
    useState<UserFormData>(initialValues);

  const [error, setError] =
    useState("");

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } =
      event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]:
        name === "roleId"
          ? Number(value)
          : value,
    }));

    setError("");
  };

  const validate = () => {
    if (
      !formData.firstname.trim() ||
      !formData.lastname.trim() ||
      !formData.firstnameAr.trim() ||
      !formData.lastnameAr.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.cin.trim()
    ) {
    return t("users.form.required");
  }

    if (
      formData.firstname.trim().length < 3
    ) {
      return t(
        "users.form.firstnameMin",
      );
    }

    if (
      formData.lastname.trim().length < 3
    ) {
      return t(
        "users.form.lastnameMin",
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email,
      )
    ) {
      return t(
        "users.form.invalidEmail",
      );
    }

    if (
      !/^(0[5-7])[0-9]{8}$/.test(
        formData.phone,
      )
    ) {
      return t(
        "users.form.invalidPhone",
      );
    }

    if (
      !/^[A-Z]{1,2}[0-9]{5,6}$/.test(
        formData.cin.toUpperCase(),
      )
    ) {
      return t(
        "users.form.invalidCin",
      );
    }

    if (
      formData.pwd &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,50}$/.test(
        formData.pwd,
      )
    ) {
      return t(
        "users.form.invalidPassword",
      );
    }

    return "";
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationError =
      validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    await onSubmit({
      ...formData,

      firstname:
        formData.firstname.trim(),

      lastname:
        formData.lastname.trim(),

      firstnameAr:
        formData.firstnameAr.trim(),

      lastnameAr:
        formData.lastnameAr.trim(),

      email:
        formData.email.trim(),

      phone:
        formData.phone.trim(),

      cin:
        formData.cin
          .trim()
          .toUpperCase(),
    });
      };

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

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

      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("users.form.firstname")}{" "}
          <span className="text-red-500">*</span>

          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            className={inputClassName}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("users.form.lastname")}{" "}
          <span className="text-red-500">*</span>

          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className={inputClassName}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("users.form.firstnameAr")}{" "}
          <span className="text-red-500">*</span>

          <input
            type="text"
            name="firstnameAr"
            dir="rtl"
            value={formData.firstnameAr}
            onChange={handleChange}
            className={inputClassName}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("users.form.lastnameAr")}{" "}
          <span className="text-red-500">*</span>

          <input
            type="text"
            name="lastnameAr"
            dir="rtl"
            value={formData.lastnameAr}
            onChange={handleChange}
            className={inputClassName}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("users.form.email")}{" "}
          <span className="text-red-500">*</span>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClassName}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("users.form.phone")}{" "}
          <span className="text-red-500">*</span>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0612345678"
            className={inputClassName}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("users.form.cin")}{" "}
          <span className="text-red-500">*</span>

          <input
            type="text"
            name="cin"
            value={formData.cin}
            onChange={handleChange}
            placeholder="AB123456"
            className={inputClassName}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("users.form.gender")}{" "}
          <span className="text-red-500">*</span>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={inputClassName}
          >
            <option value="HOMME">
              {t("users.form.male")}
            </option>

            <option value="FEMME">
              {t("users.form.female")}
            </option>
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("users.form.role")}{" "}
          <span className="text-red-500">*</span>

          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className={inputClassName}
          >
            {mockRoles.map((role) => (
              <option
                key={role.id}
                value={role.id}
              >
                {role.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("users.form.password")}

          <input
            type="password"
            name="pwd"
            value={formData.pwd}
            onChange={handleChange}
            placeholder={t(
              "users.form.passwordPlaceholder",
            )}
            className={inputClassName}
          />

          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
            {t(
              "users.form.passwordHint",
            )}
          </span>
        </label>
      </div>

      <div className="mt-6 flex justify-end rtl:justify-start">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? t("users.form.saving")
            : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default UserForm;
import { useState, type FormEvent } from "react";

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
  const [formData, setFormData] =
    useState<UserFormData>(initialValues);

  const [error, setError] = useState("");

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]:
        name === "roleId"
          ? Number(value)
          : value,
    }));
  };

  const validate = () => {
    if (
      !formData.firstname.trim() ||
      !formData.lastname.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.cin.trim()
    ) {
      return "Tous les champs obligatoires doivent être remplis.";
    }

    if (formData.firstname.trim().length < 3) {
      return "Le prénom doit contenir au moins 3 caractères.";
    }

    if (formData.lastname.trim().length < 3) {
      return "Le nom doit contenir au moins 3 caractères.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "L'adresse e-mail est invalide.";
    }

    if (!/^(0[5-7])[0-9]{8}$/.test(formData.phone)) {
      return "Le numéro de téléphone marocain est invalide.";
    }

    if (!/^[A-Z]{1,2}[0-9]{5,6}$/.test(formData.cin.toUpperCase())) {
      return "Le numéro de CIN est invalide.";
    }

    if (
      formData.pwd &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,50}$/.test(
        formData.pwd,
      )
    ) {
      return "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.";
    }

    return "";
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    await onSubmit({
      ...formData,
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      cin: formData.cin.trim().toUpperCase(),
    });
  };

  const inputClassName =
    "mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

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

      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Prénom <span className="text-red-500">*</span>

          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            className={inputClassName}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Nom <span className="text-red-500">*</span>

          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className={inputClassName}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Adresse e-mail <span className="text-red-500">*</span>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClassName}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Téléphone <span className="text-red-500">*</span>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0612345678"
            className={inputClassName}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          CIN <span className="text-red-500">*</span>

          <input
            type="text"
            name="cin"
            value={formData.cin}
            onChange={handleChange}
            placeholder="AB123456"
            className={inputClassName}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Genre <span className="text-red-500">*</span>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={inputClassName}
          >
            <option value="HOMME">Homme</option>
            <option value="FEMME">Femme</option>
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Rôle <span className="text-red-500">*</span>

          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className={inputClassName}
          >
            {mockRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Mot de passe

          <input
            type="password"
            name="pwd"
            value={formData.pwd}
            onChange={handleChange}
            placeholder="Minimum 8 caractères"
            className={inputClassName}
          />

          <span className="mt-1 block text-xs text-slate-500">
            Obligatoire lors de l'ajout.
          </span>
        </label>
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

export default UserForm;
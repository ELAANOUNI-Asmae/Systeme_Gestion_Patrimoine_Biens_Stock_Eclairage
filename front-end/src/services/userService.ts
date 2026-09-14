import api from "./api";

import type {
  Role,
} from "../types/role";

import type {
  User,
  UserFormData,
} from "../types/user";

/*
 * Le Front utilise :
 * HOMME / FEMME
 *
 * Le Backend utilise l'enum Java :
 * MALE / FEMALE
 */
type BackendGender =
  | "MALE"
  | "FEMALE";

type BackendUser = {
  id: number;

  email: string;

  firstname_fr?: string;
  lastname_fr?: string;

  firstname_ar?: string;
  lastname_ar?: string;

  fullname_fr?: string;
  fullname_ar?: string;

  gender: BackendGender;

  phone: string;
  cin: string;

  accountStatus?:
    | "ACTIVE"
    | "INACTIVE";

  role: Role;
};

export type ProfileUpdateData = {
  firstname: string;
  lastname: string;

  firstnameAr: string;
  lastnameAr: string;

  phone: string;
};

/*
 * Convertit le genre Front vers
 * la valeur attendue par le Backend.
 */
function toBackendGender(
  gender: UserFormData["gender"],
): BackendGender {
  return gender === "FEMME"
    ? "FEMALE"
    : "MALE";
}

/*
 * Convertit le genre Backend vers
 * la valeur utilisée dans le Front.
 */
function toFrontendGender(
  gender: BackendGender,
): UserFormData["gender"] {
  return gender === "FEMALE"
    ? "FEMME"
    : "HOMME";
}

function splitFullName(
  value?: string,
) {
  const parts =
    (value ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  return {
    first:
      parts[0] ?? "",

    last:
      parts
        .slice(1)
        .join(" "),
  };
}

function mapUser(
  data: BackendUser,
): User {
  const french =
    splitFullName(
      data.fullname_fr,
    );

  const arabic =
    splitFullName(
      data.fullname_ar,
    );

  return {
    id:
      data.id,

    firstname:
      data.firstname_fr ??
      french.first,

    lastname:
      data.lastname_fr ??
      french.last,

    firstnameAr:
      data.firstname_ar ??
      arabic.first,

    lastnameAr:
      data.lastname_ar ??
      arabic.last,

    email:
      data.email,

    /*
     * Backend:
     * MALE / FEMALE
     *
     * Front:
     * HOMME / FEMME
     */
    gender:
      toFrontendGender(
        data.gender,
      ),

    phone:
      data.phone,

    cin:
      data.cin,

    role:
      data.role,

    active:
      data.accountStatus !==
      "INACTIVE",
  };
}

function buildPayload(
  data: UserFormData,
  includePassword: boolean,
) {
  return {
    email:
      data.email
        .trim()
        .toLowerCase(),

    firstname_fr:
      data.firstname
        .trim(),

    lastname_fr:
      data.lastname
        .trim(),

    firstname_ar:
      data.firstnameAr
        .trim(),

    lastname_ar:
      data.lastnameAr
        .trim(),

    /*
     * Conversion obligatoire :
     *
     * HOMME -> MALE
     * FEMME -> FEMALE
     */
    gender:
      toBackendGender(
        data.gender,
      ),

    phone:
      data.phone
        .trim(),

    cin:
      data.cin
        .trim()
        .toUpperCase(),

    role: {
      id:
        data.roleId,
    },

    ...(includePassword
      ? {
          pwd:
            data.pwd,
        }
      : {}),
  };
}

export const userService = {
  async getAll(): Promise<
    User[]
  > {
    const response =
      await api.get<
        BackendUser[]
      >(
        "/sgpbse/user/all",
      );

    return response.data.map(
      mapUser,
    );
  },

  async getById(
    id: number,
  ): Promise<User> {
    const response =
      await api.get<
        BackendUser
      >(
        `/sgpbse/user/profil/${id}`,
      );

    return mapUser(
      response.data,
    );
  },

  async getRoles(): Promise<
    Role[]
  > {
    const response =
      await api.get<
        Role[]
      >(
        "/sgpbse/role/all",
      );

    return response.data;
  },

  async create(
    data: UserFormData,
  ): Promise<User> {
    await api.post(
      "/sgpbse/user/create",
      buildPayload(
        data,
        true,
      ),
    );

    const users =
      await this.getAll();

    const createdUser =
      users.find(
        (user) =>
          user.email
            .toLowerCase() ===
          data.email
            .trim()
            .toLowerCase(),
      );

    if (!createdUser) {
      throw new Error(
        "USER_NOT_FOUND_AFTER_CREATE",
      );
    }

    return createdUser;
  },

  async update(
    id: number,
    data: UserFormData,
  ): Promise<User> {
    await api.put(
      `/sgpbse/user/update/${id}`,
      buildPayload(
        data,
        false,
      ),
    );

    return this.getById(
      id,
    );
  },

  async getCurrentProfile(): Promise<User> {
    const response = await api.get<BackendUser>("/sgpbse/user/me");
    return mapUser(response.data);
  },

  async updateProfile(
    data: ProfileUpdateData,
  ): Promise<User> {
    const response = await api.put<BackendUser>(
      "/sgpbse/user/me",
      {
        firstname_fr: data.firstname.trim(),
        lastname_fr: data.lastname.trim(),
        firstname_ar: data.firstnameAr.trim(),
        lastname_ar: data.lastnameAr.trim(),
        phone: data.phone.trim(),
      },
    );
    return mapUser(response.data);
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await api.post("/sgpbse/user/me/password", {
      currentPassword,
      newPassword,
    });
  },

  async setActive(
    id: number,
    active: boolean,
  ): Promise<User> {
    await api.post(
      active
        ? `/sgpbse/user/activate/${id}`
        : `/sgpbse/user/deactivate/${id}`,
    );

    return this.getById(
      id,
    );
  },

  async remove(
    id: number,
  ): Promise<void> {
    await api.delete(
      `/sgpbse/user/delete/${id}`,
    );
  },
};
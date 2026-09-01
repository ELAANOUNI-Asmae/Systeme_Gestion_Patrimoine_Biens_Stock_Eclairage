import type {
  TFunction,
} from "i18next";

export function getRoleLabel(
  roleName: string,
  t: TFunction,
): string {
  const key =
    roleName
      .trim()
      .toUpperCase();

  const knownRoles: Record<
    string,
    string
  > = {
    ADMIN:
      "roles.names.ADMIN",
    GESTIONNAIRE:
      "roles.names.GESTIONNAIRE",
    RESPONSABLE:
      "roles.names.RESPONSABLE",
    UTILISATEUR:
      "roles.names.UTILISATEUR",
  };

  const translationKey =
    knownRoles[key];

  if (!translationKey) {
    return roleName;
  }

  return t(
    translationKey,
  );
}

type PermissionLabel = {
  fr: string;
  ar: string;
};

const permissionLabels: Record<
  string,
  PermissionLabel
> = {
  GET_ALL_USERS: {
    fr: "Consulter les utilisateurs",
    ar: "عرض المستخدمين",
  },
  GET_USER_INFOS: {
    fr: "Consulter les détails d’un utilisateur",
    ar: "عرض تفاصيل مستخدم",
  },
  CREATE_USER: {
    fr: "Ajouter un utilisateur",
    ar: "إضافة مستخدم",
  },
  UPDATE_USER: {
    fr: "Modifier un utilisateur",
    ar: "تعديل مستخدم",
  },
  DELETE_USER: {
    fr: "Supprimer un utilisateur",
    ar: "حذف مستخدم",
  },

  GET_ALL_ROLES: {
    fr: "Consulter les rôles",
    ar: "عرض الأدوار",
  },
  GET_ROLE_INFOS: {
    fr: "Consulter les détails d’un rôle",
    ar: "عرض تفاصيل دور",
  },
  CREATE_ROLE: {
    fr: "Ajouter un rôle",
    ar: "إضافة دور",
  },
  UPDATE_ROLE: {
    fr: "Modifier un rôle",
    ar: "تعديل دور",
  },
  DELETE_ROLE: {
    fr: "Supprimer un rôle",
    ar: "حذف دور",
  },

  GET_ALL_ASSETS: {
    fr: "Consulter les biens",
    ar: "عرض الممتلكات",
  },
  GET_ASSET_INFOS: {
    fr: "Consulter les détails d’un bien",
    ar: "عرض تفاصيل ممتلك",
  },
  CREATE_ASSET: {
    fr: "Ajouter un bien",
    ar: "إضافة ممتلك",
  },
  UPDATE_ASSET: {
    fr: "Modifier un bien",
    ar: "تعديل ممتلك",
  },
  DELETE_ASSET: {
    fr: "Supprimer un bien",
    ar: "حذف ممتلك",
  },
  ASSIGN_ASSET: {
    fr: "Affecter un bien",
    ar: "إسناد ممتلك",
  },

  GET_ALL_ARTICLES: {
    fr: "Consulter les articles",
    ar: "عرض المواد",
  },
  CREATE_ARTICLE: {
    fr: "Ajouter un article",
    ar: "إضافة مادة",
  },
  UPDATE_ARTICLE: {
    fr: "Modifier un article",
    ar: "تعديل مادة",
  },
  DELETE_ARTICLE: {
    fr: "Supprimer un article",
    ar: "حذف مادة",
  },
  CREATE_STOCK_ENTRY: {
    fr: "Enregistrer une entrée de stock",
    ar: "تسجيل إدخال للمخزون",
  },
  CREATE_STOCK_EXIT: {
    fr: "Enregistrer une sortie de stock",
    ar: "تسجيل إخراج من المخزون",
  },
  CREATE_SUPPLY_REQUEST: {
    fr: "Créer une demande de fourniture",
    ar: "إنشاء طلب تموين",
  },
  VALIDATE_SUPPLY_REQUEST: {
    fr: "Valider une demande de fourniture",
    ar: "قبول طلب تموين",
  },
  REJECT_SUPPLY_REQUEST: {
    fr: "Refuser une demande de fourniture",
    ar: "رفض طلب تموين",
  },
  GET_STOCK_HISTORY: {
    fr: "Consulter l’historique du stock",
    ar: "عرض سجل المخزون",
  },
  GET_STOCK_ALERTS: {
    fr: "Consulter les alertes de stock",
    ar: "عرض تنبيهات المخزون",
  },

  GET_ALL_LIGHTS: {
    fr: "Consulter les points lumineux",
    ar: "عرض نقاط الإنارة",
  },
  CREATE_LIGHT: {
    fr: "Ajouter un point lumineux",
    ar: "إضافة نقطة إنارة",
  },
  UPDATE_LIGHT: {
    fr: "Modifier un point lumineux",
    ar: "تعديل نقطة إنارة",
  },
  DELETE_LIGHT: {
    fr: "Supprimer un point lumineux",
    ar: "حذف نقطة إنارة",
  },
  REPORT_FAILURE: {
    fr: "Déclarer une panne",
    ar: "الإبلاغ عن عطل",
  },
  CREATE_INTERVENTION: {
    fr: "Planifier une intervention",
    ar: "برمجة تدخل",
  },
  UPDATE_INTERVENTION: {
    fr: "Modifier une intervention",
    ar: "تعديل تدخل",
  },

  GENERATE_REPORT: {
    fr: "Générer un rapport",
    ar: "إنشاء تقرير",
  },
  EXPORT_PDF: {
    fr: "Exporter un rapport en PDF",
    ar: "تصدير التقرير بصيغة PDF",
  },
  EXPORT_EXCEL: {
    fr: "Exporter un rapport en Excel",
    ar: "تصدير التقرير بصيغة Excel",
  },

  UPDATE_PROFILE: {
    fr: "Modifier le profil",
    ar: "تعديل الملف الشخصي",
  },
  CHANGE_PASSWORD: {
    fr: "Changer le mot de passe",
    ar: "تغيير كلمة المرور",
  },
  MANAGE_SETTINGS: {
    fr: "Gérer les paramètres",
    ar: "إدارة الإعدادات",
  },
};

export function getPermissionLabel(
  permissionCode: string,
  _t: TFunction,
  language = "fr",
): string {
  const label =
    permissionLabels[
      permissionCode
    ];

  if (!label) {
    return permissionCode;
  }

  return language.startsWith(
    "ar",
  )
    ? label.ar
    : label.fr;
}

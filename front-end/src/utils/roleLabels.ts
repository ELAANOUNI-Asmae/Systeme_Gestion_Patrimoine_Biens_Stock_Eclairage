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

    AGENT:
      "roles.names.AGENT",
  };

  const translationKey =
    knownRoles[key];

  if (!translationKey) {
    return roleName;
  }

  return t(
    translationKey,
    {
      defaultValue:
        roleName,
    },
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
  // USERS
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

  GET_PROFIL: {
    fr: "Consulter les détails d’un utilisateur",
    ar: "عرض تفاصيل مستخدم",
  },

  GET_ALL_PROFILS: {
    fr: "Consulter les utilisateurs",
    ar: "عرض المستخدمين",
  },

  SEARCH_USER: {
    fr: "Rechercher un utilisateur",
    ar: "البحث عن مستخدم",
  },

  FILTER_USERS_BY_ROLE: {
    fr: "Filtrer les utilisateurs par rôle",
    ar: "تصفية المستخدمين حسب الدور",
  },

  ACTIVATE_ACCOUNT: {
    fr: "Activer un compte",
    ar: "تفعيل حساب",
  },

  DEACTIVATE_ACCOUNT: {
    fr: "Désactiver un compte",
    ar: "تعطيل حساب",
  },

  COUNT_USERS: {
    fr: "Consulter le nombre d’utilisateurs",
    ar: "عرض عدد المستخدمين",
  },

  GET_CONNECTED_USERNAME: {
    fr: "Consulter le nom de l’utilisateur connecté",
    ar: "عرض اسم المستخدم المتصل",
  },

  // ROLES
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

  GET_ALL_ROLES: {
    fr: "Consulter les rôles",
    ar: "عرض الأدوار",
  },

  GET_ROLE_PERMISSIONS: {
    fr: "Consulter les permissions d’un rôle",
    ar: "عرض صلاحيات الدور",
  },

  GET_ROLE_NAME: {
    fr: "Consulter le rôle d’un utilisateur",
    ar: "عرض دور المستخدم",
  },

  GET_ROLE_NAMES: {
    fr: "Consulter les noms des rôles",
    ar: "عرض أسماء الأدوار",
  },

  // ASSETS / BIENS
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

  GET_ASSET: {
    fr: "Consulter un bien",
    ar: "عرض ممتلك",
  },

  GET_ALL_ASSETS: {
    fr: "Consulter les biens",
    ar: "عرض الممتلكات",
  },

  GET_ASSET_INFOS: {
    fr: "Consulter les détails d’un bien",
    ar: "عرض تفاصيل ممتلك",
  },

  GET_ASSETS_BY_STATUS: {
    fr: "Consulter les biens par statut",
    ar: "عرض الممتلكات حسب الحالة",
  },

  GET_ASSETS_BY_TYPE: {
    fr: "Consulter les biens par type",
    ar: "عرض الممتلكات حسب النوع",
  },

  SEARCH_ASSET: {
    fr: "Rechercher un bien",
    ar: "البحث عن ممتلك",
  },

  GET_ARCHIVED_ASSETS: {
    fr: "Consulter les biens archivés",
    ar: "عرض الممتلكات المؤرشفة",
  },

  SEARCH_ARCHIVED_ASSETS: {
    fr: "Rechercher dans les biens archivés",
    ar: "البحث في الممتلكات المؤرشفة",
  },

  DISPOSE_ASSET: {
    fr: "Mettre un bien hors service",
    ar: "إخراج ممتلك من الخدمة",
  },

  COUNT_ASSET: {
    fr: "Consulter le nombre de biens",
    ar: "عرض عدد الممتلكات",
  },

  COUNT_ASSETS: {
    fr: "Consulter le nombre total de biens",
    ar: "عرض العدد الإجمالي للممتلكات",
  },

  COUNT_ASSETS_BY_STATUS: {
    fr: "Consulter le nombre de biens par statut",
    ar: "عرض عدد الممتلكات حسب الحالة",
  },

  // RENTALS
  RENT_ASSET: {
    fr: "Enregistrer une location de bien",
    ar: "تسجيل كراء ممتلك",
  },

  GET_RENTAL: {
    fr: "Consulter une location",
    ar: "عرض عملية كراء",
  },

  GET_ALL_RENTALS: {
    fr: "Consulter les locations",
    ar: "عرض عمليات الكراء",
  },

  UPDATE_RENTAL: {
    fr: "Modifier une location",
    ar: "تعديل عملية كراء",
  },

  CANCEL_RENTAL: {
    fr: "Annuler une location",
    ar: "إلغاء عملية كراء",
  },

  // MAINTENANCE
  SCHEDULE_MAINTENANCE: {
    fr: "Planifier une maintenance",
    ar: "برمجة صيانة",
  },

  START_MAINTENANCE: {
    fr: "Démarrer une maintenance",
    ar: "بدء الصيانة",
  },

  COMPLETE_MAINTENANCE: {
    fr: "Terminer une maintenance",
    ar: "إنهاء الصيانة",
  },

  CANCEL_MAINTENANCE: {
    fr: "Annuler une maintenance",
    ar: "إلغاء الصيانة",
  },

  UPDATE_MAINTENANCE: {
    fr: "Modifier une maintenance",
    ar: "تعديل الصيانة",
  },

  UPDATE_MAINTENANCE_STATUS: {
    fr: "Modifier le statut d’une maintenance",
    ar: "تعديل حالة الصيانة",
  },

  GET_MAINTENANCE: {
    fr: "Consulter une maintenance",
    ar: "عرض عملية صيانة",
  },

  GET_ALL_MAINTENANCE: {
    fr: "Consulter les maintenances",
    ar: "عرض عمليات الصيانة",
  },

  DELETE_MAINTENANCE: {
    fr: "Supprimer une maintenance",
    ar: "حذف عملية صيانة",
  },

  // ACCIDENTS
  REGISTER_ACCIDENT: {
    fr: "Enregistrer un accident",
    ar: "تسجيل حادث",
  },

  GET_ACCIDENT: {
    fr: "Consulter un accident",
    ar: "عرض حادث",
  },

  GET_ALL_ACCIDENT: {
    fr: "Consulter les accidents",
    ar: "عرض الحوادث",
  },

  // DISPOSALS
  GET_DISPOSAL: {
    fr: "Consulter une mise hors service",
    ar: "عرض عملية إخراج من الخدمة",
  },

  GET_ALL_DISPOSALS: {
    fr: "Consulter les mises hors service",
    ar: "عرض عمليات الإخراج من الخدمة",
  },

  // FUEL
  GET_FUEL_TANK: {
    fr: "Consulter une opération de carburant",
    ar: "عرض عملية وقود",
  },

  GET_ALL_FUEL_TANKS: {
    fr: "Consulter les opérations de carburant",
    ar: "عرض عمليات الوقود",
  },

  REFUL_VEHICLE: {
    fr: "Ravitailler un véhicule en carburant",
    ar: "تزويد مركبة بالوقود",
  },

  // STOCK ITEMS
  CREATE_ITEM: {
    fr: "Ajouter un article",
    ar: "إضافة مادة",
  },

  UPDATE_ITEM: {
    fr: "Modifier un article",
    ar: "تعديل مادة",
  },

  DELETE_ITEM: {
    fr: "Supprimer un article",
    ar: "حذف مادة",
  },

  GET_ITEM: {
    fr: "Consulter un article",
    ar: "عرض مادة",
  },

  GET_ALL_ITEMS: {
    fr: "Consulter les articles",
    ar: "عرض المواد",
  },

  SEARCH_ITEM: {
    fr: "Rechercher un article",
    ar: "البحث عن مادة",
  },

  UPDATE_ITEM_QUANTITY: {
    fr: "Modifier la quantité d’un article",
    ar: "تعديل كمية مادة",
  },

  GET_ITEM_STAT: {
    fr: "Consulter les statistiques d’un article",
    ar: "عرض إحصائيات مادة",
  },

  COUNT_ITEMS: {
    fr: "Consulter le nombre d’articles",
    ar: "عرض عدد المواد",
  },

  COUNT_TOTAL_QUANTITIES: {
    fr: "Consulter la quantité totale du stock",
    ar: "عرض الكمية الإجمالية للمخزون",
  },

  // STOCK MOVEMENTS
  CREATE_IN_STOCK: {
    fr: "Enregistrer une entrée en stock",
    ar: "تسجيل إدخال للمخزون",
  },

  GET_STOCK_MOVEMENT_PER_ITEM: {
    fr: "Consulter les mouvements d’un article",
    ar: "عرض حركات مادة",
  },

  COUNT_STOCK_MOVEMENT_BY_PERIOD: {
    fr: "Consulter les mouvements de stock par période",
    ar: "عرض حركات المخزون حسب الفترة",
  },

  COUNT_IN_STOCK_BY_ITEM: {
    fr: "Consulter les entrées de stock par article",
    ar: "عرض إدخالات المخزون حسب المادة",
  },

  COUNT_IN_STOCK_BY_PERIOD: {
    fr: "Consulter les entrées de stock par période",
    ar: "عرض إدخالات المخزون حسب الفترة",
  },

  COUNT_TOTAL_IN_STOCK: {
    fr: "Consulter le total des entrées en stock",
    ar: "عرض إجمالي إدخالات المخزون",
  },

  // ITEM REQUESTS
  CREATE_ITEM_REQUEST: {
    fr: "Créer une demande de fourniture",
    ar: "إنشاء طلب تموين",
  },

  GET_ITEM_REQUEST: {
    fr: "Consulter une demande de fourniture",
    ar: "عرض طلب تموين",
  },

  GET_ALL_ITEM_REQUESTS: {
    fr: "Consulter les demandes de fourniture",
    ar: "عرض طلبات التموين",
  },

  FILTER_ITEM_REQUESTS_BY_USER: {
    fr: "Filtrer les demandes par utilisateur",
    ar: "تصفية الطلبات حسب المستخدم",
  },

  APROUVE_ITEM_REQUEST: {
    fr: "Approuver une demande de fourniture",
    ar: "الموافقة على طلب تموين",
  },

  REJECT_ITEM_REQUEST: {
    fr: "Refuser une demande de fourniture",
    ar: "رفض طلب تموين",
  },

  CANCEL_ITEM_REQUEST: {
    fr: "Annuler une demande de fourniture",
    ar: "إلغاء طلب تموين",
  },

  CONFIRM_ITEM_REQUEST_DELIVERY: {
    fr: "Confirmer la livraison d’une demande",
    ar: "تأكيد تسليم طلب تموين",
  },

  COUNT_ITEM_REQUESTS_BY_STATUS: {
    fr: "Consulter le nombre de demandes par statut",
    ar: "عرض عدد الطلبات حسب الحالة",
  },

  // LOW STOCK
  GET_ITEMS_WITH_LOW_STOCK: {
    fr: "Consulter les articles à stock faible",
    ar: "عرض المواد ذات المخزون المنخفض",
  },

  GET_LOW_STOCK_ALERTS_BY_PERIOD: {
    fr: "Consulter les alertes de stock par période",
    ar: "عرض تنبيهات المخزون حسب الفترة",
  },

  COUNT_LOW_STOCK_ALERTS: {
    fr: "Consulter le nombre d’alertes de stock",
    ar: "عرض عدد تنبيهات المخزون",
  },

  READ_STOCK_ALERTS: {
    fr: "Consulter les alertes de stock",
    ar: "عرض تنبيهات المخزون",
  },

  GET_ALERT_STOCK_MVMT_OFF_DOCS: {
    fr: "Consulter les alertes liées aux documents de stock",
    ar: "عرض تنبيهات وثائق المخزون",
  },

  // LIGHTING
  CREATE_LIGHT_POINT: {
    fr: "Ajouter un point lumineux",
    ar: "إضافة نقطة إنارة",
  },

  UPDATE_LIGHT_POINT: {
    fr: "Modifier un point lumineux",
    ar: "تعديل نقطة إنارة",
  },

  DELETE_LIGHT_POINT: {
    fr: "Supprimer un point lumineux",
    ar: "حذف نقطة إنارة",
  },

  GET_LIGHT_POINT: {
    fr: "Consulter un point lumineux",
    ar: "عرض نقطة إنارة",
  },

  GET_ALL_LIGHT_POINT: {
    fr: "Consulter les points lumineux",
    ar: "عرض نقاط الإنارة",
  },

  SEARCH_LIGHT_POINTS: {
    fr: "Rechercher un point lumineux",
    ar: "البحث عن نقطة إنارة",
  },

  FILTER_LIGHT_POINTS_BY_STATUS: {
    fr: "Filtrer les points lumineux par statut",
    ar: "تصفية نقاط الإنارة حسب الحالة",
  },

  UPDATE_LIGHT_POINT_STATUS: {
    fr: "Modifier le statut d’un point lumineux",
    ar: "تعديل حالة نقطة إنارة",
  },

  COUNT_LIGHT_POINTS: {
    fr: "Consulter le nombre de points lumineux",
    ar: "عرض عدد نقاط الإنارة",
  },

  COUNT_LIGHT_POINTS_BY_STATUS: {
    fr: "Consulter le nombre de points lumineux par statut",
    ar: "عرض عدد نقاط الإنارة حسب الحالة",
  },

  // FAILURES
  REPORT_FAILURE: {
    fr: "Déclarer une panne",
    ar: "الإبلاغ عن عطل",
  },

  GET_FAILURE: {
    fr: "Consulter une panne",
    ar: "عرض عطل",
  },

  GET_ALL_FAILURE: {
    fr: "Consulter les pannes",
    ar: "عرض الأعطال",
  },

  COUNT_FAILURES: {
    fr: "Consulter le nombre de pannes",
    ar: "عرض عدد الأعطال",
  },

  // INTERVENTIONS
  SCHEDULE_INTERVENTION: {
    fr: "Planifier une intervention",
    ar: "برمجة تدخل",
  },

  START_INTERVENTION: {
    fr: "Démarrer une intervention",
    ar: "بدء تدخل",
  },

  COMPLETE_INTERVENTION: {
    fr: "Terminer une intervention",
    ar: "إنهاء تدخل",
  },

  GET_INTERVENTION: {
    fr: "Consulter une intervention",
    ar: "عرض تدخل",
  },

  SEARCH_INTERVENTIONS: {
    fr: "Rechercher une intervention",
    ar: "البحث عن تدخل",
  },

  COUNT_INTERVENTIONS_BY_STATUS: {
    fr: "Consulter le nombre d’interventions par statut",
    ar: "عرض عدد التدخلات حسب الحالة",
  },

  // NOTIFICATIONS
  COUNT_NOTIF: {
    fr: "Consulter le nombre de notifications",
    ar: "عرض عدد الإشعارات",
  },

  FILTER_NOTIF_BY_STATUS: {
    fr: "Filtrer les notifications par statut",
    ar: "تصفية الإشعارات حسب الحالة",
  },

  MARK_NOTIF_AS_READ: {
    fr: "Marquer une notification comme lue",
    ar: "تحديد إشعار كمقروء",
  },

  MARK_ALL_NOTIF_AS_READ: {
    fr: "Marquer toutes les notifications comme lues",
    ar: "تحديد جميع الإشعارات كمقروءة",
  },

  GET_ACCIDENT_NOTIFICATION: {
    fr: "Consulter les notifications d’accidents",
    ar: "عرض إشعارات الحوادث",
  },

  GET_DISPOSAL_NOTIFICATION: {
    fr: "Consulter les notifications de mise hors service",
    ar: "عرض إشعارات الإخراج من الخدمة",
  },

  GET_FUEL_TANK_NOTIFICATION: {
    fr: "Consulter les notifications de carburant",
    ar: "عرض إشعارات الوقود",
  },

  GET_MAINTENANCE_NOTIFICATION: {
    fr: "Consulter les notifications de maintenance",
    ar: "عرض إشعارات الصيانة",
  },

  GET_RENTAL_NOTIFICATION: {
    fr: "Consulter les notifications de location",
    ar: "عرض إشعارات الكراء",
  },

  GET_FAILURE_NOTIFICATION: {
    fr: "Consulter les notifications de pannes",
    ar: "عرض إشعارات الأعطال",
  },

  GET_INTERVENTION_NOTIFICATION: {
    fr: "Consulter les notifications d’interventions",
    ar: "عرض إشعارات التدخلات",
  },

  GET_ITEM_REQUEST_NOTIFICATION: {
    fr: "Consulter les notifications de demandes de fourniture",
    ar: "عرض إشعارات طلبات التموين",
  },

  // LEGACY ALIASES
  GET_ALL_USERS: {
    fr: "Consulter les utilisateurs",
    ar: "عرض المستخدمين",
  },

  GET_USER_INFOS: {
    fr: "Consulter les détails d’un utilisateur",
    ar: "عرض تفاصيل مستخدم",
  },

  GET_ROLE_INFOS: {
    fr: "Consulter les permissions d’un rôle",
    ar: "عرض صلاحيات الدور",
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

  GET_ALL_ARTICLES: {
    fr: "Consulter les articles",
    ar: "عرض المواد",
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
    ar: "الموافقة على طلب تموين",
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

  GET_ALL_LIGHTS: {
    fr: "Consulter les points lumineux",
    ar: "عرض نقاط الإنارة",
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
    ar: "تصدير تقرير بصيغة PDF",
  },

  EXPORT_EXCEL: {
    fr: "Exporter un rapport en Excel",
    ar: "تصدير تقرير بصيغة Excel",
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
  const normalized =
    permissionCode
      .trim()
      .toUpperCase();

  const label =
    permissionLabels[
      normalized
    ];

  if (!label) {
    return normalized
      .replaceAll(
        "_",
        " ",
      )
      .toLowerCase()
      .replace(
        /^./,
        (character) =>
          character.toUpperCase(),
      );
  }

  return language.startsWith(
    "ar",
  )
    ? label.ar
    : label.fr;
}
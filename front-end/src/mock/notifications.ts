import type {
  AppNotification,
} from "../types/notification";

export const initialMockNotifications: AppNotification[] = [
  {
    id: 1,

    title:
      "Stock faible",

    titleAr:
      "مخزون منخفض",

    message:
      "La quantité de la cartouche imprimante noire est inférieure au seuil minimum.",

    messageAr:
      "كمية خرطوشة الطابعة السوداء أقل من الحد الأدنى.",

    type:
      "WARNING",

    module:
      "STOCK",

    createdAt:
      "2026-08-05 09:30",

    read:
      false,

    targetUrl:
      "/stock/articles/2",
  },

  {
    id: 2,

    title:
      "Nouvelle panne signalée",

    titleAr:
      "تم التبليغ عن عطل جديد",

    message:
      "Une panne a été déclarée sur le lampadaire LMP-002.",

    messageAr:
      "تم التبليغ عن عطل في نقطة الإنارة LMP-002.",

    type:
      "ERROR",

    module:
      "LIGHTING",

    createdAt:
      "2026-08-05 08:45",

    read:
      false,

    targetUrl:
      "/eclairage/2",
  },

  {
    id: 3,

    title:
      "Bien ajouté",

    titleAr:
      "تمت إضافة ممتلك",

    message:
      "Le bien Ordinateur portable Dell a été enregistré avec succès.",

    messageAr:
      "تم تسجيل الحاسوب المحمول Dell بنجاح.",

    type:
      "SUCCESS",

    module:
      "ASSETS",

    createdAt:
      "2026-08-04 16:20",

    read:
      true,

    targetUrl:
      "/biens/3",
  },

  {
    id: 4,

    title:
      "Information système",

    titleAr:
      "معلومة حول النظام",

    message:
      "La plateforme fonctionne actuellement avec des données de démonstration.",

    messageAr:
      "تعمل المنصة حالياً ببيانات تجريبية.",

    type:
      "INFO",

    module:
      "SYSTEM",

    createdAt:
      "2026-08-04 11:00",

    read:
      true,

    targetUrl:
      "/parametres",
  },
];
import type {
  Failure,
  Intervention,
  Light,
} from "../types/lighting";

export const initialMockLights: Light[] = [
  {
    id: 1,

    reference: "LMP-001",

    designation:
      "Lampadaire principal",

    designationAr:
      "مصباح إنارة رئيسي",

    zone:
      "Centre-ville",

    zoneAr:
      "وسط المدينة",

    address:
      "Avenue Mohammed V",

    addressAr:
      "شارع محمد الخامس",

    latitude:
      30.4208,

    longitude:
      -9.5981,

    status:
      "ACTIVE",

    installationDate:
      "2024-03-10",

    power:
      120,
  },

  {
    id: 2,

    reference:
      "LMP-002",

    designation:
      "Lampadaire secondaire",

    designationAr:
      "مصباح إنارة ثانوي",

    zone:
      "Hay Mohammadi",

    zoneAr:
      "حي المحمدي",

    address:
      "Rue 12",

    addressAr:
      "الزنقة 12",

    latitude:
      30.4381,

    longitude:
      -9.5576,

    status:
      "DAMAGED",

    installationDate:
      "2023-11-18",

    power:
      100,
  },

  {
    id: 3,

    reference:
      "LMP-003",

    designation:
      "Éclairage jardin public",

    designationAr:
      "إنارة الحديقة العمومية",

    zone:
      "Talborjt",

    zoneAr:
      "تالبرجت",

    address:
      "Jardin communal",

    addressAr:
      "الحديقة الجماعية",

    latitude:
      30.4256,

    longitude:
      -9.5939,

    status:
      "UNDER_MAINTENANCE",

    installationDate:
      "2025-01-05",

    power:
      80,
  },

  {
    id: 4,

    reference:
      "LMP-004",

    designation:
      "Lampadaire boulevard",

    designationAr:
      "مصباح إنارة بالشارع",

    zone:
      "Founty",

    zoneAr:
      "فونتي",

    address:
      "Boulevard du 20 Août",

    addressAr:
      "شارع 20 غشت",

    latitude:
      30.4077,

    longitude:
      -9.5998,

    status:
      "ACTIVE",

    installationDate:
      "2025-06-12",

    power:
      150,
  },

  {
    id: 5,

    reference:
      "LMP-005",

    designation:
      "Point lumineux résidentiel",

    designationAr:
      "نقطة إنارة سكنية",

    zone:
      "Dakhla",

    zoneAr:
      "الداخلة",

    address:
      "Avenue des FAR",

    addressAr:
      "شارع القوات المسلحة الملكية",

    latitude:
      30.3979,

    longitude:
      -9.5621,

    status:
      "INACTIVE",

    installationDate:
      "2022-09-20",

    power:
      90,
  },
];

export const initialMockFailures: Failure[] = [
  {
    id:
      1,

    lightId:
      2,

    lightReference:
      "LMP-002",

    lightDesignation:
      "Lampadaire secondaire",

    lightDesignationAr:
      "مصباح إنارة ثانوي",

    description:
      "Lampadaire ne s’allume plus.",

    reportedBy:
      "Agent communal",

    reportedAt:
      "2026-08-04",

    status:
      "REPORTED",
  },
];

export const initialMockInterventions: Intervention[] = [
  {
    id:
      1,

    failureId:
      1,

    technician:
      "Technicien 1",

    interventionDate:
      "2026-08-05",

    description:
      "Diagnostic du câblage.",

    completed:
      false,
  },
];
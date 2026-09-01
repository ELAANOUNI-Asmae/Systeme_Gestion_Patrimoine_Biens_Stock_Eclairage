import type {
  Failure,
  Intervention,
  Light,
  Technician,
} from "../types/lighting";

export const initialMockLights: Light[] = [
  {
    id: 1,
    reference: "LMP-001",
    designation: "Lampadaire principal",
    designationAr: "عمود إنارة رئيسي",
    localisation: "Avenue Mohammed V, Agadir",
    latitude: 30.4218,
    longitude: -9.5984,
    status: "ACTIVE",
    installationDate: "2024-01-15",
    power: 120,
    documents: [],
  },
  {
    id: 2,
    reference: "LMP-002",
    designation: "Lampadaire secondaire",
    designationAr: "عمود إنارة ثانوي",
    localisation: "Hay Mohammadi, Agadir",
    latitude: 30.4278,
    longitude: -9.5981,
    status: "UNDER_MAINTENANCE",
    installationDate: "2023-11-18",
    power: 100,
    documents: [],
  },
  {
    id: 3,
    reference: "LMP-003",
    designation: "Point lumineux jardin",
    designationAr: "نقطة إنارة الحديقة",
    localisation: "Jardin Olhao, Agadir",
    latitude: 30.4169,
    longitude: -9.5946,
    status: "ACTIVE",
    installationDate: "2025-02-10",
    power: 80,
    documents: [],
  },
];

export const initialMockFailures: Failure[] = [
  {
    id: 1,
    lightId: 2,
    lightReference: "LMP-002",
    lightDesignation: "Lampadaire secondaire",
    lightDesignationAr: "عمود إنارة ثانوي",
    description: "Le lampadaire ne s’allume plus.",
    reportedBy: "Agent communal",
    reportedAt: "2026-08-31",
    status: "IN_PROGRESS",
    documents: [],
  },
];

export const initialMockTechnicians: Technician[] = [
  {
    id: 1,
    name: "Yassine Amrani",
    nameAr: "ياسين العمراني",
    phone: "0611000001",
    localisation: "Hay Mohammadi, Agadir",
    latitude: 30.4284,
    longitude: -9.5967,
    active: true,
  },
  {
    id: 2,
    name: "Karim El Idrissi",
    nameAr: "كريم الإدريسي",
    phone: "0611000002",
    localisation: "Talborjt, Agadir",
    latitude: 30.4212,
    longitude: -9.5905,
    active: true,
  },
  {
    id: 3,
    name: "Ahmed Ait Lahcen",
    nameAr: "أحمد أيت لحسن",
    phone: "0611000003",
    localisation: "Dcheira El Jihadia",
    latitude: 30.3728,
    longitude: -9.5348,
    active: true,
  },
];

export const initialMockInterventions: Intervention[] = [
  {
    id: 1,
    failureId: 1,
    technicianId: 1,
    technicianName: "Yassine Amrani",
    technicianNameAr: "ياسين العمراني",
    technicianLocalisation: "Hay Mohammadi, Agadir",
    interventionDate: "2026-09-01",
    description: "Diagnostic du câblage et remplacement des éléments défectueux.",
    completed: false,
    photos: [],
    documents: [],
  },
];

import type {
  AssetStatus,
  AssetType,
  Bien,
} from "../types/bien";

export const assetStatuses: AssetStatus[] = [
  "AVAILABLE",
  "IN_USE",
  "RENTED",
  "UNDER_MAINTENANCE",
  "OUT_OF_SERVICE",
  "DAMAGED",
  "DISPOSED",
  "SOLD",
  "ARCHIVED",
];

export const assetTypes: AssetType[] = [
  "VEHICLE",
  "MACHINE",
  "REAL_ESTATE",
];

export const initialMockBiens: Bien[] = [
  {
    id: 1,

    type: "VEHICLE",

    designation:
      "Véhicule utilitaire Renault",

    designationAr:
      "سيارة نفعية رونو",

    assetStatus:
      "UNDER_MAINTENANCE",

    acquisitionDate:
      "2022-05-10",

    purchaseValue: 185000,

    assignment:
      "Service technique",

    assignmentAr:
      "المصلحة التقنية",

    inventoryId:
      "INV-2022-012",

    documents: [
      {
        id: 1,

        name: "Carte grise",

        category:
          "ATTACHMENT",

        type: "REGISTRATION",

        fileName:
          "carte-grise-renault.pdf",

        uploadDate:
          "2022-05-10",
      },

      {
        id: 2,

        name:
          "Facture d’achat",

        category:
          "ATTACHMENT",

        type: "INVOICE",

        fileName:
          "facture-renault.pdf",

        uploadDate:
          "2022-05-10",
      },
    ],

    vehicleDetails: {
      registrationNumber:
        "12345-A-33",

      brand: "Renault",

      model: "Kangoo",

      year: 2022,

      chassisNumber:
        "VF1EXAMPLE2022",
    },

    rentalHistory: [],

    archive: {
      archived: false,
    },
  },

  {
    id: 2,

    type: "MACHINE",

    designation:
      "Groupe électrogène",

    designationAr:
      "مولد كهربائي",

    assetStatus:
      "AVAILABLE",

    acquisitionDate:
      "2024-11-20",

    purchaseValue: 72000,

    assignment:
      "Magasin communal",

    assignmentAr:
      "المستودع الجماعي",

    inventoryId:
      "INV-2024-045",

    documents: [
      {
        id: 3,

        name:
          "Facture d’achat",

        category:
          "ATTACHMENT",

        type: "INVOICE",

        fileName:
          "facture-groupe-electrogene.pdf",

        uploadDate:
          "2024-11-20",
      },
    ],

    machineDetails: {
      brand: "Honda",

      model: "EU70",

      serialNumber:
        "SN-2024-001",

      technicalReference:
        "GEN-HONDA-70",
    },

    rentalHistory: [],

    archive: {
      archived: false,
    },
  },

  {
    id: 3,

    type:
      "REAL_ESTATE",

    designation:
      "Local administratif",

    designationAr:
      "مقر إداري",

    assetStatus:
      "IN_USE",

    acquisitionDate:
      "2020-03-05",

    purchaseValue: 850000,

    assignment:
      "Direction générale",

    assignmentAr:
      "الإدارة العامة",

    inventoryId:
      "INV-2020-021",

    documents: [
      {
        id: 4,

        name:
          "Titre foncier",

        category:
          "ATTACHMENT",

        type:
          "CERTIFICATE",

        fileName:
          "titre-foncier-local.pdf",

        uploadDate:
          "2020-03-05",
      },
    ],

    realEstateDetails: {
      address:
        "Centre-ville, Agadir",

      surface: 180,

      landTitleNumber:
        "TF-AG-2020-884",

      propertyType:
        "Local administratif",
    },

    rentalHistory: [],

    archive: {
      archived: false,
    },
  },

  {
    id: 4,

    type: "VEHICLE",

    designation:
      "Ancien véhicule de service",

    designationAr:
      "سيارة مصلحة قديمة",

    assetStatus: "SOLD",

    acquisitionDate:
      "2015-01-10",

    purchaseValue: 120000,

    assignment:
      "Service administratif",

    assignmentAr:
      "المصلحة الإدارية",

    inventoryId:
      "INV-2015-004",

    documents: [
      {
        id: 5,

        name:
          "Contrat de vente",

        category:
          "ATTACHMENT",

        type: "CONTRACT",

        fileName:
          "contrat-vente-vehicule.pdf",

        uploadDate:
          "2026-06-15",
      },
    ],

    vehicleDetails: {
      registrationNumber:
        "54321-B-33",

      brand: "Dacia",

      model: "Logan",

      year: 2015,
    },

    rentalHistory: [],

    sale: {
      id: 1,

      bienId: 4,

      partyType:
        "PERSON",

      buyerName:
        "Ahmed El Mansouri",

      cin: "AB123456",

      phone:
        "0611223344",

      saleDate:
        "2026-06-15",

      salePrice: 45000,

      contractReference:
        "VENTE-2026-001",

      contractFileName:
        "contrat-vente-vehicule.pdf",

      receiptFileName:
        "recu-vente-vehicule.pdf",

      createdAt:
        "2026-06-15",
    },

    archive: {
      archived: true,

      archivedAt:
        "2026-06-15",

      reason: "SOLD",

      notes:
        "Véhicule vendu après réforme.",
    },
  },
];
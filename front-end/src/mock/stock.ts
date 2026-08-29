import type {
  StockArticle,
  StockMovement,
  SupplyRequest,
} from "../types/stock";

export const initialMockArticles: StockArticle[] = [
  {
    id: 1,

    reference:
      "ART-001",

    serialNumber:
      "SN-PAP-A4-001",

    barcode:
      "6110000000011",

    designation:
      "Ramette papier A4",

    designationAr:
      "رزمة ورق A4",

    category:
      "Fournitures de bureau",

    categoryAr:
      "لوازم مكتبية",

    quantity: 120,

    minimumQuantity: 30,

    unit:
      "PAQUET",

    location:
      "Magasin A - Étagère 1",

    locationAr:
      "المستودع A - الرف 1",

    documents: [
      {
        id: 101,

        name:
          "Fiche fournisseur",

        category:
          "ATTACHMENT",

        type:
          "TECHNICAL_SHEET",

        fileName:
          "fiche-papier-a4.pdf",

        uploadDate:
          "2026-08-03",
      },
    ],

    updatedAt:
      "2026-08-03",
  },

  {
    id: 2,

    reference:
      "ART-002",

    serialNumber:
      "SN-CART-NOIR-002",

    barcode:
      "6110000000028",

    designation:
      "Cartouche imprimante noire",

    designationAr:
      "خرطوشة طابعة سوداء",

    category:
      "Informatique",

    categoryAr:
      "معلوميات",

    quantity: 8,

    minimumQuantity: 10,

    unit:
      "UNITE",

    location:
      "Magasin A - Étagère 3",

    locationAr:
      "المستودع A - الرف 3",

    documents: [
      {
        id: 102,

        name:
          "Garantie fournisseur",

        category:
          "OFFICIAL",

        type:
          "WARRANTY",

        fileName:
          "garantie-cartouche.pdf",

        uploadDate:
          "2026-01-15",

        expirationDate:
          "2027-01-15",

        reminderDaysBefore:
          30,
      },
    ],

    updatedAt:
      "2026-08-02",
  },

  {
    id: 3,

    reference:
      "ART-003",

    serialNumber:
      "SN-LED-50W-003",

    barcode:
      "6110000000035",

    designation:
      "Ampoule LED 50W",

    designationAr:
      "مصباح LED 50W",

    category:
      "Électricité",

    categoryAr:
      "كهرباء",

    quantity: 45,

    minimumQuantity: 20,

    unit:
      "UNITE",

    location:
      "Magasin B - Étagère 2",

    locationAr:
      "المستودع B - الرف 2",

    documents: [
      {
        id: 103,

        name:
          "Fiche technique LED",

        category:
          "ATTACHMENT",

        type:
          "TECHNICAL_SHEET",

        fileName:
          "fiche-technique-led-50w.pdf",

        uploadDate:
          "2026-07-15",
      },
    ],

    updatedAt:
      "2026-08-01",
  },

  {
    id: 4,

    reference:
      "ART-004",

    serialNumber:
      "SN-CABLE-004",

    barcode:
      "6110000000042",

    designation:
      "Câble électrique",

    designationAr:
      "سلك كهربائي",

    category:
      "Électricité",

    categoryAr:
      "كهرباء",

    quantity: 15,

    minimumQuantity: 25,

    unit:
      "METRE",

    location:
      "Magasin B - Zone 1",

    locationAr:
      "المستودع B - المنطقة 1",

    documents: [],

    updatedAt:
      "2026-07-31",
  },
];

export const initialMockMovements: StockMovement[] = [
  {
    id: 1,

    articleId: 1,

    articleDesignation:
      "Ramette papier A4",

    articleDesignationAr:
      "رزمة ورق A4",

    type:
      "ENTRY",

    quantity: 50,

    reason:
      "Réception fournisseur",

    supplierOrBeneficiary:
      "Fournisseur Atlas",

    reference:
      "ENT-2026-001",

    performedBy:
      "Administrateur",

    date:
      "2026-08-03",

    documents: [
      {
        id: 1,

        name:
          "Facture fournisseur",

        category:
          "ATTACHMENT",

        type:
          "INVOICE",

        fileName:
          "facture-atlas-2026-001.pdf",

        uploadDate:
          "2026-08-03",
      },
    ],
  },

  {
    id: 2,

    articleId: 3,

    articleDesignation:
      "Ampoule LED 50W",

    articleDesignationAr:
      "مصباح LED 50W",

    type:
      "EXIT",

    quantity: 10,

    reason:
      "Intervention éclairage public",

    supplierOrBeneficiary:
      "Service éclairage public",

    reference:
      "SOR-2026-001",

    performedBy:
      "Agent communal",

    date:
      "2026-08-02",

    documents: [
      {
        id: 2,

        name:
          "Bon de sortie",

        category:
          "ATTACHMENT",

        type:
          "EXIT_VOUCHER",

        fileName:
          "bon-sortie-2026-001.pdf",

        uploadDate:
          "2026-08-02",
      },
    ],
  },
];

export const initialMockSupplyRequests: SupplyRequest[] = [
  {
    id: 1,

    articleDesignation:
      "Cartouche imprimante noire",

    articleDesignationAr:
      "خرطوشة طابعة سوداء",

    requestedQuantity:
      20,

    requester:
      "Service administratif",

    reason:
      "Stock presque épuisé",

    requestDate:
      "2026-08-03",

    status:
      "PENDING",

    documents: [
      {
        id: 201,

        name:
          "Justificatif du besoin",

        category:
          "ATTACHMENT",

        type:
          "OTHER",

        fileName:
          "justificatif-cartouches.pdf",

        uploadDate:
          "2026-08-03",
      },
    ],
  },

  {
    id: 2,

    articleDesignation:
      "Ramette papier A4",

    articleDesignationAr:
      "رزمة ورق A4",

    requestedQuantity:
      40,

    requester:
      "Service ressources humaines",

    reason:
      "Besoins mensuels",

    requestDate:
      "2026-08-01",

    status:
      "APPROVED",

    documents: [],
  },
];
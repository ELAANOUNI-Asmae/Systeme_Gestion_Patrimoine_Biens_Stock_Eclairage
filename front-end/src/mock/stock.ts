import type {
  StockArticle,
  StockMovement,
  SupplyRequest,
} from "../types/stock";

export const initialMockArticles: StockArticle[] = [
  {
    id: 1,

    reference: "ART-001",

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

    unit: "PAQUET",

    location:
      "Magasin A - Étagère 1",

    locationAr:
      "المستودع A - الرف 1",

    updatedAt:
      "2026-08-03",
  },

  {
    id: 2,

    reference: "ART-002",

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

    unit: "UNITE",

    location:
      "Magasin A - Étagère 3",

    locationAr:
      "المستودع A - الرف 3",

    updatedAt:
      "2026-08-02",
  },

  {
    id: 3,

    reference:
      "ART-003",

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

    unit: "UNITE",

    location:
      "Magasin B - Étagère 2",

    locationAr:
      "المستودع B - الرف 2",

    updatedAt:
      "2026-08-01",
  },

  {
    id: 4,

    reference:
      "ART-004",

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

    unit: "METRE",

    location:
      "Magasin B - Zone 1",

    locationAr:
      "المستودع B - المنطقة 1",

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

    type: "ENTRY",

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

        type: "INVOICE",

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

    type: "EXIT",

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

    requestedQuantity: 20,

    requester:
      "Service administratif",

    reason:
      "Stock presque épuisé",

    requestDate:
      "2026-08-03",

    status: "PENDING",
  },

  {
    id: 2,

    articleDesignation:
      "Ramette papier A4",

    articleDesignationAr:
      "رزمة ورق A4",

    requestedQuantity: 40,

    requester:
      "Service ressources humaines",

    reason:
      "Besoins mensuels",

    requestDate:
      "2026-08-01",

    status: "APPROVED",
  },
];
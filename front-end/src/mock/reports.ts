import type {
  ReportData,
  ReportMetric,
  ReportSection,
  ReportType,
} from "../types/report";

type MockReportDefinition = {
  statistics: ReportMetric[];
  sections: ReportSection[];
};

export const mockReports: Record<
  ReportType,
  MockReportDefinition
> = {
  USERS: {
    statistics: [
      {
        id: "total-users",
        labelKey:
          "reports.statistics.totalUsers",
        value: 4,
      },
      {
        id: "admins",
        labelKey:
          "reports.statistics.admins",
        value: 1,
      },
      {
        id: "managers",
        labelKey:
          "reports.statistics.managers",
        value: 1,
      },
      {
        id: "responsables",
        labelKey:
          "reports.statistics.responsables",
        value: 1,
      },
    ],

    sections: [
      {
        id: "users-list",
        titleKey:
          "reports.sections.users",

        columns: [
          {
            key: "name",
            labelKey:
              "reports.columns.name",
          },
          {
            key: "email",
            labelKey:
              "reports.columns.email",
          },
          {
            key: "phone",
            labelKey:
              "reports.columns.phone",
          },
          {
            key: "cin",
            labelKey:
              "reports.columns.cin",
          },
          {
            key: "gender",
            labelKey:
              "reports.columns.gender",
          },
          {
            key: "role",
            labelKey:
              "reports.columns.role",
          },
        ],

        rows: [
          {
            id: 1,
            filterDate:
              "2026-08-01",
            values: {
              name:
                "Mohamed Alaoui",
              email:
                "mohamed.alaoui@sgpbse.ma",
              phone:
                "0612345678",
              cin:
                "AB123456",
              gender:
                "Homme",
              role:
                "Administrateur",
            },
          },

          {
            id: 2,
            filterDate:
              "2026-08-03",
            values: {
              name:
                "Salma Bennani",
              email:
                "salma.bennani@sgpbse.ma",
              phone:
                "0623456789",
              cin:
                "CD234567",
              gender:
                "Femme",
              role:
                "Gestionnaire",
            },
          },

          {
            id: 3,
            filterDate:
              "2026-08-05",
            values: {
              name:
                "Youssef Idrissi",
              email:
                "youssef.idrissi@sgpbse.ma",
              phone:
                "0634567890",
              cin:
                "EF345678",
              gender:
                "Homme",
              role:
                "Responsable",
            },
          },

          {
            id: 4,
            filterDate:
              "2026-08-07",
            values: {
              name:
                "Imane Amrani",
              email:
                "imane.amrani@sgpbse.ma",
              phone:
                "0645678901",
              cin:
                "GH456789",
              gender:
                "Femme",
              role:
                "Utilisateur",
            },
          },
        ],
      },
    ],
  },

  ASSETS: {
    statistics: [
      {
        id: "total-assets",
        labelKey:
          "reports.statistics.totalAssets",
        value: 3,
      },
      {
        id: "available-assets",
        labelKey:
          "reports.statistics.availableAssets",
        value: 1,
      },
      {
        id: "in-use-assets",
        labelKey:
          "reports.statistics.inUseAssets",
        value: 1,
      },
      {
        id: "maintenance-assets",
        labelKey:
          "reports.statistics.assetsMaintenance",
        value: 1,
      },
      {
        id: "total-value",
        labelKey:
          "reports.statistics.totalValue",
        value: "1 230 000",
        unit: "DH",
      },
    ],

    sections: [
      {
        id: "assets-list",
        titleKey:
          "reports.sections.assets",

        columns: [
          {
            key: "inventory",
            labelKey:
              "reports.columns.inventory",
          },
          {
            key: "designation",
            labelKey:
              "reports.columns.designation",
          },
          {
            key: "type",
            labelKey:
              "reports.columns.type",
          },
          {
            key: "assignment",
            labelKey:
              "reports.columns.assignment",
          },
          {
            key: "acquisitionDate",
            labelKey:
              "reports.columns.acquisitionDate",
          },
          {
            key: "value",
            labelKey:
              "reports.columns.value",
          },
          {
            key: "status",
            labelKey:
              "reports.columns.status",
          },
        ],

        rows: [
          {
            id: 1,
            filterDate:
              "2026-08-02",
            values: {
              inventory:
                "BIEN-001",
              designation:
                "Véhicule communal",
              type:
                "Véhicule",
              assignment:
                "Service technique",
              acquisitionDate:
                "2025-01-15",
              value:
                "280 000 DH",
              status:
                "En service",
            },
          },

          {
            id: 2,
            filterDate:
              "2026-08-04",
            values: {
              inventory:
                "BIEN-002",
              designation:
                "Local administratif",
              type:
                "Immobilier",
              assignment:
                "Administration",
              acquisitionDate:
                "2020-06-10",
              value:
                "850 000 DH",
              status:
                "Disponible",
            },
          },

          {
            id: 3,
            filterDate:
              "2026-08-05",
            values: {
              inventory:
                "BIEN-003",
              designation:
                "Machine de maintenance",
              type:
                "Machine",
              assignment:
                "Atelier communal",
              acquisitionDate:
                "2024-09-20",
              value:
                "100 000 DH",
              status:
                "En maintenance",
            },
          },
        ],
      },
    ],
  },

  STOCK: {
    statistics: [
      {
        id: "articles",
        labelKey:
          "reports.statistics.articles",
        value: 3,
      },
      {
        id: "total-quantity",
        labelKey:
          "reports.statistics.totalQuantity",
        value: 285,
      },
      {
        id: "stock-alerts",
        labelKey:
          "reports.statistics.stockAlerts",
        value: 1,
      },
      {
        id: "pending-requests",
        labelKey:
          "reports.statistics.pendingRequests",
        value: 1,
      },
    ],

    sections: [
      {
        id: "stock-state",
        titleKey:
          "reports.sections.stockState",

        columns: [
          {
            key: "reference",
            labelKey:
              "reports.columns.reference",
          },
          {
            key: "article",
            labelKey:
              "reports.columns.article",
          },
          {
            key: "category",
            labelKey:
              "reports.columns.category",
          },
          {
            key: "unit",
            labelKey:
              "reports.columns.unit",
          },
          {
            key: "quantity",
            labelKey:
              "reports.columns.quantity",
          },
          {
            key: "minimum",
            labelKey:
              "reports.columns.minimum",
          },
          {
            key: "location",
            labelKey:
              "reports.columns.location",
          },
          {
            key: "status",
            labelKey:
              "reports.columns.status",
          },
        ],

        rows: [
          {
            id: 1,
            filterDate:
              "2026-08-01",
            values: {
              reference:
                "ART-001",
              article:
                "Ramette papier A4",
              category:
                "Fournitures de bureau",
              unit:
                "Paquet",
              quantity:
                150,
              minimum:
                30,
              location:
                "Magasin A",
              status:
                "Disponible",
            },
          },

          {
            id: 2,
            filterDate:
              "2026-08-02",
            values: {
              reference:
                "ART-002",
              article:
                "Cartouche imprimante",
              category:
                "Informatique",
              unit:
                "Unité",
              quantity:
                10,
              minimum:
                20,
              location:
                "Magasin B",
              status:
                "Stock faible",
            },
          },

          {
            id: 3,
            filterDate:
              "2026-08-03",
            values: {
              reference:
                "ART-003",
              article:
                "Ampoule LED",
              category:
                "Électricité",
              unit:
                "Unité",
              quantity:
                125,
              minimum:
                40,
              location:
                "Magasin C",
              status:
                "Disponible",
            },
          },
        ],
      },

      {
        id: "stock-movements",
        titleKey:
          "reports.sections.stockMovements",

        columns: [
          {
            key: "date",
            labelKey:
              "reports.columns.date",
          },
          {
            key: "movementType",
            labelKey:
              "reports.columns.movementType",
          },
          {
            key: "article",
            labelKey:
              "reports.columns.article",
          },
          {
            key: "quantity",
            labelKey:
              "reports.columns.quantity",
          },
          {
            key: "reason",
            labelKey:
              "reports.columns.reason",
          },
          {
            key: "reference",
            labelKey:
              "reports.columns.reference",
          },
          {
            key: "user",
            labelKey:
              "reports.columns.user",
          },
        ],

        rows: [
          {
            id: 1,
            filterDate:
              "2026-08-03",
            values: {
              date:
                "2026-08-03",
              movementType:
                "Entrée",
              article:
                "Ramette papier A4",
              quantity:
                50,
              reason:
                "Réapprovisionnement",
              reference:
                "ENT-001",
              user:
                "Mohamed Alaoui",
            },
          },

          {
            id: 2,
            filterDate:
              "2026-08-04",
            values: {
              date:
                "2026-08-04",
              movementType:
                "Sortie",
              article:
                "Ampoule LED",
              quantity:
                15,
              reason:
                "Maintenance éclairage",
              reference:
                "SOR-001",
              user:
                "Salma Bennani",
            },
          },
        ],
      },

      {
        id: "supply-requests",
        titleKey:
          "reports.sections.supplyRequests",

        columns: [
          {
            key: "date",
            labelKey:
              "reports.columns.date",
          },
          {
            key: "article",
            labelKey:
              "reports.columns.article",
          },
          {
            key: "quantity",
            labelKey:
              "reports.columns.requestedQuantity",
          },
          {
            key: "requester",
            labelKey:
              "reports.columns.requester",
          },
          {
            key: "reason",
            labelKey:
              "reports.columns.reason",
          },
          {
            key: "status",
            labelKey:
              "reports.columns.status",
          },
        ],

        rows: [
          {
            id: 1,
            filterDate:
              "2026-08-05",
            values: {
              date:
                "2026-08-05",
              article:
                "Cartouche imprimante",
              quantity:
                20,
              requester:
                "Service administratif",
              reason:
                "Réapprovisionnement",
              status:
                "En attente",
            },
          },
        ],
      },
    ],
  },

  LIGHTING: {
    statistics: [
      {
        id: "total-lights",
        labelKey:
          "reports.statistics.totalLights",
        value: 3,
      },
      {
        id: "active-lights",
        labelKey:
          "reports.statistics.activeLights",
        value: 1,
      },
      {
        id: "damaged-lights",
        labelKey:
          "reports.statistics.damagedLights",
        value: 1,
      },
      {
        id: "maintenance-lights",
        labelKey:
          "reports.statistics.maintenanceLights",
        value: 1,
      },
      {
        id: "failures",
        labelKey:
          "reports.statistics.failures",
        value: 2,
      },
      {
        id: "interventions",
        labelKey:
          "reports.statistics.interventions",
        value: 1,
      },
    ],

    sections: [
      {
        id: "lights",
        titleKey:
          "reports.sections.lights",

        columns: [
          {
            key: "reference",
            labelKey:
              "reports.columns.reference",
          },
          {
            key: "designation",
            labelKey:
              "reports.columns.designation",
          },
          {
            key: "zone",
            labelKey:
              "reports.columns.zone",
          },
          {
            key: "address",
            labelKey:
              "reports.columns.address",
          },
          {
            key: "power",
            labelKey:
              "reports.columns.power",
          },
          {
            key: "installationDate",
            labelKey:
              "reports.columns.installationDate",
          },
          {
            key: "status",
            labelKey:
              "reports.columns.status",
          },
        ],

        rows: [
          {
            id: 1,
            filterDate:
              "2026-08-01",
            values: {
              reference:
                "LMP-001",
              designation:
                "Lampadaire principal",
              zone:
                "Centre-ville",
              address:
                "Avenue Mohammed V",
              power:
                "120 W",
              installationDate:
                "2025-03-15",
              status:
                "Actif",
            },
          },

          {
            id: 2,
            filterDate:
              "2026-08-04",
            values: {
              reference:
                "LMP-002",
              designation:
                "Lampadaire secondaire",
              zone:
                "Hay Mohammadi",
              address:
                "Rue 12",
              power:
                "100 W",
              installationDate:
                "2025-04-10",
              status:
                "Endommagé",
            },
          },

          {
            id: 3,
            filterDate:
              "2026-08-05",
            values: {
              reference:
                "LMP-003",
              designation:
                "Éclairage jardin public",
              zone:
                "Talborjt",
              address:
                "Jardin communal",
              power:
                "80 W",
              installationDate:
                "2025-06-05",
              status:
                "En maintenance",
            },
          },
        ],
      },

      {
        id: "failures",
        titleKey:
          "reports.sections.failures",

        columns: [
          {
            key: "light",
            labelKey:
              "reports.columns.light",
          },
          {
            key: "description",
            labelKey:
              "reports.columns.description",
          },
          {
            key: "reportedAt",
            labelKey:
              "reports.columns.reportedAt",
          },
          {
            key: "reportedBy",
            labelKey:
              "reports.columns.reportedBy",
          },
          {
            key: "status",
            labelKey:
              "reports.columns.status",
          },
        ],

        rows: [
          {
            id: 1,
            filterDate:
              "2026-08-04",
            values: {
              light:
                "LMP-002",
              description:
                "Lampadaire ne s’allume plus.",
              reportedAt:
                "2026-08-04",
              reportedBy:
                "Agent communal",
              status:
                "En cours",
            },
          },

          {
            id: 2,
            filterDate:
              "2026-08-05",
            values: {
              light:
                "LMP-003",
              description:
                "Diagnostic du câblage.",
              reportedAt:
                "2026-08-05",
              reportedBy:
                "Administrateur",
              status:
                "Résolue",
            },
          },
        ],
      },

      {
        id: "interventions",
        titleKey:
          "reports.sections.interventions",

        columns: [
          {
            key: "failure",
            labelKey:
              "reports.columns.failure",
          },
          {
            key: "technician",
            labelKey:
              "reports.columns.technician",
          },
          {
            key: "date",
            labelKey:
              "reports.columns.date",
          },
          {
            key: "description",
            labelKey:
              "reports.columns.description",
          },
          {
            key: "status",
            labelKey:
              "reports.columns.status",
          },
        ],

        rows: [
          {
            id: 1,
            filterDate:
              "2026-08-05",
            values: {
              failure:
                "LMP-003",
              technician:
                "Hicham El Amrani",
              date:
                "2026-08-05",
              description:
                "Diagnostic du câblage.",
              status:
                "Planifiée",
            },
          },
        ],
      },
    ],
  },
};

export const buildMockReport = (
  type: ReportType,
  startDate: string,
  endDate: string,
): ReportData => {
  const definition =
    mockReports[type];

  return {
    type,
    startDate,
    endDate,

    generatedAt:
      new Date().toISOString(),

    statistics:
      definition.statistics.map(
        (metric) => ({
          ...metric,
        }),
      ),

    sections:
      definition.sections.map(
        (section) => ({
          ...section,

          columns:
            section.columns.map(
              (column) => ({
                ...column,
              }),
            ),

          rows:
            section.rows
              .filter(
                (row) =>
                  row.filterDate >=
                    startDate &&
                  row.filterDate <=
                    endDate,
              )
              .map(
                (row) => ({
                  ...row,
                  values: {
                    ...row.values,
                  },
                }),
              ),
        }),
      ),
  };
};
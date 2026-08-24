import {
  initialMockBiens,
} from "../mock/biens";

import type {
  Bien,
  BienDocument,
  BienFormData,
  RentalOperation,
  SaleOperation,
  ArchiveReason,
} from "../types/bien";

let biens: Bien[] = [
  ...initialMockBiens,
];

const delay = (
  milliseconds = 250,
) =>
  new Promise((resolve) =>
    setTimeout(
      resolve,
      milliseconds,
    ),
  );

export const bienService = {
  async getAll(): Promise<
    Bien[]
  > {
    await delay();

    return biens
      .filter(
        (bien) =>
          !bien.archive
            .archived,
      )
      .map((bien) => ({
        ...bien,
        documents: [
          ...bien.documents,
        ],
        rentalHistory: [
          ...bien.rentalHistory,
        ],
      }));
  },

  async getArchived(): Promise<
    Bien[]
  > {
    await delay();

    return biens
      .filter(
        (bien) =>
          bien.archive
            .archived,
      )
      .map((bien) => ({
        ...bien,

        documents: [
          ...bien.documents,
        ],

        rentalHistory: [
          ...bien.rentalHistory,
        ],
      }));
  },

  async getById(
    id: number,
  ): Promise<Bien> {
    await delay();

    const bien =
      biens.find(
        (item) =>
          item.id === id,
      );

    if (!bien) {
      throw new Error(
        "Bien introuvable.",
      );
    }

    return {
      ...bien,

      documents: [
        ...bien.documents,
      ],

      rentalHistory: [
        ...bien.rentalHistory,
      ],
    };
  },

  async create(
    data: BienFormData,
  ): Promise<Bien> {
    await delay();

    const inventoryExists =
      biens.some(
        (bien) =>
          bien.inventoryId
            .toLowerCase() ===
          data.inventoryId
            .toLowerCase(),
      );

    if (inventoryExists) {
      throw new Error(
        "Cet identifiant d’inventaire existe déjà.",
      );
    }

    const newBien: Bien = {
      id:
        Math.max(
          0,
          ...biens.map(
            (bien) =>
              bien.id,
          ),
        ) + 1,

      ...data,

      inventoryId:
        data.inventoryId
          .trim()
          .toUpperCase(),

      documents:
        data.documents ?? [],

      rentalHistory: [],

      archive: {
        archived: false,
      },
    };

    biens = [
      newBien,
      ...biens,
    ];

    return newBien;
  },

  async update(
    id: number,
    data: BienFormData,
  ): Promise<Bien> {
    await delay();

    const bienIndex =
      biens.findIndex(
        (bien) =>
          bien.id === id,
      );

    if (
      bienIndex === -1
    ) {
      throw new Error(
        "Bien introuvable.",
      );
    }

    const inventoryExists =
      biens.some(
        (bien) =>
          bien.id !== id &&
          bien.inventoryId
            .toLowerCase() ===
            data.inventoryId
              .toLowerCase(),
      );

    if (inventoryExists) {
      throw new Error(
        "Cet identifiant d’inventaire existe déjà.",
      );
    }

    const currentBien =
      biens[bienIndex];

    const updatedBien: Bien = {
      ...currentBien,

      ...data,

      id,

      inventoryId:
        data.inventoryId
          .trim()
          .toUpperCase(),

      rentalHistory:
        currentBien
          .rentalHistory,

      sale:
        currentBien.sale,

      archive:
        currentBien.archive,
    };

    biens[bienIndex] =
      updatedBien;

    return updatedBien;
  },

  async addDocument(
    bienId: number,
    document: Omit<
      BienDocument,
      "id"
    >,
  ): Promise<BienDocument> {
    await delay();

    const bien =
      biens.find(
        (item) =>
          item.id ===
          bienId,
      );

    if (!bien) {
      throw new Error(
        "Bien introuvable.",
      );
    }

    const allDocuments =
      biens.flatMap(
        (item) =>
          item.documents,
      );

    const newDocument: BienDocument =
      {
        ...document,

        id:
          Math.max(
            0,
            ...allDocuments.map(
              (item) =>
                item.id,
            ),
          ) + 1,
      };

    bien.documents = [
      newDocument,
      ...bien.documents,
    ];

    return newDocument;
  },

  async rent(
    bienId: number,
    data: Omit<
      RentalOperation,
      "id" | "bienId" | "createdAt"
    >,
  ): Promise<RentalOperation> {
    await delay();

    const bien =
      biens.find(
        (item) =>
          item.id ===
          bienId,
      );

    if (!bien) {
      throw new Error(
        "Bien introuvable.",
      );
    }

    if (
      bien.archive.archived
    ) {
      throw new Error(
        "Un bien archivé ne peut pas être loué.",
      );
    }

    const allRentals =
      biens.flatMap(
        (item) =>
          item.rentalHistory,
      );

    const rental: RentalOperation =
      {
        ...data,

        id:
          Math.max(
            0,
            ...allRentals.map(
              (item) =>
                item.id,
            ),
          ) + 1,

        bienId,

        createdAt:
          new Date()
            .toISOString()
            .slice(
              0,
              10,
            ),
      };

    bien.rentalHistory = [
      rental,
      ...bien.rentalHistory,
    ];

    bien.assetStatus =
      "RENTED";

    return rental;
  },

  async sell(
    bienId: number,
    data: Omit<
      SaleOperation,
      "id" | "bienId" | "createdAt"
    >,
  ): Promise<SaleOperation> {
    await delay();

    const bien =
      biens.find(
        (item) =>
          item.id ===
          bienId,
      );

    if (!bien) {
      throw new Error(
        "Bien introuvable.",
      );
    }

    if (
      bien.archive.archived
    ) {
      throw new Error(
        "Ce bien est déjà archivé.",
      );
    }

    const sales =
      biens
        .map(
          (item) =>
            item.sale,
        )
        .filter(
          (
            sale,
          ): sale is SaleOperation =>
            Boolean(sale),
        );

    const sale: SaleOperation =
      {
        ...data,

        id:
          Math.max(
            0,
            ...sales.map(
              (item) =>
                item.id,
            ),
          ) + 1,

        bienId,

        createdAt:
          new Date()
            .toISOString()
            .slice(
              0,
              10,
            ),
      };

    bien.sale = sale;

    bien.assetStatus =
      "SOLD";

    bien.archive = {
      archived: true,

      archivedAt:
        sale.saleDate,

      reason: "SOLD",

      notes:
        data.notes,
    };

    return sale;
  },

  async archive(
    bienId: number,
    data: {
      reason: ArchiveReason;
      archivedAt: string;
      reference?: string;
      documentFileName?: string;
      notes?: string;
    },
  ): Promise<void> {
    await delay();

    const bien = biens.find(
      (item) =>
        item.id === bienId,
    );

    if (!bien) {
      throw new Error(
        "Bien introuvable.",
      );
    }

    if (bien.archive.archived) {
      throw new Error(
        "Ce bien est déjà archivé.",
      );
    }

    bien.assetStatus =
      "ARCHIVED";

    bien.archive = {
      archived: true,

      archivedAt:
        data.archivedAt,

      reason:
        data.reason,

      reference:
        data.reference,

      documentFileName:
        data.documentFileName,

      notes:
        data.notes,
    };
  },
};
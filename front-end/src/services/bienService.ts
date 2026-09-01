
import { initialMockBiens } from "../mock/biens";

import type {
  ArchiveReason,
  Bien,
  BienFormData,
  RentalOperation,
  SaleOperation,
} from "../types/bien";

import type { AppDocument } from "../types/document";

let biens: Bien[] = initialMockBiens.map(cloneBien);

const delay = (milliseconds = 250) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

function cloneBien(bien: Bien): Bien {
  return {
    ...bien,
    documents: bien.documents.map((document) => ({ ...document })),
    vehicleDetails: bien.vehicleDetails ? { ...bien.vehicleDetails } : undefined,
    machineDetails: bien.machineDetails ? { ...bien.machineDetails } : undefined,
    realEstateDetails: bien.realEstateDetails ? { ...bien.realEstateDetails } : undefined,
    rentalHistory: bien.rentalHistory.map((rental) => ({ ...rental })),
    sale: bien.sale ? { ...bien.sale } : undefined,
    archive: { ...bien.archive },
  };
}

function normalizeAssignment(
  status: BienFormData["assetStatus"],
  assignment: string,
  assignmentAr: string,
) {
  if (status !== "IN_USE") {
    return {
      assignment: "",
      assignmentAr: "",
    };
  }

  return {
    assignment: assignment.trim(),
    assignmentAr: assignmentAr.trim(),
  };
}

export const bienService = {
  async getAll(): Promise<Bien[]> {
    await delay();

    return biens
      .filter((bien) => !bien.archive.archived)
      .map(cloneBien);
  },

  async getArchived(): Promise<Bien[]> {
    await delay();

    return biens
      .filter(
        (bien) =>
          bien.archive.archived &&
          bien.archive.reason === "DISPOSED",
      )
      .map(cloneBien);
  },

  async getById(id: number): Promise<Bien> {
    await delay();

    const bien = biens.find((item) => item.id === id);

    if (!bien) {
      throw new Error("ASSET_NOT_FOUND");
    }

    return cloneBien(bien);
  },

  async create(data: BienFormData): Promise<Bien> {
    await delay();

    const inventoryId = data.inventoryId.trim().toUpperCase();

    const inventoryExists = biens.some(
      (bien) => bien.inventoryId.toUpperCase() === inventoryId,
    );

    if (inventoryExists) {
      throw new Error("INVENTORY_ALREADY_USED");
    }

    const newBien: Bien = {
      ...data,
      id: Math.max(0, ...biens.map((bien) => bien.id)) + 1,
      designation: data.designation.trim(),
      designationAr: data.designationAr.trim(),
      assetStatus: "AVAILABLE",
      assignment: "",
      assignmentAr: "",
      inventoryId,
      documents: data.documents.map((document) => ({ ...document })),
      vehicleDetails:
        data.type === "VEHICLE"
          ? { ...data.vehicleDetails }
          : undefined,
      machineDetails:
        data.type === "MACHINE"
          ? { ...data.machineDetails }
          : undefined,
      realEstateDetails:
        data.type === "REAL_ESTATE"
          ? { ...data.realEstateDetails }
          : undefined,
      rentalHistory: [],
      sale: undefined,
      archive: {
        archived: false,
      },
    };

    biens = [newBien, ...biens];

    return cloneBien(newBien);
  },

  async update(
    id: number,
    data: BienFormData,
  ): Promise<Bien> {
    await delay();

    const index = biens.findIndex((bien) => bien.id === id);

    if (index === -1) {
      throw new Error("ASSET_NOT_FOUND");
    }

    if (biens[index].archive.archived) {
      throw new Error("ARCHIVED_ASSET_READ_ONLY");
    }

    const inventoryId = data.inventoryId.trim().toUpperCase();

    const inventoryExists = biens.some(
      (bien) =>
        bien.id !== id &&
        bien.inventoryId.toUpperCase() === inventoryId,
    );

    if (inventoryExists) {
      throw new Error("INVENTORY_ALREADY_USED");
    }

    const assignment = normalizeAssignment(
      data.assetStatus,
      data.assignment,
      data.assignmentAr,
    );

    const current = biens[index];

    const updated: Bien = {
      ...current,
      ...data,
      ...assignment,
      id,
      inventoryId,
      documents: data.documents.map((document) => ({ ...document })),
      vehicleDetails:
        data.type === "VEHICLE"
          ? { ...data.vehicleDetails }
          : undefined,
      machineDetails:
        data.type === "MACHINE"
          ? { ...data.machineDetails }
          : undefined,
      realEstateDetails:
        data.type === "REAL_ESTATE"
          ? { ...data.realEstateDetails }
          : undefined,
      rentalHistory: current.rentalHistory,
      sale: current.sale,
      archive: current.archive,
    };

    biens[index] = updated;

    return cloneBien(updated);
  },

  async addDocument(
    bienId: number,
    document: Omit<AppDocument, "id">,
  ): Promise<AppDocument> {
    await delay();

    const bien = biens.find((item) => item.id === bienId);

    if (!bien) {
      throw new Error("ASSET_NOT_FOUND");
    }

    const allDocuments = biens.flatMap((item) => item.documents);

    const newDocument: AppDocument = {
      ...document,
      id:
        Math.max(
          0,
          ...allDocuments.map((item) => item.id),
        ) + 1,
    };

    bien.documents = [newDocument, ...bien.documents];

    return { ...newDocument };
  },

  async rent(
    bienId: number,
    data: Omit<
      RentalOperation,
      "id" | "bienId" | "createdAt"
    >,
  ): Promise<RentalOperation> {
    await delay();

    const bien = biens.find((item) => item.id === bienId);

    if (!bien || bien.archive.archived) {
      throw new Error("ASSET_NOT_AVAILABLE");
    }

    const allRentals = biens.flatMap((item) => item.rentalHistory);

    const rental: RentalOperation = {
      ...data,
      id:
        Math.max(
          0,
          ...allRentals.map((item) => item.id),
        ) + 1,
      bienId,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    bien.rentalHistory = [rental, ...bien.rentalHistory];
    bien.assetStatus = "RENTED";
    bien.assignment = "";
    bien.assignmentAr = "";

    return { ...rental };
  },

  async sell(
    bienId: number,
    data: Omit<
      SaleOperation,
      "id" | "bienId" | "createdAt"
    >,
  ): Promise<SaleOperation> {
    await delay();

    const bien = biens.find((item) => item.id === bienId);

    if (!bien || bien.archive.archived) {
      throw new Error("ASSET_NOT_AVAILABLE");
    }

    const sales = biens
      .map((item) => item.sale)
      .filter((sale): sale is SaleOperation => Boolean(sale));

    const sale: SaleOperation = {
      ...data,
      id: Math.max(0, ...sales.map((item) => item.id)) + 1,
      bienId,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    bien.sale = sale;
    bien.assetStatus = "DISPOSED";
    bien.assignment = "";
    bien.assignmentAr = "";
    bien.archive = {
      archived: true,
      archivedAt: sale.saleDate,
      reason: "DISPOSED",
      reference: sale.contractReference,
      documentFileName: sale.contractFileName,
      notes: sale.notes,
    };

    return { ...sale };
  },

  async archive(
    bienId: number,
    data: {
      reason?: ArchiveReason;
      archivedAt: string;
      reference?: string;
      documentFileName?: string;
      notes?: string;
    },
  ): Promise<void> {
    await delay();

    const bien = biens.find((item) => item.id === bienId);

    if (!bien || bien.archive.archived) {
      throw new Error("ASSET_NOT_AVAILABLE");
    }

    bien.assetStatus = "DISPOSED";
    bien.assignment = "";
    bien.assignmentAr = "";
    bien.archive = {
      archived: true,
      archivedAt: data.archivedAt,
      reason: "DISPOSED",
      reference: data.reference,
      documentFileName: data.documentFileName,
      notes: data.notes,
    };
  },

  async remove(id: number): Promise<void> {
    await delay();
    biens = biens.filter((bien) => bien.id !== id);
  },
};

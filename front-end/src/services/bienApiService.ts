import api from "./api";

import type {
  AssetStatus,
  AssetType,
  BienFormData,
} from "../types/bien";

import type {
  AppDocument,
  DocumentType,
} from "../types/document";

export interface BienApiListItem {
  key: string;
  id?: number;
  type?: AssetType;
  designation: string;
  inventoryNumber: string;
  assetStatus: AssetStatus;
  acquisitionDate: string;
  assignment?: string;
  purchaseValue?: number;
  archivedAt?: string;
  raw: Record<string, unknown>;
}

export type DisposalMethod =
  | "SALE"
  | "DONATION"
  | "TRANSFER"
  | "SCRAPPING";

export interface RentalPayload {
  startDate: string;
  endDate: string;
  frequency: number;
  amount: number;
  tenantName: string;
}

export interface DisposalPayload {
  disposalDate: string;
  amount: number;
  disposalMethod: DisposalMethod;
  purchaser: string;
}

type BackendAsset = {
  id?: number | string;

  inventoryNumber?: string;
  inventory_id?: string;
  designation?: string;

  assetStatus?: AssetStatus;
  asset_status?: AssetStatus;

  acquisitionDate?: string;
  acquisition_date?: string;

  assignment?: string;

  acquisitionValue?: number | string;
  purchaseValue?: number | string;
  purchase_value?: number | string;

  archivedAt?: string;

  // Vehicle
  registrationNumber?: string;
  chassisNumber?: string;
  make?: string;
  fiscalHorsepower?: number | string;
  firstRegistrationDate?: string;
  odometer?: number | string;
  manufactureYear?: number | string;

  // Machine
  serialNumber?: string;
  brand?: string;
  model?: string;
  power?: number | string;
  technicalRef?: string;

  // Real estate
  landTitleReference?: string;
  cadastralReference?: string;
  areaM2?: number | string;
  gpsLocation?: string;
  domain?: "PRIVATE" | "PUBLIC";
  realEstateType?: string;

  disposal?: {
    disposalDate?: string;
  } | null;

  disposalDate?: string;
  documentResponseDtoSet?: unknown[];
};

const BASE_PATHS: Record<AssetType, string> = {
  VEHICLE: "/sgpbse/vehicle",
  MACHINE: "/sgpbse/machine",
  REAL_ESTATE: "/sgpbse/real_estate",
};

function optionalString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function inferType(asset: BackendAsset): AssetType | undefined {
  if (
    Object.prototype.hasOwnProperty.call(asset, "registrationNumber") ||
    Object.prototype.hasOwnProperty.call(asset, "chassisNumber") ||
    Object.prototype.hasOwnProperty.call(asset, "make")
  ) {
    return "VEHICLE";
  }

  if (
    Object.prototype.hasOwnProperty.call(asset, "serialNumber") ||
    Object.prototype.hasOwnProperty.call(asset, "brand") ||
    Object.prototype.hasOwnProperty.call(asset, "model")
  ) {
    return "MACHINE";
  }

  if (
    Object.prototype.hasOwnProperty.call(asset, "landTitleReference") ||
    Object.prototype.hasOwnProperty.call(asset, "cadastralReference") ||
    Object.prototype.hasOwnProperty.call(asset, "areaM2") ||
    Object.prototype.hasOwnProperty.call(asset, "realEstateType")
  ) {
    return "REAL_ESTATE";
  }

  return undefined;
}

function mapAsset(
  asset: BackendAsset,
  index: number,
  forcedType?: AssetType,
): BienApiListItem {
  const type = forcedType ?? inferType(asset);
  const id = optionalNumber(asset.id);

  const inventoryNumber =
    optionalString(asset.inventoryNumber ?? asset.inventory_id) ?? "—";

  const designation =
    optionalString(asset.designation) ?? "—";

  const acquisitionDate =
    optionalString(asset.acquisitionDate ?? asset.acquisition_date) ?? "";

  const assignment =
    optionalString(asset.assignment);

  const purchaseValue =
    optionalNumber(
      asset.purchaseValue ??
        asset.purchase_value ??
        asset.acquisitionValue,
    );

  const assetStatus = (
    asset.assetStatus ??
    asset.asset_status ??
    "AVAILABLE"
  ) as AssetStatus;

  const archivedAt =
    optionalString(
      asset.archivedAt ??
        asset.disposal?.disposalDate ??
        asset.disposalDate,
    );

  return {
    key:
      id !== undefined
        ? `asset-${id}`
        : `${type ?? "ASSET"}-${inventoryNumber}-${index}`,
    id,
    type,
    designation,
    inventoryNumber,
    assetStatus,
    acquisitionDate,
    assignment,
    purchaseValue,
    archivedAt,
    raw: { ...asset },
  };
}

function buildRequestPayload(
  data: BienFormData,
): Record<string, unknown> {
  const basePayload = {
    inventoryNumber: data.inventoryId.trim(),
    designation: data.designation.trim(),
    acquisitionDate: data.acquisitionDate,
    acquisitionValue: data.purchaseValue,
    assignment: data.assignment.trim(),
  };

  if (data.type === "VEHICLE") {
    return {
      ...basePayload,
      registrationNumber:
        data.vehicleDetails?.registrationNumber?.trim() ?? "",
      chassisNumber:
        data.vehicleDetails?.chassisNumber?.trim() ?? "",
      make:
        data.vehicleDetails?.brand?.trim() ?? "",
      fiscalHorsepower:
        data.vehicleDetails?.fiscalHorsepower ?? 0,
      firstRegistrationDate:
        data.vehicleDetails?.firstRegistrationDate ?? null,
      odometer:
        (data.vehicleDetails as Record<string, unknown> | undefined)?.odometer ??
        null,
      manufactureYear:
        data.vehicleDetails?.year ?? 0,
    };
  }

  if (data.type === "MACHINE") {
    return {
      ...basePayload,
      serialNumber:
        data.machineDetails?.serialNumber?.trim() ?? "",
      brand:
        data.machineDetails?.brand?.trim() ?? "",
      model:
        data.machineDetails?.model?.trim() ?? "",
      power:
        data.machineDetails?.powerKw ?? null,
      technicalRef:
        data.machineDetails?.technicalReference?.trim() ?? null,
    };
  }

  return {
    ...basePayload,
    landTitleReference:
      data.realEstateDetails?.landTitleNumber?.trim() ?? "",
    cadastralReference:
      data.realEstateDetails?.cadastralReference?.trim() ?? "",
    areaM2:
      data.realEstateDetails?.surface ?? null,
    gpsLocation:
      data.realEstateDetails?.address?.trim() ?? "",
    domain:
      data.realEstateDetails?.domain ?? null,
    realEstateType:
      data.realEstateDetails?.propertyType?.trim() ?? "",
  };
}


const FRONT_DOCUMENT_TYPES: DocumentType[] = [
  "INVOICE",
  "RECEIPT",
  "CONTRACT",
  "REGISTRATION",
  "INSURANCE",
  "CERTIFICATE",
  "DELIVERY_NOTE",
  "EXIT_VOUCHER",
  "TECHNICAL_SHEET",
  "WARRANTY",
  "REPORT",
  "PHOTO",
  "OTHER",
];

export function mapBackendDocuments(
  raw: unknown,
): AppDocument[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter(
      (
        item,
      ): item is Record<string, unknown> =>
        typeof item === "object" &&
        item !== null,
    )
    .map((item, index) => {
      const rawType =
        typeof item.type === "string"
          ? item.type
          : "OTHER";

      const type: DocumentType =
        FRONT_DOCUMENT_TYPES.includes(
          rawType as DocumentType,
        )
          ? (rawType as DocumentType)
          : "OTHER";

      const path =
        typeof item.path === "string"
          ? item.path
          : "";

      const fileName =
        path
          .replace(/\\/g, "/")
          .split("/")
          .pop() ||
        path ||
        "document";

      const name =
        (typeof item.title_fr === "string" &&
          item.title_fr.trim()) ||
        (typeof item.title_ar === "string" &&
          item.title_ar.trim()) ||
        fileName;

      return {
        id: -(index + 1),

        backendId:
          optionalNumber(
            item.id,
          ),

        name,

        category:
          item.documentType === "DOCUMENT_OFFICIEL"
            ? "OFFICIAL"
            : "ATTACHMENT",

        type,
        fileName,
        uploadDate: "",

        expirationDate:
          typeof item.endDate === "string"
            ? item.endDate
            : undefined,

        reminderDaysBefore:
          optionalNumber(
            item.alertThreshold,
          ),

        backendPath:
          path || undefined,
      };
    });
}

function buildDocumentPayload(
  document: AppDocument,
) {
  return {
    title_fr: document.name,
    title_ar: document.name,
    path: null,

    documentType:
      document.category === "OFFICIAL"
        ? "DOCUMENT_OFFICIEL"
        : "PIECE_JOINTE",

    type: document.type,

    endDate:
      document.category === "OFFICIAL"
        ? document.expirationDate ?? null
        : null,

    alertThreshold:
      document.category === "OFFICIAL"
        ? document.reminderDaysBefore ?? 7
        : null,
  };
}

async function uploadOneDocument(
  endpoint: string,
  document: AppDocument,
): Promise<void> {
  if (!document.file) {
    return;
  }

  const formData = new FormData();

  formData.append(
    "file",
    document.file,
  );

  formData.append(
    "data",
    new Blob(
      [
        JSON.stringify(
          buildDocumentPayload(document),
        ),
      ],
      {
        type: "application/json",
      },
    ),
  );

  await api.post(
    endpoint,
    formData,
  );
}

async function uploadDocuments(
  endpoint: string,
  documents: AppDocument[],
): Promise<void> {
  for (const document of documents) {
    if (document.file) {
      await uploadOneDocument(
        endpoint,
        document,
      );
    }
  }
}

async function loadType(
  endpoint: string,
  type: AssetType,
): Promise<BienApiListItem[]> {
  const response =
    await api.get<BackendAsset[]>(endpoint);

  return response.data.map(
    (item, index) =>
      mapAsset(item, index, type),
  );
}

export const bienApiService = {
  async getVehicles(): Promise<BienApiListItem[]> {
    return loadType(
      "/sgpbse/vehicle/all",
      "VEHICLE",
    );
  },

  async getMachines(): Promise<BienApiListItem[]> {
    return loadType(
      "/sgpbse/machine/all",
      "MACHINE",
    );
  },

  async getRealEstates(): Promise<BienApiListItem[]> {
    return loadType(
      "/sgpbse/real_estate/all",
      "REAL_ESTATE",
    );
  },

  async getAll(): Promise<BienApiListItem[]> {
    const [vehicles, machines, realEstates] =
      await Promise.all([
        this.getVehicles(),
        this.getMachines(),
        this.getRealEstates(),
      ]);

    return [
      ...vehicles,
      ...machines,
      ...realEstates,
    ];
  },

  async getArchived(): Promise<BienApiListItem[]> {
    const response =
      await api.get<BackendAsset[]>(
        "/sgpbse/asset/archived",
      );

    return response.data.map(
      (item, index) =>
        mapAsset(item, index),
    );
  },

  async getAssetInfo(
    id: number,
    forcedType?: AssetType,
  ): Promise<BienApiListItem> {
    const response =
      await api.get<BackendAsset>(
        `/sgpbse/asset/infos/${id}`,
      );

    return {
      ...mapAsset(
        response.data,
        0,
        forcedType,
      ),
      id,
      key: `asset-${id}`,
    };
  },

  async getById(
    id: number,
    type: AssetType,
  ): Promise<BienApiListItem> {
    const response =
      await api.get<BackendAsset>(
        `${BASE_PATHS[type]}/${id}`,
      );

    return {
      ...mapAsset(
        response.data,
        0,
        type,
      ),
      id,
      type,
      key: `asset-${id}`,
    };
  },

  async create(
    data: BienFormData,
  ): Promise<BienApiListItem> {
    const response =
      await api.post<BackendAsset>(
        `${BASE_PATHS[data.type]}/create`,
        buildRequestPayload(data),
      );

    return mapAsset(
      response.data,
      0,
      data.type,
    );
  },

  async update(
    id: number,
    data: BienFormData,
  ): Promise<void> {
    await api.put(
      `${BASE_PATHS[data.type]}/update/${id}`,
      buildRequestPayload(data),
    );
  },

  async remove(
    id: number,
    type: AssetType,
  ): Promise<void> {
    await api.delete(
      `${BASE_PATHS[type]}/delete/${id}`,
    );
  },

  async rent(
    assetId: number,
    payload: RentalPayload,
  ): Promise<number> {
    const response =
      await api.post<number>(
        `/sgpbse/rental/rent/${assetId}`,
        payload,
      );

    return response.data;
  },

  async dispose(
    assetId: number,
    payload: DisposalPayload,
  ): Promise<number> {
    const response =
      await api.post<number>(
        `/sgpbse/disposal/dispose/${assetId}`,
        payload,
      );

    return response.data;
  },

  async updateStatus(
    id: number,
    status: AssetStatus,
  ): Promise<void> {
    const allowedManualStatuses: AssetStatus[] = [
      "AVAILABLE",
      "IN_USE",
      "OUT_OF_SERVICE",
      "DAMAGED",
    ];

    if (!allowedManualStatuses.includes(status)) {
      throw new Error("STATUS_MANAGED_BY_BUSINESS_OPERATION");
    }

    await api.post(
      `/sgpbse/asset/update/${id}`,
      status,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  },


  async uploadAssetDocuments(
    assetId: number,
    documents: AppDocument[],
  ): Promise<void> {
    await uploadDocuments(
      `/sgpbse/asset/joinDoc/${assetId}`,
      documents,
    );
  },

  async uploadRentalDocuments(
    rentalId: number,
    documents: AppDocument[],
  ): Promise<void> {
    await uploadDocuments(
      `/sgpbse/rental/joinDoc/${rentalId}`,
      documents,
    );
  },

  async uploadDisposalDocuments(
    disposalId: number,
    documents: AppDocument[],
  ): Promise<void> {
    await uploadDocuments(
      `/sgpbse/disposal/joinDoc/${disposalId}`,
      documents,
    );
  },


  async downloadDocumentBlob(
    documentId: number,
  ): Promise<Blob> {
    const response =
      await api.get<Blob>(
        `/sgpbse/document/${documentId}/content`,
        {
          responseType: "blob",
        },
      );

    return response.data;
  },

  async downloadDocumentBytes(
    documentId: number,
  ): Promise<ArrayBuffer> {
    const response =
      await api.get<ArrayBuffer>(
        `/sgpbse/document/${documentId}/content`,
        {
          responseType: "arraybuffer",
        },
      );

    return response.data;
  },

  async openDocument(
    documentId: number,
  ): Promise<void> {
    const blob =
      await this.downloadDocumentBlob(
        documentId,
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    window.open(
      url,
      "_blank",
      "noopener,noreferrer",
    );

    window.setTimeout(
      () =>
        URL.revokeObjectURL(
          url,
        ),
      60_000,
    );
  },

};

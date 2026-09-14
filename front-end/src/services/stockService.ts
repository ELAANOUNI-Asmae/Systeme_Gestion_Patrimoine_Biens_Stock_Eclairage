import api from "./api";
import type { AppDocument, DocumentType } from "../types/document";
import type {
  RestockAlert,
  StockArticle,
  StockArticleFormData,
  StockMovement,
  StockMovementType,
  StockUnit,
  SupplyRequest,
  SupplyRequestStatus,
} from "../types/stock";

type Json = Record<string, unknown>;

const text = (value: unknown, fallback = "") =>
  value == null ? fallback : String(value).trim();
const num = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const isoToday = () => new Date().toISOString().slice(0, 10);

function apiError(error: unknown): Error {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;
    if (typeof data === "string" && data.trim()) return new Error(data);
    if (typeof data === "object" && data !== null) {
      const object = data as Json;
      const message = text(object.message || object.error);
      if (message) return new Error(message);
    }
  }
  return error instanceof Error ? error : new Error("Erreur serveur.");
}

function unit(value: unknown): StockUnit {
  const normalized = text(value, "UNITE").toUpperCase();
  const allowed: StockUnit[] = ["UNITE", "BOITE", "PAQUET", "LITRE", "KILOGRAMME", "METRE"];
  return allowed.includes(normalized as StockUnit) ? (normalized as StockUnit) : "UNITE";
}

const documentTypes: DocumentType[] = [
  "INVOICE", "RECEIPT", "CONTRACT", "REGISTRATION", "INSURANCE", "CERTIFICATE",
  "DELIVERY_NOTE", "EXIT_VOUCHER", "TECHNICAL_SHEET", "WARRANTY", "REPORT", "PHOTO", "OTHER",
];

function mapDocuments(raw: unknown): AppDocument[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is Json => typeof x === "object" && x !== null).map((d, index) => {
    const id = num(d.id, -(index + 1));
    const path = text(d.path);
    const fileName = path.replace(/\\/g, "/").split("/").pop() || path || "document";
    const rawType = text(d.type, "OTHER") as DocumentType;
    return {
      id,
      backendId: id > 0 ? id : undefined,
      name: text(d.title_fr || d.title_ar, fileName),
      category: text(d.documentType) === "DOCUMENT_OFFICIEL" ? "OFFICIAL" : "ATTACHMENT",
      type: documentTypes.includes(rawType) ? rawType : "OTHER",
      fileName,
      uploadDate: text(d.uploadDate, ""),
      expirationDate: text(d.endDate) || undefined,
      reminderDaysBefore: d.alertThreshold == null ? undefined : num(d.alertThreshold),
      backendPath: path || undefined,
    };
  });
}

function mapArticle(raw: Json): StockArticle {
  return {
    id: num(raw.id),
    reference: text(raw.reference).toUpperCase(),
    barcode: text(raw.serialNumber),
    brand: text(raw.brand),
    designation: text(raw.name),
    designationAr: text(raw.designationAr, text(raw.name)),
    category: text(raw.category),
    categoryAr: text(raw.categoryAr, text(raw.category)),
    quantity: num(raw.quantity),
    minimumQuantity: num(raw.alertThreshold),
    unit: unit(raw.unit),
    location: text(raw.location_fr),
    locationAr: text(raw.location_ar),
    unitPriceHt: num(raw.price),
    vatRate: num(raw.vatRate),
    documents: mapDocuments(raw.documents),
    updatedAt: text(raw.updatedAt, isoToday()),
  };
}

function itemPayload(data: StockArticleFormData) {
  return {
    reference: data.reference.trim().toUpperCase(),
    name: data.designation.trim(),
    designationAr: data.designationAr.trim(),
    serialNumber: data.barcode.trim(),
    category: data.category.trim(),
    categoryAr: data.categoryAr.trim(),
    quantity: data.quantity,
    alertThreshold: data.minimumQuantity,
    price: data.unitPriceHt,
    vatRate: data.vatRate,
    unit: data.unit,
    brand: data.brand.trim(),
    location_fr: data.location.trim(),
    location_ar: data.locationAr.trim(),
  };
}

function mapMovement(raw: Json): StockMovement {
  return {
    id: num(raw.id),
    articleId: num(raw.articleId),
    articleDesignation: text(raw.articleDesignation),
    articleDesignationAr: text(raw.articleDesignationAr, text(raw.articleDesignation)),
    type: text(raw.type) === "EXIT" ? "EXIT" : "ENTRY",
    quantity: num(raw.quantity),
    reason: text(raw.reason),
    supplierOrBeneficiary: text(raw.supplierOrBeneficiary) || undefined,
    reference: text(raw.reference) || undefined,
    performedBy: text(raw.performedBy, "Agent"),
    date: text(raw.date, isoToday()),
    unitPriceHt: num(raw.unitPriceHt),
    vatRate: num(raw.vatRate),
    documents: mapDocuments(raw.documents),
    supplyRequestId: raw.supplyRequestId == null ? undefined : num(raw.supplyRequestId),
  };
}

function mapRequest(raw: Json): SupplyRequest {
  const statusRaw = text(raw.status, "PENDING");
  const status: SupplyRequestStatus = statusRaw === "ISSUED" || statusRaw === "RECEIVED"
    ? "RECEIVED"
    : statusRaw === "APPROVED" ? "APPROVED" : statusRaw === "REJECTED" || statusRaw === "CANCELLED" ? "REJECTED" : "PENDING";
  return {
    id: num(raw.id),
    articleId: num(raw.articleId),
    articleDesignation: text(raw.articleDesignation),
    articleDesignationAr: text(raw.articleDesignationAr, text(raw.articleDesignation)),
    requestedQuantity: num(raw.requestedQuantity),
    requesterId: num(raw.requesterId),
    requester: text(raw.requester),
    reason: text(raw.reason),
    requestDate: text(raw.requestDate, isoToday()),
    status,
    rejectionReason: text(raw.rejectionReason) || (statusRaw === "CANCELLED" ? "Annulée" : undefined),
    decisionDate: text(raw.decisionDate) || undefined,
    receivedAt: text(raw.receivedAt) || undefined,
    documents: mapDocuments(raw.documents),
  };
}

function mapRestock(raw: Json): RestockAlert {
  return {
    id: num(raw.id),
    articleId: num(raw.articleId),
    articleDesignation: text(raw.articleDesignation),
    articleDesignationAr: text(raw.articleDesignationAr, text(raw.articleDesignation)),
    requestedQuantity: num(raw.requestedQuantity),
    availableQuantityAtRequest: num(raw.availableQuantityAtRequest),
    requesterId: num(raw.requesterId),
    requester: text(raw.requester),
    reason: text(raw.reason),
    createdAt: text(raw.createdAt, isoToday()),
    status: text(raw.status) === "READY_NOTIFIED" ? "READY_NOTIFIED" : "WAITING",
    readyNotifiedAt: text(raw.readyNotifiedAt) || undefined,
  };
}

function documentPayload(document: AppDocument) {
  return {
    title_fr: document.name,
    title_ar: document.name,
    path: null,
    documentType: document.category === "OFFICIAL" ? "DOCUMENT_OFFICIEL" : "PIECE_JOINTE",
    type: document.type,
    endDate: document.category === "OFFICIAL" ? document.expirationDate ?? null : null,
    alertThreshold: document.category === "OFFICIAL" ? document.reminderDaysBefore ?? 7 : null,
  };
}

async function uploadOne(endpoint: string, document: AppDocument) {
  if (!document.file) return;
  const form = new FormData();
  form.append("file", document.file);
  form.append("data", new Blob([JSON.stringify(documentPayload(document))], { type: "application/json" }));
  await api.post(endpoint, form, { headers: { "Content-Type": "multipart/form-data" } });
}

async function uploadMany(endpoint: string, documents: AppDocument[]) {
  for (const document of documents) await uploadOne(endpoint, document);
}

export const stockService = {
  async getArticles(): Promise<StockArticle[]> {
    try { return (await api.get<Json[]>("/sgpbse/item/all")).data.map(mapArticle); } catch (e) { throw apiError(e); }
  },
  async getArticleById(id: number): Promise<StockArticle> {
    try { return mapArticle((await api.get<Json>(`/sgpbse/item/${id}`)).data); } catch (e) { throw apiError(e); }
  },
  async createArticle(data: StockArticleFormData): Promise<StockArticle> {
    try {
      const created = mapArticle((await api.post<Json>("/sgpbse/item/create", itemPayload(data))).data);
      await uploadMany(`/sgpbse/item/joinDoc/${created.id}`, data.documents);
      return await this.getArticleById(created.id);
    } catch (e) { throw apiError(e); }
  },
  async updateArticle(id: number, data: StockArticleFormData): Promise<StockArticle> {
    try {
      const before = await this.getArticleById(id);
      const keptIds = new Set(data.documents.map((d) => d.backendId ?? (d.id > 0 ? d.id : undefined)).filter((x): x is number => x !== undefined));
      for (const old of before.documents) {
        const backendId = old.backendId ?? (old.id > 0 ? old.id : undefined);
        if (backendId && !keptIds.has(backendId)) await api.delete(`/sgpbse/item/${id}/document/${backendId}`);
      }
      await api.put(`/sgpbse/item/update/${id}`, itemPayload(data));
      await uploadMany(`/sgpbse/item/joinDoc/${id}`, data.documents);
      return await this.getArticleById(id);
    } catch (e) { throw apiError(e); }
  },
  async removeArticle(id: number): Promise<void> {
    try { await api.delete(`/sgpbse/item/delete/${id}`); } catch (e) { throw apiError(e); }
  },
  async getMovements(): Promise<StockMovement[]> {
    try { return (await api.get<Json[]>("/sgpbse/stockMovement/all")).data.map(mapMovement); } catch (e) { throw apiError(e); }
  },
  async getMovementsByArticleId(articleId: number): Promise<StockMovement[]> {
    try { return (await api.get<Json[]>(`/sgpbse/stockMovement/item/${articleId}`)).data.map(mapMovement); } catch (e) { throw apiError(e); }
  },
  async createMovement(data: {
    articleId: number; type: StockMovementType; quantity: number; reason: string;
    supplierOrBeneficiary?: string; reference?: string; performedBy: string; date?: string;
    documents?: AppDocument[]; unitPriceHt?: number; vatRate?: number;
  }): Promise<StockMovement> {
    try {
      const path = data.type === "ENTRY" ? "entry" : "exit";
      const response = await api.post<Json>(`/sgpbse/stockMovement/${path}/${data.articleId}`, {
        quantity: data.quantity,
        reason: data.reason,
        supplierOrBeneficiary: data.supplierOrBeneficiary ?? null,
        reference: data.reference ?? null,
        date: data.date ?? isoToday(),
        unitPriceHt: data.unitPriceHt ?? null,
        vatRate: data.vatRate ?? null,
      });
      const movement = mapMovement(response.data);
      await uploadMany(`/sgpbse/stockMovement/joinDoc/${movement.id}`, data.documents ?? []);
      return (await this.getMovements()).find((m) => m.id === movement.id) ?? movement;
    } catch (e) { throw apiError(e); }
  },
  async getRequests(): Promise<SupplyRequest[]> {
    try { return (await api.get<Json[]>("/sgpbse/itemRequest/all")).data.map(mapRequest); } catch (e) { throw apiError(e); }
  },
  async createRequest(data: { articleId: number; requestedQuantity: number; requesterId: number; requester: string; reason: string; documents?: AppDocument[] }): Promise<SupplyRequest> {
    try {
      const response = await api.post<Json>(`/sgpbse/itemRequest/create/${data.articleId}`, {
        providerId: data.requesterId, requestDate: isoToday(), quantity: data.requestedQuantity, reason: data.reason,
      });
      const request = mapRequest(response.data);
      await uploadMany(`/sgpbse/itemRequest/joinDoc/${request.id}`, data.documents ?? []);
      return (await this.getRequests()).find((r) => r.id === request.id) ?? request;
    } catch (e) { throw apiError(e); }
  },
  async updateRequestStatus(id: number, status: Extract<SupplyRequestStatus, "APPROVED" | "REJECTED">, rejectionReason?: string): Promise<SupplyRequest> {
    try {
      const response = status === "APPROVED"
        ? await api.post<Json>(`/sgpbse/itemRequest/aprouve/${id}`)
        : await api.post<Json>(`/sgpbse/itemRequest/reject/${id}`, rejectionReason ?? "", { headers: { "Content-Type": "text/plain" } });
      return mapRequest(response.data);
    } catch (e) { throw apiError(e); }
  },
  async confirmRequestReceipt(id: number, _requesterId: number, _performedBy: string): Promise<SupplyRequest> {
    try { return mapRequest((await api.post<Json>(`/sgpbse/itemRequest/confirm/${id}`)).data); } catch (e) { throw apiError(e); }
  },
  async getRestockAlerts(): Promise<RestockAlert[]> {
    try { return (await api.get<Json[]>("/sgpbse/lowStockAlert/restock/all")).data.map(mapRestock); } catch (e) { throw apiError(e); }
  },
  async createRestockAlert(data: { articleId: number; requestedQuantity: number; requesterId: number; requester: string; reason: string }): Promise<RestockAlert> {
    try { return mapRestock((await api.post<Json>(`/sgpbse/lowStockAlert/restock/create/${data.articleId}`, { requestedQuantity: data.requestedQuantity, reason: data.reason })).data); } catch (e) { throw apiError(e); }
  },
  async markRestockReady(id: number): Promise<RestockAlert> {
    try { return mapRestock((await api.post<Json>(`/sgpbse/lowStockAlert/restock/ready/${id}`)).data); } catch (e) { throw apiError(e); }
  },
};

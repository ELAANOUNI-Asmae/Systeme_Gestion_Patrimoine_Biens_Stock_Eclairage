
import type { AppDocument } from "./document";

export type StockUnit =
  | "UNITE"
  | "BOITE"
  | "PAQUET"
  | "LITRE"
  | "KILOGRAMME"
  | "METRE";

export type SupplyRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "RECEIVED";

export type StockMovementType =
  | "ENTRY"
  | "EXIT";

export type RestockAlertStatus =
  | "WAITING"
  | "READY_NOTIFIED";

export interface StockArticle {
  id: number;

  reference: string;
  barcode: string;
  brand: string;

  designation: string;
  designationAr: string;

  category: string;
  categoryAr: string;

  quantity: number;
  minimumQuantity: number;

  unit: StockUnit;

  location: string;
  locationAr: string;

  unitPriceHt: number;
  vatRate: number;

  documents: AppDocument[];

  updatedAt: string;
}

export interface StockArticleFormData {
  reference: string;
  barcode: string;
  brand: string;

  designation: string;
  designationAr: string;

  category: string;
  categoryAr: string;

  quantity: number;
  minimumQuantity: number;

  unit: StockUnit;

  location: string;
  locationAr: string;

  unitPriceHt: number;
  vatRate: number;

  documents: AppDocument[];
}

export interface StockMovement {
  id: number;

  articleId: number;

  articleDesignation: string;
  articleDesignationAr: string;

  type: StockMovementType;

  quantity: number;
  reason: string;

  supplierOrBeneficiary?: string;
  reference?: string;

  performedBy: string;
  date: string;

  unitPriceHt: number;
  vatRate: number;

  documents: AppDocument[];

  supplyRequestId?: number;
}

export interface SupplyRequest {
  id: number;

  articleId: number;
  articleDesignation: string;
  articleDesignationAr: string;

  requestedQuantity: number;

  requesterId: number;
  requester: string;

  reason: string;
  requestDate: string;

  status: SupplyRequestStatus;

  rejectionReason?: string;
  decisionDate?: string;
  receivedAt?: string;

  documents: AppDocument[];
}

export interface RestockAlert {
  id: number;

  articleId: number;
  articleDesignation: string;
  articleDesignationAr: string;

  requestedQuantity: number;
  availableQuantityAtRequest: number;

  requesterId: number;
  requester: string;

  reason: string;
  createdAt: string;

  status: RestockAlertStatus;
  readyNotifiedAt?: string;
}

export interface StockFilters {
  search: string;
  category: string;
  alertOnly: boolean;
}

export function calculateUnitPriceTtc(
  unitPriceHt: number,
  vatRate: number,
) {
  return unitPriceHt * (1 + vatRate / 100);
}

export function calculateTotalHt(
  quantity: number,
  unitPriceHt: number,
) {
  return quantity * unitPriceHt;
}

export function calculateTotalTtc(
  quantity: number,
  unitPriceHt: number,
  vatRate: number,
) {
  return quantity * calculateUnitPriceTtc(
    unitPriceHt,
    vatRate,
  );
}

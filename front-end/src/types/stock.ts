import type {
  AppDocument,
} from "./document";

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
  | "REJECTED";

export type StockMovementType =
  | "ENTRY"
  | "EXIT";

export interface StockArticle {
  id: number;

  reference: string;

  serialNumber?: string;

  barcode?: string;

  designation: string;
  designationAr: string;

  category: string;
  categoryAr: string;

  quantity: number;
  minimumQuantity: number;

  unit: StockUnit;

  location: string;
  locationAr: string;

  documents: AppDocument[];

  updatedAt: string;
}

export interface StockArticleFormData {
  reference: string;

  serialNumber?: string;

  barcode?: string;

  designation: string;
  designationAr: string;

  category: string;
  categoryAr: string;

  quantity: number;
  minimumQuantity: number;

  unit: StockUnit;

  location: string;
  locationAr: string;

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

  documents: AppDocument[];
}

export interface SupplyRequest {
  id: number;

  articleDesignation: string;
  articleDesignationAr?: string;

  requestedQuantity: number;

  requester: string;

  reason: string;

  requestDate: string;

  status: SupplyRequestStatus;

  documents: AppDocument[];
}

export interface StockFilters {
  search: string;

  category: string;

  alertOnly: boolean;
}
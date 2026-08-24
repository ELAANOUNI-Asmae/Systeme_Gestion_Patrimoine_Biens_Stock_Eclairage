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

export type StockDocumentType =
  | "INVOICE"
  | "RECEIPT"
  | "DELIVERY_NOTE"
  | "EXIT_VOUCHER"
  | "OTHER";

export interface StockDocument {
  id: number;
  name: string;
  type: StockDocumentType;
  fileName: string;
  uploadDate: string;
}

export interface StockArticle {
  id: number;

  reference: string;

  designation: string;
  designationAr: string;

  category: string;
  categoryAr: string;

  quantity: number;
  minimumQuantity: number;

  unit: StockUnit;

  location: string;
  locationAr: string;

  updatedAt: string;
}

export interface StockArticleFormData {
  reference: string;

  designation: string;
  designationAr: string;

  category: string;
  categoryAr: string;

  quantity: number;
  minimumQuantity: number;

  unit: StockUnit;

  location: string;
  locationAr: string;
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

  documents: StockDocument[];
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
}

export interface StockFilters {
  search: string;

  category: string;

  alertOnly: boolean;
}
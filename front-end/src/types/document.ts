
export type DocumentCategory =
  | "OFFICIAL"
  | "ATTACHMENT";

export type DocumentType =
  | "INVOICE"
  | "RECEIPT"
  | "CONTRACT"
  | "REGISTRATION"
  | "INSURANCE"
  | "CERTIFICATE"
  | "DELIVERY_NOTE"
  | "EXIT_VOUCHER"
  | "TECHNICAL_SHEET"
  | "WARRANTY"
  | "REPORT"
  | "PHOTO"
  | "OTHER";

export interface AppDocument {
  id: number;
  name: string;
  category: DocumentCategory;
  type: DocumentType;
  fileName: string;
  uploadDate: string;
  expirationDate?: string;
  reminderDaysBefore?: number;
  file?: File;
}

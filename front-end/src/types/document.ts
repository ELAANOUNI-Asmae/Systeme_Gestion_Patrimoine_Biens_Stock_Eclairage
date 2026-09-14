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
  /**
   * Identifiant local utilisé par l'UI.
   */
  id: number;

  /**
   * Identifiant réel de la table document dans le Backend.
   * Présent pour les documents déjà enregistrés.
   */
  backendId?: number;

  name: string;
  category: DocumentCategory;
  type: DocumentType;
  fileName: string;
  uploadDate: string;

  expirationDate?: string;
  reminderDaysBefore?: number;

  /**
   * Chemin renvoyé par l'ancien contrat Backend.
   * On le garde seulement pour compatibilité.
   */
  backendPath?: string;

  /**
   * Nouveau fichier choisi localement avant upload.
   */
  file?: File;
}

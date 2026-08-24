export type NotificationType =
  | "INFO"
  | "WARNING"
  | "SUCCESS"
  | "ERROR";

export type NotificationModule =
  | "USERS"
  | "ASSETS"
  | "STOCK"
  | "LIGHTING"
  | "SYSTEM";

export interface AppNotification {
  id: number;

  title: string;
  titleAr: string;

  message: string;
  messageAr: string;

  type: NotificationType;

  module: NotificationModule;

  createdAt: string;

  read: boolean;

  targetUrl?: string;
}
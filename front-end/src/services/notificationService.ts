import api from "./api";

import type {
  AppNotification,
  NotificationModule,
  NotificationType,
} from "../types/notification";

export const NOTIFICATIONS_CHANGED_EVENT = "sgpbse:notifications-changed";

type BackendNotification = {
  id: number;
  title?: string;
  message?: string;
  createdAt?: string;
  readStatus?: boolean;
  senderId?: number | null;
  senderName?: string | null;
};

const notifyChange = () => {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
};

const classify = (title: string, message: string): {
  module: NotificationModule;
  type: NotificationType;
  targetUrl?: string;
} => {
  const value = `${title} ${message}`.toLowerCase();

  if (/stock|article|réappro|reappro|demande.*fourniture|entrée.*stock|sortie.*stock/.test(value)) {
    return {
      module: "STOCK",
      type: /faible|alerte|rejet|refus|critique/.test(value) ? "WARNING" : "INFO",
      targetUrl: "/stock",
    };
  }

  if (/panne|éclairage|eclairage|point lumineux|intervention/.test(value)) {
    return {
      module: "LIGHTING",
      type: /panne|critique|alerte/.test(value) && !/régl|resolu|résolu|termin/.test(value) ? "ERROR" : "INFO",
      targetUrl: "/eclairage",
    };
  }

  if (/document|échéance|echeance|maintenance|location|accident|carburant|cession|patrimoine|bien/.test(value)) {
    return {
      module: "ASSETS",
      type: /expir|urgent|critique|alerte|échéance|echeance/.test(value) ? "WARNING" : "INFO",
      targetUrl: "/biens",
    };
  }

  return { module: "SYSTEM", type: "INFO" };
};

const arabicTitle = (title: string): string => {
  const value = title.toLowerCase();
  if (value.includes("échéance") || value.includes("echeance")) return "تنبيه استحقاق وثيقة";
  if (value.includes("panne")) return "إشعار عطل";
  if (value.includes("stock")) return "إشعار المخزون";
  if (value.includes("intervention")) return "إشعار تدخل";
  return title;
};

const mapNotification = (item: BackendNotification): AppNotification => {
  const title = item.title?.trim() || "Notification";
  const message = item.message?.trim() || "";
  const classification = classify(title, message);

  return {
    id: Number(item.id),
    title,
    titleAr: arabicTitle(title),
    message,
    messageAr: message,
    type: classification.type,
    module: classification.module,
    createdAt: item.createdAt || new Date().toISOString(),
    read: Boolean(item.readStatus),
    targetUrl: classification.targetUrl,
  };
};

export const notificationService = {
  async getAll(): Promise<AppNotification[]> {
    const response = await api.get<BackendNotification[]>("/sgpbse/notif/me");
    return response.data.map(mapNotification);
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<number>("/sgpbse/notif/me/unread/count");
    return Number(response.data) || 0;
  },

  // Existing Stock/Lighting screens call this after a backend action.
  // The backend already creates the real notification, so we only refresh listeners
  // instead of creating a duplicate client-side notification.
  async createManual(
    data: Omit<AppNotification, "id" | "createdAt" | "read"> & {
      createdAt?: string;
      read?: boolean;
    },
  ): Promise<AppNotification> {
    const notification: AppNotification = {
      ...data,
      id: 0,
      createdAt: data.createdAt ?? new Date().toISOString(),
      read: data.read ?? false,
    };
    notifyChange();
    return notification;
  },

  async markAsRead(id: number): Promise<AppNotification> {
    const response = await api.post<BackendNotification>(`/sgpbse/notif/me/${id}/read`);
    notifyChange();
    return mapNotification(response.data);
  },

  async markAllAsRead(): Promise<void> {
    await api.post("/sgpbse/notif/me/read-all");
    notifyChange();
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/sgpbse/notif/me/${id}`);
    notifyChange();
  },
};

import {
  initialMockNotifications,
} from "../mock/notifications";

import type {
  AppNotification,
} from "../types/notification";

let notifications:
  AppNotification[] = [
    ...initialMockNotifications,
  ];

export const NOTIFICATIONS_CHANGED_EVENT =
  "sgpbse:notifications-changed";

const delay = (
  milliseconds = 150,
) =>
  new Promise<void>(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );

const notifyChange = () => {
  window.dispatchEvent(
    new CustomEvent(
      NOTIFICATIONS_CHANGED_EVENT,
    ),
  );
};

export const notificationService = {
  async getAll(): Promise<
    AppNotification[]
  > {
    await delay();

    return notifications.map(
      (notification) => ({
        ...notification,
      }),
    );
  },

  async getUnreadCount(): Promise<number> {
    await delay(50);

    return notifications.filter(
      (notification) =>
        !notification.read,
    ).length;
  },

  async markAsRead(
    id: number,
  ): Promise<AppNotification> {
    await delay();

    const notification =
      notifications.find(
        (item) =>
          item.id === id,
      );

    if (!notification) {
      throw new Error(
        "NOTIFICATION_NOT_FOUND",
      );
    }

    notification.read =
      true;

    notifyChange();

    return {
      ...notification,
    };
  },

  async markAllAsRead(): Promise<void> {
    await delay();

    notifications =
      notifications.map(
        (notification) => ({
          ...notification,
          read: true,
        }),
      );

    notifyChange();
  },

  async remove(
    id: number,
  ): Promise<void> {
    await delay();

    notifications =
      notifications.filter(
        (notification) =>
          notification.id !== id,
      );

    notifyChange();
  },
};
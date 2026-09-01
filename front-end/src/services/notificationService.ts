import {
  initialMockNotifications,
} from "../mock/notifications";

import {
  bienService,
} from "./bienService";

import {
  stockService,
} from "./stockService";

import {
  lightingService,
} from "./lightingService";

import type {
  AppDocument,
} from "../types/document";

import type {
  AppNotification,
  NotificationModule,
} from "../types/notification";

let notifications:
  AppNotification[] = [
    ...initialMockNotifications,
  ];

const automaticNotificationIds =
  new Set<number>();

const dismissedAutomaticNotificationIds =
  new Set<number>();

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

type DocumentSource = {
  module: NotificationModule;

  resourceId: number;

  labelFr: string;
  labelAr: string;

  targetUrl: string;

  document: AppDocument;
};

const DAY_IN_MILLISECONDS =
  24 * 60 * 60 * 1000;

const toStartOfDay = (
  date: Date,
) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

const parseDate = (
  value: string,
) => {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  const date =
    new Date(
      year,
      month - 1,
      day,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
};

const formatDate = (
  date: Date,
) => {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
};

const createStableId = (
  key: string,
) => {
  let hash = 0;

  for (
    let index = 0;
    index < key.length;
    index += 1
  ) {
    hash =
      (hash * 31 +
        key.charCodeAt(
          index,
        )) |
      0;
  }

  const positive =
    Math.abs(hash) ||
    1;

  return -positive;
};

const getDocumentNotification =
  (
    source: DocumentSource,
    today: Date,
  ):
    | AppNotification
    | null => {
    const {
      document,
    } = source;

    if (
      document.category !==
        "OFFICIAL" ||
      !document.expirationDate
    ) {
      return null;
    }

    const expirationDate =
      parseDate(
        document.expirationDate,
      );

    if (!expirationDate) {
      return null;
    }

    const reminderDaysBefore =
      Math.max(
        0,
        document.reminderDaysBefore ??
          0,
      );

    const notificationStartDate =
      new Date(
        expirationDate.getTime() -
          reminderDaysBefore *
            DAY_IN_MILLISECONDS,
      );

    if (
      today.getTime() <
      notificationStartDate.getTime()
    ) {
      return null;
    }

    const daysUntilExpiration =
      Math.round(
        (expirationDate.getTime() -
          today.getTime()) /
          DAY_IN_MILLISECONDS,
      );

    const id =
      createStableId(
        [
          "DOCUMENT_EXPIRATION",
          source.module,
          source.resourceId,
          document.id,
        ].join(":"),
      );

    if (
      dismissedAutomaticNotificationIds.has(
        id,
      )
    ) {
      return null;
    }

    const existing =
      notifications.find(
        (notification) =>
          notification.id ===
          id,
      );

    let title =
      "Document proche de l’expiration";

    let titleAr =
      "وثيقة تقترب من انتهاء الصلاحية";

    let message = "";
    let messageAr = "";

    let type:
      AppNotification["type"] =
      "WARNING";

    if (
      daysUntilExpiration <
      0
    ) {
      title =
        "Document expiré";

      titleAr =
        "وثيقة منتهية الصلاحية";

      type =
        "ERROR";

      message =
        `Le document « ${document.name} » associé à ${source.labelFr} a expiré le ${document.expirationDate}.`;

      messageAr =
        `انتهت صلاحية الوثيقة « ${document.name} » المرتبطة بـ ${source.labelAr} بتاريخ ${document.expirationDate}.`;
    } else if (
      daysUntilExpiration ===
      0
    ) {
      title =
        "Document expirant aujourd’hui";

      titleAr =
        "وثيقة تنتهي صلاحيتها اليوم";

      type =
        "ERROR";

      message =
        `Le document « ${document.name} » associé à ${source.labelFr} expire aujourd’hui.`;

      messageAr =
        `تنتهي صلاحية الوثيقة « ${document.name} » المرتبطة بـ ${source.labelAr} اليوم.`;
    } else if (
      daysUntilExpiration ===
      1
    ) {
      message =
        `Le document « ${document.name} » associé à ${source.labelFr} expire demain.`;

      messageAr =
        `تنتهي صلاحية الوثيقة « ${document.name} » المرتبطة بـ ${source.labelAr} غداً.`;
    } else {
      message =
        `Le document « ${document.name} » associé à ${source.labelFr} expire dans ${daysUntilExpiration} jours.`;

      messageAr =
        `ستنتهي صلاحية الوثيقة « ${document.name} » المرتبطة بـ ${source.labelAr} بعد ${daysUntilExpiration} يوم.`;
    }

    return {
      id,

      title,
      titleAr,

      message,
      messageAr,

      type,

      module:
        source.module,

      createdAt:
        `${formatDate(
          notificationStartDate,
        )}T00:00:00`,

      read:
        existing?.read ??
        false,

      targetUrl:
        source.targetUrl,
    };
  };

const collectDocumentSources =
  async (): Promise<
    DocumentSource[]
  > => {
    const [
      biens,
      articles,
      movements,
      requests,
      lights,
      failures,
      interventions,
    ] = await Promise.all([
      bienService.getAll(),

      stockService.getArticles(),

      stockService.getMovements(),

      stockService.getRequests(),

      lightingService.getLights(),

      lightingService.getFailures(),

      lightingService.getInterventions(),
    ]);

    const sources:
      DocumentSource[] = [];

    biens.forEach(
      (bien) => {
        bien.documents.forEach(
          (document) => {
            sources.push({
              module:
                "ASSETS",

              resourceId:
                bien.id,

              labelFr:
                bien.designation,

              labelAr:
                bien.designationAr ||
                bien.designation,

              targetUrl:
                `/biens/${bien.id}`,

              document,
            });
          },
        );
      },
    );

    articles.forEach(
      (article) => {
        article.documents.forEach(
          (document) => {
            sources.push({
              module:
                "STOCK",

              resourceId:
                article.id,

              labelFr:
                article.designation,

              labelAr:
                article.designationAr ||
                article.designation,

              targetUrl:
                `/stock/articles/${article.id}`,

              document,
            });
          },
        );
      },
    );

    movements.forEach(
      (movement) => {
        movement.documents.forEach(
          (document) => {
            sources.push({
              module:
                "STOCK",

              resourceId:
                100000 +
                movement.id,

              labelFr:
                `le mouvement de stock de ${movement.articleDesignation}`,

              labelAr:
                `حركة المخزون الخاصة بـ ${
                  movement.articleDesignationAr ||
                  movement.articleDesignation
                }`,

              targetUrl:
                "/stock/historique",

              document,
            });
          },
        );
      },
    );

    requests.forEach(
      (request) => {
        request.documents.forEach(
          (document) => {
            sources.push({
              module:
                "STOCK",

              resourceId:
                200000 +
                request.id,

              labelFr:
                `la demande de fourniture ${request.articleDesignation}`,

              labelAr:
                `طلب التموين الخاص بـ ${
                  request.articleDesignationAr ||
                  request.articleDesignation
                }`,

              targetUrl:
                "/stock",

              document,
            });
          },
        );
      },
    );

    lights.forEach(
      (light) => {
        light.documents.forEach(
          (document) => {
            sources.push({
              module:
                "LIGHTING",

              resourceId:
                light.id,

              labelFr:
                light.designation,

              labelAr:
                light.designationAr ||
                light.designation,

              targetUrl:
                `/eclairage/${light.id}`,

              document,
            });
          },
        );
      },
    );

    failures.forEach(
      (failure) => {
        failure.documents.forEach(
          (document) => {
            sources.push({
              module:
                "LIGHTING",

              resourceId:
                100000 +
                failure.id,

              labelFr:
                `la panne de ${failure.lightDesignation}`,

              labelAr:
                `عطل ${
                  failure.lightDesignationAr ||
                  failure.lightDesignation
                }`,

              targetUrl:
                "/eclairage/historique",

              document,
            });
          },
        );
      },
    );

    const failuresById =
      new Map(
        failures.map(
          (failure) => [
            failure.id,
            failure,
          ],
        ),
      );

    interventions.forEach(
      (intervention) => {
        const failure =
          failuresById.get(
            intervention.failureId,
          );

        intervention.documents.forEach(
          (document) => {
            sources.push({
              module:
                "LIGHTING",

              resourceId:
                200000 +
                intervention.id,

              labelFr:
                failure
                  ? `l’intervention sur ${failure.lightDesignation}`
                  : `l’intervention #${intervention.id}`,

              labelAr:
                failure
                  ? `التدخل على ${
                      failure.lightDesignationAr ||
                      failure.lightDesignation
                    }`
                  : `التدخل رقم ${intervention.id}`,

              targetUrl:
                "/eclairage/historique",

              document,
            });
          },
        );
      },
    );

    return sources;
  };

const refreshAutomaticNotifications =
  async () => {
    const sources =
      await collectDocumentSources();

    const today =
      toStartOfDay(
        new Date(),
      );

    const previousAutomaticNotifications =
      new Map(
        notifications
          .filter(
            (notification) =>
              automaticNotificationIds.has(
                notification.id,
              ),
          )
          .map(
            (notification) => [
              notification.id,
              notification,
            ],
          ),
      );

    const manualNotifications =
      notifications.filter(
        (notification) =>
          !automaticNotificationIds.has(
            notification.id,
          ),
      );

    const automaticNotifications =
      sources
        .map(
          (source) =>
            getDocumentNotification(
              source,
              today,
            ),
        )
        .filter(
          (
            notification,
          ): notification is AppNotification =>
            notification !==
            null,
        )
        .map(
          (notification) => {
            const previous =
              previousAutomaticNotifications.get(
                notification.id,
              );

            return {
              ...notification,

              read:
                previous?.read ??
                notification.read,
            };
          },
        );

    automaticNotificationIds.clear();

    automaticNotifications.forEach(
      (notification) => {
        automaticNotificationIds.add(
          notification.id,
        );
      },
    );

    notifications = [
      ...manualNotifications,
      ...automaticNotifications,
    ].sort(
      (
        first,
        second,
      ) =>
        new Date(
          second.createdAt,
        ).getTime() -
        new Date(
          first.createdAt,
        ).getTime(),
    );
  };

type StoredAuthUser = {
  id: number;
  role?: {
    permissions?: string[];
  };
};

const getStoredViewer = (): StoredAuthUser | null => {
  try {
    const raw = window.localStorage.getItem("user");

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
};

const isVisibleToCurrentViewer = (
  notification: AppNotification,
) => {
  const viewer = getStoredViewer();

  if (
    notification.recipientUserId === undefined &&
    notification.recipientPermission === undefined
  ) {
    return true;
  }

  if (!viewer) {
    return false;
  }

  if (
    notification.recipientUserId !== undefined &&
    notification.recipientUserId !== viewer.id
  ) {
    return false;
  }

  if (
    notification.recipientPermission &&
    !viewer.role?.permissions?.includes(
      notification.recipientPermission,
    )
  ) {
    return false;
  }

  return true;
};

const visibleNotifications = () =>
  notifications.filter(isVisibleToCurrentViewer);


export const notificationService = {
  async getAll(): Promise<AppNotification[]> {
    await refreshAutomaticNotifications();
    await delay();

    return visibleNotifications().map(
      (notification) => ({
        ...notification,
      }),
    );
  },

  async getUnreadCount(): Promise<number> {
    await refreshAutomaticNotifications();
    await delay(50);

    return visibleNotifications().filter(
      (notification) => !notification.read,
    ).length;
  },

  async createManual(
    data: Omit<AppNotification, "id" | "createdAt" | "read"> & {
      createdAt?: string;
      read?: boolean;
    },
  ): Promise<AppNotification> {
    await delay(50);

    const nextId =
      Math.max(
        0,
        ...notifications
          .filter((item) => item.id > 0)
          .map((item) => item.id),
      ) + 1;

    const notification: AppNotification = {
      ...data,
      id: nextId,
      createdAt:
        data.createdAt ?? new Date().toISOString(),
      read: data.read ?? false,
    };

    notifications = [
      notification,
      ...notifications,
    ];

    notifyChange();

    return {
      ...notification,
    };
  },

  async markAsRead(
    id: number,
  ): Promise<AppNotification> {
    await refreshAutomaticNotifications();
    await delay();

    const notification =
      notifications.find(
        (item) => item.id === id,
      );

    if (!notification) {
      throw new Error(
        "NOTIFICATION_NOT_FOUND",
      );
    }

    notification.read = true;

    notifyChange();

    return {
      ...notification,
    };
  },

  async markAllAsRead(): Promise<void> {
    await refreshAutomaticNotifications();
    await delay();

    const visibleIds = new Set(
      visibleNotifications().map(
        (notification) => notification.id,
      ),
    );

    notifications = notifications.map(
      (notification) =>
        visibleIds.has(notification.id)
          ? {
              ...notification,
              read: true,
            }
          : notification,
    );

    notifyChange();
  },

  async remove(
    id: number,
  ): Promise<void> {
    await refreshAutomaticNotifications();
    await delay();

    if (
      automaticNotificationIds.has(id)
    ) {
      dismissedAutomaticNotificationIds.add(id);
      automaticNotificationIds.delete(id);
    }

    notifications = notifications.filter(
      (notification) =>
        notification.id !== id,
    );

    notifyChange();
  },
};

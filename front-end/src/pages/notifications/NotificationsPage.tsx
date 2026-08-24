import {
  Bell,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  CircleX,
  Info,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import {
  notificationService,
} from "../../services/notificationService";

import type {
  AppNotification,
  NotificationType,
} from "../../types/notification";

type NotificationFilter =
  | "ALL"
  | "UNREAD"
  | "READ";

const typeIcons = {
  INFO: Info,
  WARNING: CircleAlert,
  SUCCESS: CircleCheck,
  ERROR: CircleX,
} satisfies Record<
  NotificationType,
  typeof Info
>;

const typeClassNames: Record<
  NotificationType,
  string
> = {
  INFO:
    "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",

  WARNING:
    "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",

  SUCCESS:
    "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-300",

  ERROR:
    "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300",
};

function NotificationsPage() {
  const navigate =
    useNavigate();

  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const [
    notifications,
    setNotifications,
  ] = useState<
    AppNotification[]
  >([]);

  const [
    filter,
    setFilter,
  ] =
    useState<NotificationFilter>(
      "ALL",
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    notificationToDelete,
    setNotificationToDelete,
  ] =
    useState<AppNotification | null>(
      null,
    );

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const loadNotifications =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await notificationService.getAll();

        setNotifications(
          data,
        );
      } catch {
        setError(
          t(
            "notifications.errors.load",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const visibleNotifications =
    useMemo(() => {
      if (
        filter ===
        "UNREAD"
      ) {
        return notifications.filter(
          (notification) =>
            !notification.read,
        );
      }

      if (
        filter ===
        "READ"
      ) {
        return notifications.filter(
          (notification) =>
            notification.read,
        );
      }

      return notifications;
    }, [
      notifications,
      filter,
    ]);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read,
    ).length;

  const handleNotificationClick =
    async (
      notification:
        AppNotification,
    ) => {
      try {
        setError("");

        if (
          !notification.read
        ) {
          await notificationService.markAsRead(
            notification.id,
          );

          await loadNotifications();
        }

        if (
          notification.targetUrl
        ) {
          navigate(
            notification.targetUrl,
          );
        }
      } catch (
        caughtError
      ) {
        setError(
          caughtError instanceof
            Error &&
            caughtError.message ===
              "NOTIFICATION_NOT_FOUND"
            ? t(
                "notifications.errors.notFound",
              )
            : t(
                "notifications.errors.update",
              ),
        );
      }
    };

  const handleMarkAllAsRead =
    async () => {
      try {
        setError("");

        await notificationService.markAllAsRead();

        await loadNotifications();

        setSuccessMessage(
          t(
            "notifications.success.allRead",
          ),
        );

        window.setTimeout(
          () => {
            setSuccessMessage(
              "",
            );
          },
          3000,
        );
      } catch {
        setError(
          t(
            "notifications.errors.markAll",
          ),
        );
      }
    };

  const handleDelete =
    async () => {
      if (
        !notificationToDelete
      ) {
        return;
      }

      try {
        setError("");

        await notificationService.remove(
          notificationToDelete.id,
        );

        setNotificationToDelete(
          null,
        );

        await loadNotifications();

        setSuccessMessage(
          t(
            "notifications.success.deleted",
          ),
        );

        window.setTimeout(
          () => {
            setSuccessMessage(
              "",
            );
          },
          3000,
        );
      } catch {
        setError(
          t(
            "notifications.errors.delete",
          ),
        );
      }
    };

  const filterOptions: Array<{
    value: NotificationFilter;
    label: string;
  }> = [
    {
      value: "ALL",
      label: t(
        "notifications.filters.all",
      ),
    },

    {
      value: "UNREAD",
      label: t(
        "notifications.filters.unread",
      ),
    },

    {
      value: "READ",
      label: t(
        "notifications.filters.read",
      ),
    },
  ];

  return (
    <section className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            <Bell className="text-orange-600 dark:text-orange-400" />

            {t(
              "notifications.page.title",
            )}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t(
              "notifications.page.description",
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void handleMarkAllAsRead();
          }}
          disabled={
            unreadCount === 0 ||
            loading
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20"
        >
          <CheckCheck
            size={19}
          />

          {t(
            "notifications.actions.markAllRead",
          )}
        </button>
      </div>

      {/* MESSAGES */}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-400">
          {successMessage}
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t(
              "notifications.stats.total",
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {
              notifications.length
            }
          </p>
        </article>

        <article className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm dark:border-orange-900/40 dark:bg-orange-950/20">
          <p className="text-sm text-orange-600 dark:text-orange-400">
            {t(
              "notifications.stats.unread",
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-700 dark:text-orange-300">
            {
              unreadCount
            }
          </p>
        </article>

        <article className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm dark:border-green-900/40 dark:bg-green-950/20">
          <p className="text-sm text-green-600 dark:text-green-400">
            {t(
              "notifications.stats.read",
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-green-700 dark:text-green-300">
            {notifications.length -
              unreadCount}
          </p>
        </article>
      </div>

      {/* FILTERS */}

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {filterOptions.map(
          (option) => (
            <button
              key={
                option.value
              }
              type="button"
              onClick={() =>
                setFilter(
                  option.value,
                )
              }
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                filter ===
                option.value
                  ? "bg-orange-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-300",
              ].join(
                " ",
              )}
            >
              {
                option.label
              }
            </button>
          ),
        )}
      </div>

      {/* LIST */}

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            {t(
              "notifications.page.loading",
            )}
          </div>
        ) : visibleNotifications.length ===
          0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <Bell
              size={40}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <p className="mt-4 font-semibold text-slate-700 dark:text-slate-200">
              {t(
                "notifications.empty.title",
              )}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(
                "notifications.empty.description",
              )}
            </p>
          </div>
        ) : (
          visibleNotifications.map(
            (
              notification,
            ) => {
              const Icon =
                typeIcons[
                  notification.type
                ];

              const title =
                isArabic
                  ? notification.titleAr
                  : notification.title;

              const message =
                isArabic
                  ? notification.messageAr
                  : notification.message;

              return (
                <article
                  key={
                    notification.id
                  }
                  className={[
                    "rounded-2xl border p-5 shadow-sm transition",
                    notification.read
                      ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                      : "border-orange-200 bg-orange-50/50 dark:border-orange-500/30 dark:bg-orange-500/5",
                  ].join(
                    " ",
                  )}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        void handleNotificationClick(
                          notification,
                        );
                      }}
                      className="flex flex-1 items-start gap-4 text-start"
                    >
                      <div
                        className={[
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                          typeClassNames[
                            notification.type
                          ],
                        ].join(
                          " ",
                        )}
                      >
                        <Icon
                          size={21}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-slate-900 dark:text-white">
                            {
                              title
                            }
                          </h2>

                          {!notification.read && (
                            <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                              {t(
                                "notifications.badges.new",
                              )}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {
                            message
                          }
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                          <span>
                            {t(
                              `notifications.modules.${notification.module}`,
                            )}
                          </span>

                          <span
                            dir="ltr"
                          >
                            {
                              notification.createdAt
                            }
                          </span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      title={t(
                        "notifications.actions.delete",
                      )}
                      onClick={() =>
                        setNotificationToDelete(
                          notification,
                        )
                      }
                      className="self-start rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <Trash2
                        size={18}
                      />
                    </button>
                  </div>
                </article>
              );
            },
          )
        )}
      </div>

      {/* DELETE MODAL */}

      {notificationToDelete && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300">
              <Trash2
                size={22}
              />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              {t(
                "notifications.delete.title",
              )}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {t(
                "notifications.delete.message",
                {
                  name:
                    isArabic
                      ? notificationToDelete.titleAr
                      : notificationToDelete.title,
                },
              )}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setNotificationToDelete(
                    null,
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {t(
                  "notifications.actions.cancel",
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleDelete();
                }}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                {t(
                  "notifications.actions.delete",
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default NotificationsPage;
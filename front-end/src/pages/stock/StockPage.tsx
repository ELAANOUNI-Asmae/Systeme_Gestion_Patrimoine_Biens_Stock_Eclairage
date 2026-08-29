import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Check,
  ClipboardPlus,
  Plus,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import ArticleFilters from "../../components/stock/ArticleFilters";
import ArticleTable from "../../components/stock/ArticleTable";
import StockMovementModal from "../../components/stock/StockMovementModal";
import SupplyRequestModal from "../../components/stock/SupplyRequestModal";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PermissionGuard from "../../components/common/PermissionGuard";
import Toast from "../../components/common/Toast";

import {
  PERMISSIONS,
} from "../../constants/permissions";

import {
  ROUTES,
} from "../../constants/routes";

import {
  stockService,
} from "../../services/stockService";

import {
  useAuth,
} from "../../hooks/useAuth";

import type {
  StockArticle,
  StockMovement,
  StockMovementType,
  SupplyRequest,
} from "../../types/stock";

import type {
  AppDocument,
} from "../../types/document";

function StockPage() {
  const {
    user,
  } = useAuth();

  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith("ar");

  const [
    articles,
    setArticles,
  ] = useState<StockArticle[]>([]);

  const [
    movements,
    setMovements,
  ] = useState<StockMovement[]>([]);

  const [
    requests,
    setRequests,
  ] = useState<SupplyRequest[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    alertOnly,
    setAlertOnly,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    articleToDelete,
    setArticleToDelete,
  ] = useState<StockArticle | null>(
    null,
  );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    toast,
    setToast,
  ] = useState<{
    open: boolean;
    message: string;
    type:
      | "success"
      | "error"
      | "info";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  const [
    selectedMovementArticle,
    setSelectedMovementArticle,
  ] = useState<StockArticle | null>(
    null,
  );

  const [
    selectedMovementType,
    setSelectedMovementType,
  ] = useState<StockMovementType>(
    "ENTRY",
  );

  const [
    movementModalOpen,
    setMovementModalOpen,
  ] = useState(false);

  const [
    movementLoading,
    setMovementLoading,
  ] = useState(false);

  const [
    requestModalOpen,
    setRequestModalOpen,
  ] = useState(false);

  const [
    requestLoading,
    setRequestLoading,
  ] = useState(false);

  const showToast = (
    message: string,
    type:
      | "success"
      | "error"
      | "info" = "success",
  ) => {
    setToast({
      open: true,
      message,
      type,
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        articleData,
        movementData,
        requestData,
      ] = await Promise.all([
        stockService.getArticles(),
        stockService.getMovements(),
        stockService.getRequests(),
      ]);

      setArticles(
        articleData,
      );

      setMovements(
        movementData,
      );

      setRequests(
        requestData,
      );
    } catch {
      setError(
        t(
          "stock.page.loadError",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredArticles =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return articles.filter(
        (article) => {
          const matchesSearch =
            !normalizedSearch ||
            article.reference
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            article.designation
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            article.designationAr
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            article.category
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            article.categoryAr
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            article.serialNumber
              ?.toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            article.barcode
              ?.toLowerCase()
              .includes(
                normalizedSearch,
              );

          const isLowStock =
            article.quantity <=
            article.minimumQuantity;

          return (
            matchesSearch &&
            (!alertOnly ||
              isLowStock)
          );
        },
      );
    }, [
      articles,
      search,
      alertOnly,
    ]);

  const totalQuantity =
    articles.reduce(
      (
        total,
        article,
      ) =>
        total +
        article.quantity,
      0,
    );

  const lowStockCount =
    articles.filter(
      (article) =>
        article.quantity <=
        article.minimumQuantity,
    ).length;

  const pendingRequestsCount =
    requests.filter(
      (request) =>
        request.status ===
        "PENDING",
    ).length;

  const recentMovements =
    movements.slice(0, 5);

  const requestDelete = (
    article: StockArticle,
  ) => {
    setArticleToDelete(
      article,
    );
  };

  const handleDelete =
    async () => {
      if (!articleToDelete) {
        return;
      }

      try {
        setDeleting(true);

        await stockService.removeArticle(
          articleToDelete.id,
        );

        setArticleToDelete(
          null,
        );

        showToast(
          t(
            "stock.delete.success",
          ),
        );

        await loadData();
      } catch (caughtError) {
        showToast(
          caughtError instanceof Error
            ? caughtError.message
            : t(
                "stock.delete.error",
              ),
          "error",
        );
      } finally {
        setDeleting(false);
      }
    };

  const openMovementModal = (
    article: StockArticle,
    type: StockMovementType,
  ) => {
    setSelectedMovementArticle(
      article,
    );

    setSelectedMovementType(
      type,
    );

    setMovementModalOpen(
      true,
    );
  };

  const handleMovementSubmit =
    async (
      data: {
        articleId: number;

        type:
          StockMovementType;

        quantity: number;

        reason: string;

        supplierOrBeneficiary?: string;

        reference?: string;

        date?: string;

        documents?: AppDocument[];
      },
    ) => {
      try {
        setMovementLoading(
          true,
        );

        await stockService.createMovement(
          {
            ...data,

            performedBy:
              user
                ? `${user.firstName} ${user.lastName}`
                : t(
                    "stock.page.defaultUser",
                  ),
          },
        );

        setMovementModalOpen(
          false,
        );

        setSelectedMovementArticle(
          null,
        );

        showToast(
          data.type === "ENTRY"
            ? t(
                "stock.movement.entrySuccess",
              )
            : t(
                "stock.movement.exitSuccess",
              ),
        );

        await loadData();
      } catch (caughtError) {
        showToast(
          caughtError instanceof Error
            ? caughtError.message
            : t(
                "stock.movement.error",
              ),
          "error",
        );
      } finally {
        setMovementLoading(
          false,
        );
      }
    };

  const handleCreateRequestSubmit =
    async (
      data: {
        articleDesignation: string;
        articleDesignationAr?: string;
        requestedQuantity: number;
        requester: string;
        reason: string;
        documents?: AppDocument[];
      },
    ) => {
      try {
        setRequestLoading(
          true,
        );

        await stockService.createRequest(
          data,
        );

        setRequestModalOpen(
          false,
        );

        showToast(
          t(
            "stock.request.createSuccess",
          ),
        );

        await loadData();
      } catch (caughtError) {
        showToast(
          caughtError instanceof Error
            ? caughtError.message
            : t(
                "stock.request.createError",
              ),
          "error",
        );
      } finally {
        setRequestLoading(
          false,
        );
      }
    };

  const handleRequestStatus =
    async (
      requestId: number,
      status:
        | "APPROVED"
        | "REJECTED",
    ) => {
      try {
        await stockService.updateRequestStatus(
          requestId,
          status,
        );

        showToast(
          status === "APPROVED"
            ? t(
                "stock.request.approvedSuccess",
              )
            : t(
                "stock.request.rejectedSuccess",
              ),
        );

        await loadData();
      } catch {
        showToast(
          t(
            "stock.request.statusError",
          ),
          "error",
        );
      }
    };

  return (
    <section className="space-y-6">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast(
            (previous) => ({
              ...previous,
              open: false,
            }),
          )
        }
      />

      <StockMovementModal
        open={
          movementModalOpen
        }
        type={
          selectedMovementType
        }
        article={
          selectedMovementArticle
        }
        loading={
          movementLoading
        }
        onClose={() => {
          if (
            !movementLoading
          ) {
            setMovementModalOpen(
              false,
            );

            setSelectedMovementArticle(
              null,
            );
          }
        }}
        onSubmit={
          handleMovementSubmit
        }
      />

      <SupplyRequestModal
        open={
          requestModalOpen
        }
        articles={
          articles
        }
        requester={
          user
            ? `${user.firstName} ${user.lastName}`
            : t(
                "stock.page.defaultUser",
              )
        }
        loading={
          requestLoading
        }
        onClose={() => {
          if (
            !requestLoading
          ) {
            setRequestModalOpen(
              false,
            );
          }
        }}
        onSubmit={
          handleCreateRequestSubmit
        }
      />

      <ConfirmDialog
        open={
          articleToDelete !==
          null
        }
        title={t(
          "stock.delete.title",
        )}
        message={
          articleToDelete
            ? t(
                "stock.delete.message",
                {
                  name:
                    isArabic
                      ? articleToDelete.designationAr
                      : articleToDelete.designation,
                },
              )
            : ""
        }
        confirmLabel={t(
          "stock.actions.delete",
        )}
        cancelLabel={t(
          "stock.common.cancel",
        )}
        loading={
          deleting
        }
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() =>
          setArticleToDelete(
            null,
          )
        }
      />

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            <Boxes className="text-orange-600 dark:text-orange-400" />

            {t(
              "stock.page.title",
            )}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t(
              "stock.page.description",
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <PermissionGuard
            permission={
              PERMISSIONS.CREATE_SUPPLY_REQUEST
            }
          >
            <button
              type="button"
              onClick={() =>
                setRequestModalOpen(
                  true,
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20"
            >
              <ClipboardPlus
                size={19}
              />

              {t(
                "stock.request.create",
              )}
            </button>
          </PermissionGuard>

          <PermissionGuard
            permission={
              PERMISSIONS.CREATE_ARTICLE
            }
          >
            <Link
              to={
                ROUTES.ADD_ARTICLE
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              <Plus
                size={19}
              />

              {t(
                "stock.page.addArticle",
              )}
            </Link>
          </PermissionGuard>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t(
              "stock.stats.articles",
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {
              articles.length
            }
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t(
              "stock.stats.totalQuantity",
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {totalQuantity}
          </p>
        </article>

        <article className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {t(
              "stock.stats.alerts",
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-red-700 dark:text-red-300">
            {
              lowStockCount
            }
          </p>
        </article>

        <article className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm dark:border-orange-900/40 dark:bg-orange-950/20">
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
            {t(
              "stock.stats.pendingRequests",
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-700 dark:text-orange-300">
            {
              pendingRequestsCount
            }
          </p>
        </article>
      </div>

      <ArticleFilters
        search={search}
        alertOnly={
          alertOnly
        }
        onSearchChange={
          setSearch
        }
        onAlertOnlyChange={
          setAlertOnly
        }
      />

      <ArticleTable
        articles={
          filteredArticles
        }
        loading={
          loading
        }
        onDelete={
          requestDelete
        }
        onEntry={(
          article,
        ) =>
          openMovementModal(
            article,
            "ENTRY",
          )
        }
        onExit={(
          article,
        ) =>
          openMovementModal(
            article,
            "EXIT",
          )
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <PermissionGuard
          permission={
            PERMISSIONS.GET_STOCK_HISTORY
          }
        >
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t(
                  "stock.history.title",
                )}
              </h2>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t(
                    "stock.history.count",
                    {
                      count:
                        movements.length,
                    },
                  )}
                </span>

                <Link
                  to={
                    ROUTES.STOCK_HISTORY
                  }
                  className="text-sm font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400"
                >
                  {t(
                    "stock.history.viewAll",
                  )}
                </Link>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {recentMovements.length ===
              0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  {t(
                    "stock.history.empty",
                  )}
                </p>
              ) : (
                recentMovements.map(
                  (
                    movement,
                  ) => {
                    const designation =
                      isArabic
                        ? movement.articleDesignationAr
                        : movement.articleDesignation;

                    return (
                      <div
                        key={
                          movement.id
                        }
                        className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
                      >
                        {movement.type ===
                        "ENTRY" ? (
                          <ArrowDownToLine className="shrink-0 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowUpFromLine className="shrink-0 text-orange-600 dark:text-orange-400" />
                        )}

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {
                              designation
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {movement.type ===
                            "ENTRY"
                              ? t(
                                  "stock.history.entry",
                                )
                              : t(
                                  "stock.history.exit",
                                )}{" "}
                            {
                              movement.quantity
                            }
                          </p>

                          {movement.supplierOrBeneficiary && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {
                                movement.supplierOrBeneficiary
                              }
                            </p>
                          )}

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {
                              movement.reason
                            }
                          </p>

                          {movement.reference && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {t(
                                "stock.history.reference",
                              )}
                              {" : "}
                              {
                                movement.reference
                              }
                            </p>
                          )}

                          {movement.documents.length >
                            0 && (
                            <div className="mt-2 space-y-1">
                              {movement.documents.map(
                                (
                                  document,
                                ) => (
                                  <p
                                    key={
                                      document.id
                                    }
                                    className="text-xs font-medium text-orange-600 dark:text-orange-400"
                                  >
                                    📄{" "}
                                    {
                                      document.fileName
                                    }
                                  </p>
                                ),
                              )}
                            </div>
                          )}

                          <p className="mt-2 text-xs text-slate-400">
                            {
                              movement.date
                            }{" "}
                            —{" "}
                            {
                              movement.performedBy
                            }
                          </p>
                        </div>
                      </div>
                    );
                  },
                )
              )}
            </div>
          </article>
        </PermissionGuard>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t(
                "stock.request.title",
              )}
            </h2>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                "stock.request.count",
                {
                  count:
                    requests.length,
                },
              )}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {requests.length ===
            0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                {t(
                  "stock.request.empty",
                )}
              </p>
            ) : (
              requests.map(
                (
                  request,
                ) => {
                  const designation =
                    isArabic &&
                    request.articleDesignationAr
                      ? request.articleDesignationAr
                      : request.articleDesignation;

                  return (
                    <div
                      key={
                        request.id
                      }
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {
                              designation
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {t(
                              "stock.request.quantity",
                            )}
                            {" : "}
                            {
                              request.requestedQuantity
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {
                              request.reason
                            }
                          </p>

                          {request.documents.length >
                            0 && (
                            <div className="mt-2 space-y-1">
                              {request.documents.map(
                                (
                                  document,
                                ) => (
                                  <p
                                    key={
                                      document.id
                                    }
                                    className="text-xs font-medium text-orange-600 dark:text-orange-400"
                                  >
                                    📄{" "}
                                    {
                                      document.fileName
                                    }
                                  </p>
                                ),
                              )}
                            </div>
                          )}

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              request.requester
                            }{" "}
                            —{" "}
                            {
                              request.requestDate
                            }
                          </p>
                        </div>

                        {request.status ===
                        "PENDING" ? (
                          <div className="flex items-start gap-2">
                            <PermissionGuard
                              permission={
                                PERMISSIONS.VALIDATE_SUPPLY_REQUEST
                              }
                            >
                              <button
                                type="button"
                                title={t(
                                  "stock.request.approve",
                                )}
                                onClick={() =>
                                  handleRequestStatus(
                                    request.id,
                                    "APPROVED",
                                  )
                                }
                                className="rounded-lg bg-green-50 p-2 text-green-600 transition hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                              >
                                <Check
                                  size={
                                    18
                                  }
                                />
                              </button>
                            </PermissionGuard>

                            <PermissionGuard
                              permission={
                                PERMISSIONS.REJECT_SUPPLY_REQUEST
                              }
                            >
                              <button
                                type="button"
                                title={t(
                                  "stock.request.reject",
                                )}
                                onClick={() =>
                                  handleRequestStatus(
                                    request.id,
                                    "REJECTED",
                                  )
                                }
                                className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                              >
                                <X
                                  size={
                                    18
                                  }
                                />
                              </button>
                            </PermissionGuard>
                          </div>
                        ) : (
                          <span
                            className={
                              request.status ===
                              "APPROVED"
                                ? "h-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300"
                                : "h-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300"
                            }
                          >
                            {request.status ===
                            "APPROVED"
                              ? t(
                                  "stock.request.approved",
                                )
                              : t(
                                  "stock.request.rejected",
                                )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                },
              )
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

export default StockPage;
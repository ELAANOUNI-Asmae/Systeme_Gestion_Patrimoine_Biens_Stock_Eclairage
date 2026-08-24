import {
  Archive,
  ArrowLeft,
  Building2,
  Calendar,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Hash,
  KeyRound,
  MapPin,
  Pencil,
  ShoppingCart,
  Tag,
  Car,
  Cog,
  Home,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import AssetOperationModal from "../../components/biens/AssetOperationModal";
import PermissionGuard from "../../components/common/PermissionGuard";
import Toast from "../../components/common/Toast";

import {
  PERMISSIONS,
} from "../../constants/permissions";

import {
  ROUTES,
} from "../../constants/routes";

import {
  bienService,
} from "../../services/bienService";

import type {
  Bien,
  RentalOperation,
  SaleOperation,
} from "../../types/bien";

import AssetExitModal from "../../components/biens/AssetExitModal";

type OperationMode =
  | "RENT"
  | "SELL";

function BienDetailsPage() {
  const { id } =
    useParams();

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

  const [bien, setBien] =
    useState<Bien | null>(
      null,
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
    operationMode,
    setOperationMode,
  ] =
    useState<OperationMode | null>(
      null,
    );

  const [
    operationLoading,
    setOperationLoading,
  ] = useState(false);

  const [
    exitModalOpen,
    setExitModalOpen,
  ] = useState(false);

  const [
    exitLoading,
    setExitLoading,
  ] = useState(false);

  const [
    operationsOpen,
    setOperationsOpen,
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

  const operationsRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const loadBien = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await bienService.getById(
          Number(id),
        );

      setBien(data);
    } catch {
      setError(
        t(
          "biens.pages.notFound",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBien();
  }, [id]);

  /*
   * Fermer le menu opérations
   * si on clique ailleurs.
   */
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        operationsRef.current &&
        !operationsRef.current.contains(
          event.target as Node,
        )
      ) {
        setOperationsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const handleRent = async (
    data: Omit<
      RentalOperation,
      | "id"
      | "bienId"
      | "createdAt"
    >,
  ) => {
    if (!bien) {
      return;
    }

    try {
      setOperationLoading(true);

      await bienService.rent(
        bien.id,
        data,
      );

      setOperationMode(null);

      setToast({
        open: true,
        message: t(
          "biens.operations.rentSuccess",
        ),
        type: "success",
      });

      await loadBien();
    } catch {
      setToast({
        open: true,
        message: t(
          "biens.operations.error",
        ),
        type: "error",
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSell = async (
    data: Omit<
      SaleOperation,
      | "id"
      | "bienId"
      | "createdAt"
    >,
  ) => {
    if (!bien) {
      return;
    }

    try {
      setOperationLoading(true);

      await bienService.sell(
        bien.id,
        data,
      );

      setOperationMode(null);

      /*
       * Le bien vendu est maintenant
       * archivé dans bienService,
       * donc il ne doit plus apparaître
       * dans la liste active.
       */
      navigate(
        ROUTES.BIENS,
        {
          replace: true,
        },
      );
    } catch {
      setToast({
        open: true,
        message: t(
          "biens.operations.error",
        ),
        type: "error",
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleArchive = async (
    data: {
      reason:
        | "DISPOSED"
        | "DESTROYED"
        | "TRANSFERRED"
        | "REFORMED"
        | "OTHER";

      archivedAt: string;

      reference?: string;

      documentFileName?: string;

      notes?: string;
    },
  ) => {
    if (!bien) {
      return;
    }

    try {
      setExitLoading(true);

      await bienService.archive(
        bien.id,
        data,
      );

      setExitModalOpen(false);

      navigate(
        ROUTES.BIENS_ARCHIVE,
        {
          replace: true,
        },
      );
    } catch {
      setToast({
        open: true,

        message: t(
          "biens.operations.error",
        ),

        type: "error",
      });
    } finally {
      setExitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {t(
          "biens.pages.detailsLoading",
        )}
      </div>
    );
  }

  if (!bien) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  const designation =
    isArabic
      ? bien.designationAr
      : bien.designation;

  const assignment =
    isArabic
      ? bien.assignmentAr
      : bien.assignment;

  const canOperate =
    !bien.archive.archived &&
    bien.assetStatus !== "SOLD" &&
    bien.assetStatus !== "ARCHIVED";

  const information = [
    {
      label: t(
        "biens.form.inventoryId",
      ),
      value:
        bien.inventoryId,
      icon: Hash,
    },

    {
      label: t(
        "biens.form.type",
      ),
      value: t(
        `biens.types.${bien.type}`,
      ),
      icon: Tag,
    },

    {
      label: t(
        "biens.form.status",
      ),
      value: t(
        `biens.statuses.${bien.assetStatus}`,
      ),
      icon: Building2,
    },

    {
      label: t(
        "biens.form.acquisitionDate",
      ),
      value:
        bien.acquisitionDate,
      icon: Calendar,
    },

    {
      label: t(
        "biens.form.purchaseValue",
      ),

      value: `${bien.purchaseValue.toLocaleString(
        isArabic
          ? "ar-MA"
          : "fr-MA",
      )} DH`,

      icon:
        CircleDollarSign,
    },

    {
      label: t(
        "biens.form.assignment",
      ),
      value: assignment,
      icon: MapPin,
    },
  ];

  const specificInformation =
    bien.type === "VEHICLE"
      ? [
          {
            label: t("biens.form.registrationNumber"),
            value: bien.vehicleDetails?.registrationNumber,
            icon: Car,
          },
          {
            label: t("biens.form.brand"),
            value: bien.vehicleDetails?.brand,
            icon: Tag,
          },
          {
            label: t("biens.form.model"),
            value: bien.vehicleDetails?.model,
            icon: Car,
          },
          {
            label: t("biens.form.year"),
            value: bien.vehicleDetails?.year,
            icon: Calendar,
          },
          {
            label: t("biens.form.chassisNumber"),
            value: bien.vehicleDetails?.chassisNumber,
            icon: Hash,
          },
        ]
      : bien.type === "MACHINE"
        ? [
            {
              label: t("biens.form.brand"),
              value: bien.machineDetails?.brand,
              icon: Cog,
            },
            {
              label: t("biens.form.model"),
              value: bien.machineDetails?.model,
              icon: Cog,
            },
            {
              label: t("biens.form.serialNumber"),
              value: bien.machineDetails?.serialNumber,
              icon: Hash,
            },
            {
              label: t("biens.form.technicalReference"),
              value: bien.machineDetails?.technicalReference,
              icon: Tag,
            },
          ]
        : [
            {
              label: t("biens.form.address"),
              value: bien.realEstateDetails?.address,
              icon: MapPin,
            },
            {
              label: t("biens.form.surface"),
              value: bien.realEstateDetails?.surface
                ? `${bien.realEstateDetails.surface} m²`
                : undefined,
              icon: Home,
            },
            {
              label: t("biens.form.landTitleNumber"),
              value: bien.realEstateDetails?.landTitleNumber,
              icon: Hash,
            },
            {
              label: t("biens.form.propertyType"),
              value: bien.realEstateDetails?.propertyType,
              icon: Building2,
            },
          ];

  const visibleSpecificInformation =
    specificInformation.filter(
      (item) =>
        item.value !== undefined &&
        item.value !== null &&
        item.value !== "",
    );

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <Toast
        open={toast.open}
        message={
          toast.message
        }
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

      <AssetOperationModal
        open={
          operationMode !== null
        }
        mode={
          operationMode ??
          "RENT"
        }
        bien={bien}
        loading={
          operationLoading
        }
        onClose={() =>
          setOperationMode(
            null,
          )
        }
        onRent={handleRent}
        onSell={handleSell}
      />

      <AssetExitModal
        open={exitModalOpen}
        bien={bien}
        loading={exitLoading}
        onClose={() =>
          setExitModalOpen(false)
        }
        onSubmit={handleArchive}
      />

      {/* TOP ACTIONS */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <Link
          to={ROUTES.BIENS}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
        >
          <ArrowLeft
            size={18}
            className="rtl:rotate-180"
          />

          {t(
            "biens.pages.back",
          )}
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {/* OPERATIONS */}

          {canOperate && (
            <PermissionGuard
              permission={
                PERMISSIONS.UPDATE_ASSET
              }
            >
              <div
                ref={
                  operationsRef
                }
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOperationsOpen(
                      (previous) =>
                        !previous,
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20"
                >
                  <Building2
                    size={18}
                  />

                  {t(
                    "biens.operations.button",
                  )}

                  <ChevronDown
                    size={17}
                    className={[
                      "transition-transform",
                      operationsOpen
                        ? "rotate-180"
                        : "",
                    ].join(
                      " ",
                    )}
                  />
                </button>

                {operationsOpen && (
                  <div className="absolute inset-e-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                    {/* LOCATION */}

                    <button
                      type="button"
                      onClick={() => {
                        setOperationMode("RENT");
                        setOperationsOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-700 dark:text-slate-200 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
                    >
                      <KeyRound size={18} />

                      {t("biens.operations.rent")}
                    </button>

                    {/* VENTE */}

                    <button
                      type="button"
                      onClick={() => {
                        setOperationMode("SELL");
                        setOperationsOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-200 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <ShoppingCart size={18} />

                      {t("biens.operations.sell")}
                    </button>

                    {/* SEPARATEUR */}

                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                    {/* SORTIE DU PATRIMOINE */}

                    <button
                      type="button"
                      onClick={() => {
                        setExitModalOpen(true);
                        setOperationsOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-200 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <Archive size={18} />

                      {t("biens.operations.exit")}
                    </button>
                  </div>
                )}
              </div>
            </PermissionGuard>
          )}

          {/* EDIT */}

          <PermissionGuard
            permission={
              PERMISSIONS.UPDATE_ASSET
            }
          >
            <Link
              to={`/biens/${bien.id}/modifier`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              <Pencil
                size={18}
              />

              {t(
                "biens.edit",
              )}
            </Link>
          </PermissionGuard>
        </div>
      </div>

      {/* GENERAL INFORMATION */}

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-100 pb-6 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {designation}
          </h1>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
              {t(
                `biens.types.${bien.type}`,
              )}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              {t(
                `biens.statuses.${bien.assetStatus}`,
              )}
            </span>
          </div>
        </div>

        <h2 className="mt-6 font-bold text-slate-900 dark:text-white">
          {t(
            "biens.pages.information",
          )}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {information.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={
                    item.label
                  }
                  className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
                >
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    <Icon
                      size={16}
                      className="text-orange-600 dark:text-orange-400"
                    />

                    {
                      item.label
                    }
                  </p>

                  <p className="mt-2 font-medium text-slate-800 dark:text-slate-100">
                    {
                      item.value
                    }
                  </p>
                </div>
              );
            },
          )}
        </div>
      </article>

      {/* RENTAL HISTORY */}

      {bien.rentalHistory.length >
        0 && (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <KeyRound className="text-orange-600 dark:text-orange-400" />

            <h2 className="font-bold text-slate-900 dark:text-white">
              {isArabic
                ? "سجل الإيجار"
                : "Historique des locations"}
            </h2>
          </div>

          <div className="mt-5 space-y-3">
            {bien.rentalHistory.map(
              (rental) => (
                <div
                  key={
                    rental.id
                  }
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {
                          rental.tenantName
                        }
                      </p>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {
                          rental.startDate
                        }

                        {rental.endDate
                          ? ` → ${rental.endDate}`
                          : ""}
                      </p>
                    </div>

                    <p className="font-bold text-orange-600 dark:text-orange-400">
                      {rental.monthlyAmount.toLocaleString(
                        isArabic
                          ? "ar-MA"
                          : "fr-MA",
                      )}{" "}
                      DH
                    </p>
                  </div>

                  {rental.contractReference && (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      {t(
                        "biens.operations.contractReference",
                      )}
                      {" : "}
                      {
                        rental.contractReference
                      }
                    </p>
                  )}

                  {rental.contractFileName && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <FileText
                        size={15}
                      />

                      {
                        rental.contractFileName
                      }
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </article>
      )}

      {bien.archive.archived && (
        <article className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/40 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <Archive size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                {t(
                  "biens.archive.archivedBadge",
                )}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {bien.archive.archivedAt ??
                  "—"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-500">
                {t(
                  "biens.archive.columns.reason",
                )}
              </p>

              <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                {t(
                  `biens.archive.reasons.${
                    bien.archive.reason ??
                    "OTHER"
                  }`,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-500">
                {t(
                  "biens.archive.columns.exitDate",
                )}
              </p>

              <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                {bien.archive.archivedAt ??
                  "—"}
              </p>
            </div>

            {bien.archive.reference && (
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {t(
                    "biens.operations.exitReference",
                  )}
                </p>

                <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                  {
                    bien.archive.reference
                  }
                </p>
              </div>
            )}

            {bien.archive.documentFileName && (
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {t(
                    "biens.operations.exitDocument",
                  )}
                </p>

                <p className="mt-2 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  <FileText
                    size={17}
                  />

                  {
                    bien.archive.documentFileName
                  }
                </p>
              </div>
            )}
          </div>

          {bien.archive.notes && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-500">
                {t(
                  "biens.archive.notes",
                )}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {bien.archive.notes}
              </p>
            </div>
          )}
        </article>
      )}

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          {bien.type === "VEHICLE" ? (
            <Car className="text-orange-600 dark:text-orange-400" />
          ) : bien.type === "MACHINE" ? (
            <Cog className="text-orange-600 dark:text-orange-400" />
          ) : (
            <Home className="text-orange-600 dark:text-orange-400" />
          )}

          <h2 className="font-bold text-slate-900 dark:text-white">
            {t("biens.pages.specificInformation")}
          </h2>
        </div>

        {visibleSpecificInformation.length === 0 ? (
          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            {t("biens.pages.noSpecificInformation")}
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {visibleSpecificInformation.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
                >
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    <Icon
                      size={16}
                      className="text-orange-600 dark:text-orange-400"
                    />

                    {item.label}
                  </p>

                  <p className="mt-2 font-medium text-slate-800 dark:text-slate-100">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </article>


      {/* DOCUMENTS */}

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <FileText className="text-orange-600 dark:text-orange-400" />

          <h2 className="font-bold text-slate-900 dark:text-white">
            {t(
              "biens.pages.documents",
            )}
          </h2>
        </div>

        <div className="mt-5 space-y-3">
          {bien.documents.length ===
          0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              {t(
                "biens.pages.noDocuments",
              )}
            </p>
          ) : (
            bien.documents.map(
              (document) => (
                <div
                  key={
                    document.id
                  }
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {
                        document.name
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {t(
                        `biens.documentTypes.${document.type}`,
                      )}
                      {" · "}
                      {
                        document.fileName
                      }
                    </p>
                  </div>

                  <FileText
                    size={20}
                    className="shrink-0 text-orange-500"
                  />
                </div>
              ),
            )
          )}
        </div>
      </article>
    </section>
  );
}

export default BienDetailsPage;
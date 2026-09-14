import {
  ArrowLeft,
  FileText,
  KeyRound,
  Pencil,
  ShoppingCart,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  useTranslation,
} from "react-i18next";

import PermissionGuard from "../../components/common/PermissionGuard";
import DocumentManager from "../../components/documents/DocumentManager";
import Toast from "../../components/common/Toast";

import {
  PERMISSIONS,
} from "../../constants/permissions";

import {
  ROUTES,
} from "../../constants/routes";

import {
  bienApiService,
  type BienApiListItem,
  type DisposalMethod,
} from "../../services/bienApiService";

import {
  documentApiService,
} from "../../services/documentApiService";

import type {
  AssetType,
} from "../../types/bien";

import type {
  AppDocument,
} from "../../types/document";

function isAssetType(
  value: string | null,
): value is AssetType {
  return (
    value === "VEHICLE" ||
    value === "MACHINE" ||
    value === "REAL_ESTATE"
  );
}

function BienDetailsPage() {
  const { id } = useParams();
  const [searchParams] =
    useSearchParams();

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

  const tr = (
    fr: string,
    ar: string,
  ) =>
    isArabic ? ar : fr;

  const typeParam =
    searchParams.get(
      "type",
    );

  const forcedType =
    isAssetType(typeParam)
      ? typeParam
      : undefined;

  const [bien, setBien] =
    useState<
      BienApiListItem | null
    >(null);

  const [loading, setLoading] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [rentOpen, setRentOpen] =
    useState(false);

  const [
    disposeOpen,
    setDisposeOpen,
  ] = useState(false);

  const [
    rentalDocuments,
    setRentalDocuments,
  ] = useState<AppDocument[]>([]);

  const [
    disposalDocuments,
    setDisposalDocuments,
  ] = useState<AppDocument[]>([]);

  const [rental, setRental] =
    useState({
      tenantName: "",
      startDate: "",
      endDate: "",
      frequency: "1",
      amount: "",
    });

  const [disposal, setDisposal] =
    useState<{
      disposalDate: string;
      amount: string;
      disposalMethod:
        DisposalMethod;
      purchaser: string;
    }>({
      disposalDate: "",
      amount: "",
      disposalMethod: "SALE",
      purchaser: "",
    });

  const [toast, setToast] =
    useState<{
      open: boolean;
      message: string;
      type:
        | "success"
        | "error"
        | "info";
    }>({
      open: false,
      message: "",
      type: "info",
    });

  const [
    previewingDocumentId,
    setPreviewingDocumentId,
  ] = useState<number | null>(null);

  const loadBien =
    async () => {
      const assetId =
        Number(id);

      if (
        !Number.isFinite(
          assetId,
        ) ||
        assetId <= 0
      ) {
        setError(
          tr(
            "Identifiant du bien invalide.",
            "معرّف الممتلك غير صالح.",
          ),
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          forcedType
            ? await bienApiService.getById(
                assetId,
                forcedType,
              )
            : await bienApiService.getAssetInfo(
                assetId,
              );

        setBien(data);
      } catch (loadError) {
        console.error(
          "Load asset details failed:",
          loadError,
        );

        setBien(null);

        setError(
          tr(
            "Impossible de charger ce bien depuis le backend.",
            "تعذر تحميل هذا الممتلك من الـBackend.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadBien();
  }, [id, typeParam]);

  const documents =
    useMemo(() => {
      if (!bien) {
        return [];
      }

      const value =
        bien.raw[
          "documentResponseDtoSet"
        ];

      if (
        !Array.isArray(value)
      ) {
        return [];
      }

      return value.filter(
        (
          item,
        ): item is Record<
          string,
          unknown
        > =>
          typeof item ===
            "object" &&
          item !== null,
      );
    }, [bien]);

  const canRent =
    bien?.assetStatus ===
    "AVAILABLE";

  const canDispose =
    bien !== null &&
    ![
      "IN_USE",
      "RENTED",
      "ARCHIVED",
    ].includes(
      bien.assetStatus,
    );

  const submitRental =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault();

      const assetId =
        Number(id);

      const frequency =
        Number(
          rental.frequency,
        );

      const amount =
        Number(
          rental.amount,
        );

      if (
        !Number.isFinite(
          assetId,
        ) ||
        assetId <= 0 ||
        !rental.tenantName.trim() ||
        !rental.startDate ||
        !rental.endDate ||
        !Number.isFinite(
          frequency,
        ) ||
        frequency <= 0 ||
        !Number.isFinite(
          amount,
        ) ||
        amount < 0
      ) {
        setToast({
          open: true,
          message: tr(
            "Veuillez remplir correctement toutes les informations de location.",
            "يرجى ملء جميع معلومات الكراء بشكل صحيح.",
          ),
          type: "error",
        });

        return;
      }

      if (
        rental.endDate <
        rental.startDate
      ) {
        setToast({
          open: true,
          message: tr(
            "La date de fin doit être postérieure ou égale à la date de début.",
            "يجب أن يكون تاريخ النهاية بعد أو مساوياً لتاريخ البداية.",
          ),
          type: "error",
        });

        return;
      }

      try {
        setActionLoading(
          true,
        );

        const rentalId =
          await bienApiService.rent(
            assetId,
            {
              tenantName:
                rental.tenantName.trim(),
              startDate:
                rental.startDate,
              endDate:
                rental.endDate,
              frequency,
              amount,
            },
          );

        await bienApiService.uploadRentalDocuments(
          rentalId,
          rentalDocuments,
        );

        setRentOpen(false);

        setRental({
          tenantName: "",
          startDate: "",
          endDate: "",
          frequency: "1",
          amount: "",
        });

        setRentalDocuments([]);

        await loadBien();

        setToast({
          open: true,
          message: tr(
            "Le bien a été loué avec succès.",
            "تم كراء الممتلك بنجاح.",
          ),
          type: "success",
        });
      } catch (rentError) {
        console.error(
          "Rent asset failed:",
          rentError,
        );

        setToast({
          open: true,
          message: tr(
            "Impossible de finaliser la location ou d’envoyer ses documents.",
            "تعذر إتمام الكراء أو رفع وثائقه.",
          ),
          type: "error",
        });
      } finally {
        setActionLoading(
          false,
        );
      }
    };

  const submitDisposal =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault();

      const assetId =
        Number(id);

      const amount =
        Number(
          disposal.amount,
        );

      if (
        !Number.isFinite(
          assetId,
        ) ||
        assetId <= 0 ||
        !disposal.disposalDate ||
        !disposal.purchaser.trim() ||
        !Number.isFinite(
          amount,
        ) ||
        amount < 0
      ) {
        setToast({
          open: true,
          message: tr(
            "Veuillez remplir correctement toutes les informations de cession.",
            "يرجى ملء جميع معلومات التفويت بشكل صحيح.",
          ),
          type: "error",
        });

        return;
      }

      try {
        setActionLoading(
          true,
        );

        const disposalId =
          await bienApiService.dispose(
            assetId,
            {
              disposalDate:
                disposal.disposalDate,
              amount,
              disposalMethod:
                disposal.disposalMethod,
              purchaser:
                disposal.purchaser.trim(),
            },
          );

        await bienApiService.uploadDisposalDocuments(
          disposalId,
          disposalDocuments,
        );

        setDisposeOpen(false);
        setDisposalDocuments([]);

        // Après la cession le Backend place
        // le bien directement en ARCHIVED.
        navigate(
          ROUTES.BIENS_ARCHIVE,
          {
            replace: true,
          },
        );
      } catch (disposeError) {
        console.error(
          "Dispose asset failed:",
          disposeError,
        );

        setToast({
          open: true,
          message: tr(
            "Impossible de finaliser la cession ou d’envoyer ses documents.",
            "تعذر إتمام التفويت أو رفع وثائقه.",
          ),
          type: "error",
        });
      } finally {
        setActionLoading(
          false,
        );
      }
    };

  const previewDocument = async (
    document: Record<string, unknown>,
  ) => {
    const documentId = Number(
      document["id"],
    );

    if (
      !Number.isFinite(documentId) ||
      documentId <= 0
    ) {
      setToast({
        open: true,
        message: tr(
          "Ce document ne possède pas encore d’identifiant Backend exploitable.",
          "لا تتوفر لهذه الوثيقة بعد هوية صالحة من الخادم.",
        ),
        type: "error",
      });
      return;
    }

    const previewWindow =
      window.open(
        "",
        "_blank",
      );

    try {
      setPreviewingDocumentId(
        documentId,
      );

      const blob =
        await documentApiService.openBlob(
          documentId,
        );

      const objectUrl =
        URL.createObjectURL(
          blob,
        );

      if (previewWindow) {
        previewWindow.location.href =
          objectUrl;
      } else {
        window.location.href =
          objectUrl;
      }

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            objectUrl,
          );
        },
        60000,
      );
    } catch (previewError) {
      previewWindow?.close();

      console.error(
        "Preview document failed:",
        previewError,
      );

      setToast({
        open: true,
        message: tr(
          "Impossible d’ouvrir ce document.",
          "تعذر فتح هذه الوثيقة.",
        ),
        type: "error",
      });
    } finally {
      setPreviewingDocumentId(
        null,
      );
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
        {tr(
          "Chargement du bien...",
          "جارٍ تحميل الممتلك...",
        )}
      </section>
    );
  }

  if (
    error ||
    !bien
  ) {
    return (
      <section className="space-y-6">
        <Link
          to={
            ROUTES.BIENS
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 dark:text-slate-400"
        >
          <ArrowLeft
            size={18}
            className="rtl:rotate-180"
          />

          {tr(
            "Retour aux biens",
            "العودة إلى الممتلكات",
          )}
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      </section>
    );
  }

  const editType =
    bien.type ??
    forcedType;

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

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <Link
            to={
              ROUTES.BIENS
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 dark:text-slate-400"
          >
            <ArrowLeft
              size={18}
              className="rtl:rotate-180"
            />

            {tr(
              "Retour aux biens",
              "العودة إلى الممتلكات",
            )}
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {bien.designation}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {bien.inventoryNumber}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <PermissionGuard
            permission={
              PERMISSIONS.UPDATE_ASSET
            }
          >
            <Link
              to={`/biens/${id}/modifier${
                editType
                  ? `?type=${editType}`
                  : ""
              }`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <Pencil size={18} />
              {tr(
                "Modifier",
                "تعديل",
              )}
            </Link>
          </PermissionGuard>

          <PermissionGuard
            permission={
              PERMISSIONS.RENT_ASSET
            }
          >
            <button
              type="button"
              disabled={
                !canRent ||
                actionLoading
              }
              onClick={() =>
                setRentOpen(true)
              }
              title={
                canRent
                  ? undefined
                  : tr(
                      "Seul un bien disponible peut être loué.",
                      "يمكن كراء الممتلك المتاح فقط.",
                    )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <KeyRound
                size={18}
              />

              {tr(
                "Louer",
                "كراء",
              )}
            </button>
          </PermissionGuard>

          <PermissionGuard
            permission={
              PERMISSIONS.DISPOSE_ASSET
            }
          >
            <button
              type="button"
              disabled={
                !canDispose ||
                actionLoading
              }
              onClick={() =>
                setDisposeOpen(
                  true,
                )
              }
              title={
                canDispose
                  ? undefined
                  : tr(
                      "Un bien en service ou loué ne peut pas être cédé.",
                      "لا يمكن تفويت ممتلك قيد الاستعمال أو مكترى.",
                    )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart
                size={18}
              />

              {tr(
                "Céder / archiver",
                "تفويت / أرشفة",
              )}
            </button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Info
          label={tr(
            "Numéro d’inventaire",
            "رقم الجرد",
          )}
          value={
            bien.inventoryNumber
          }
        />

        <Info
          label={tr(
            "Statut",
            "الحالة",
          )}
          value={t(
            `biens.statuses.${bien.assetStatus}`,
          )}
        />

        <Info
          label={tr(
            "Date d’acquisition",
            "تاريخ الاقتناء",
          )}
          value={
            bien.acquisitionDate ||
            "—"
          }
        />

        <Info
          label={tr(
            "Affectation",
            "الجهة المستعملة",
          )}
          value={
            bien.assignment ??
            "—"
          }
        />

        <Info
          label={tr(
            "Valeur d’acquisition",
            "قيمة الاقتناء",
          )}
          value={
            bien.purchaseValue !==
            undefined
              ? `${bien.purchaseValue.toLocaleString(
                  isArabic
                    ? "ar-MA"
                    : "fr-MA",
                )} DH`
              : "—"
          }
        />
      </div>

      <SpecificDetails
        bien={bien}
        tr={tr}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <FileText
            size={20}
          />

          {tr(
            "Documents",
            "الوثائق",
          )}
        </h2>

        {documents.length ===
        0 ? (
          <p className="mt-4 text-sm text-slate-500">
            {tr(
              "Aucun document associé à ce bien.",
              "لا توجد أي وثيقة مرتبطة بهذا الممتلك.",
            )}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {documents.map(
              (
                document,
                index,
              ) => {
                const title =
                  isArabic
                    ? document[
                        "title_ar"
                      ]
                    : document[
                        "title_fr"
                      ];

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      void previewDocument(
                        document,
                      );
                    }}
                    disabled={
                      previewingDocumentId ===
                      Number(
                        document["id"],
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 p-4 text-start transition hover:border-orange-300 hover:bg-orange-50/50 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:hover:border-orange-700 dark:hover:bg-orange-950/10"
                    title={tr(
                      "Cliquer pour ouvrir le document",
                      "اضغط لفتح الوثيقة",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                          {typeof title ===
                          "string"
                            ? title
                            : "—"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {typeof document[
                            "type"
                          ] ===
                          "string"
                            ? document[
                                "type"
                              ]
                            : "—"}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs font-semibold text-orange-600 dark:text-orange-400">
                        {previewingDocumentId ===
                        Number(
                          document["id"],
                        )
                          ? tr(
                              "Ouverture...",
                              "جارٍ الفتح...",
                            )
                          : tr(
                              "Ouvrir",
                              "فتح",
                            )}
                      </span>
                    </div>
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>

      {rentOpen && (
        <Modal
          title={tr(
            "Louer le bien",
            "كراء الممتلك",
          )}
          onClose={() => {
            if (
              !actionLoading
            ) {
              setRentOpen(
                false,
              );
              setRentalDocuments([]);
            }
          }}
        >
          <form
            onSubmit={
              submitRental
            }
            className="space-y-4"
          >
            <Input
              label={tr(
                "Locataire",
                "المكتري",
              )}
              value={
                rental.tenantName
              }
              onChange={(
                value,
              ) =>
                setRental(
                  (
                    previous,
                  ) => ({
                    ...previous,
                    tenantName:
                      value,
                  }),
                )
              }
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="date"
                label={tr(
                  "Date de début",
                  "تاريخ البداية",
                )}
                value={
                  rental.startDate
                }
                onChange={(
                  value,
                ) =>
                  setRental(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      startDate:
                        value,
                    }),
                  )
                }
                required
              />

              <Input
                type="date"
                label={tr(
                  "Date de fin",
                  "تاريخ النهاية",
                )}
                value={
                  rental.endDate
                }
                onChange={(
                  value,
                ) =>
                  setRental(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      endDate:
                        value,
                    }),
                  )
                }
                required
              />

              <Input
                type="number"
                label={tr(
                  "Fréquence",
                  "التردد",
                )}
                value={
                  rental.frequency
                }
                onChange={(
                  value,
                ) =>
                  setRental(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      frequency:
                        value,
                    }),
                  )
                }
                required
              />

              <Input
                type="number"
                label={tr(
                  "Montant (DH)",
                  "المبلغ (درهم)",
                )}
                value={
                  rental.amount
                }
                onChange={(
                  value,
                ) =>
                  setRental(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      amount:
                        value,
                    }),
                  )
                }
                required
              />
            </div>

            <DocumentManager
              documents={rentalDocuments}
              onChange={setRentalDocuments}
              title={tr(
                "Documents de la location",
                "وثائق الكراء",
              )}
            />

            <ActionButtons
              busy={
                actionLoading
              }
              cancelLabel={tr(
                "Annuler",
                "إلغاء",
              )}
              submitLabel={tr(
                "Confirmer la location",
                "تأكيد الكراء",
              )}
              onCancel={() => {
                setRentOpen(false);
                setRentalDocuments([]);
              }}
            />
          </form>
        </Modal>
      )}

      {disposeOpen && (
        <Modal
          title={tr(
            "Céder et archiver le bien",
            "تفويت وأرشفة الممتلك",
          )}
          onClose={() => {
            if (
              !actionLoading
            ) {
              setDisposeOpen(
                false,
              );
              setDisposalDocuments([]);
            }
          }}
        >
          <form
            onSubmit={
              submitDisposal
            }
            className="space-y-4"
          >
            <Input
              type="date"
              label={tr(
                "Date de cession",
                "تاريخ التفويت",
              )}
              value={
                disposal.disposalDate
              }
              onChange={(
                value,
              ) =>
                setDisposal(
                  (
                    previous,
                  ) => ({
                    ...previous,
                    disposalDate:
                      value,
                  }),
                )
              }
              required
            />

            <Input
              type="number"
              label={tr(
                "Montant (DH)",
                "المبلغ (درهم)",
              )}
              value={
                disposal.amount
              }
              onChange={(
                value,
              ) =>
                setDisposal(
                  (
                    previous,
                  ) => ({
                    ...previous,
                    amount:
                      value,
                  }),
                )
              }
              required
            />

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              {tr(
                "Mode de cession",
                "طريقة التفويت",
              )}

              <select
                value={
                  disposal.disposalMethod
                }
                onChange={(
                  event,
                ) =>
                  setDisposal(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      disposalMethod:
                        event.target
                          .value as DisposalMethod,
                    }),
                  )
                }
                className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900"
              >
                <option value="SALE">
                  {tr(
                    "Vente",
                    "بيع",
                  )}
                </option>

                <option value="DONATION">
                  {tr(
                    "Don",
                    "هبة",
                  )}
                </option>

                <option value="TRANSFER">
                  {tr(
                    "Transfert",
                    "تحويل",
                  )}
                </option>

                <option value="SCRAPPING">
                  {tr(
                    "Mise au rebut",
                    "إتلاف",
                  )}
                </option>
              </select>
            </label>

            <Input
              label={tr(
                "Acquéreur / bénéficiaire",
                "المشتري / المستفيد",
              )}
              value={
                disposal.purchaser
              }
              onChange={(
                value,
              ) =>
                setDisposal(
                  (
                    previous,
                  ) => ({
                    ...previous,
                    purchaser:
                      value,
                  }),
                )
              }
              required
            />

            <DocumentManager
              documents={disposalDocuments}
              onChange={setDisposalDocuments}
              title={tr(
                "Documents de la cession",
                "وثائق التفويت",
              )}
            />

            <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/20 dark:text-orange-300">
              {tr(
                "Après confirmation, le bien sera retiré de la liste active et placé dans les archives.",
                "بعد التأكيد، سيتم حذف الممتلك من اللائحة النشطة ووضعه في الأرشيف.",
              )}
            </div>

            <ActionButtons
              busy={
                actionLoading
              }
              cancelLabel={tr(
                "Annuler",
                "إلغاء",
              )}
              submitLabel={tr(
                "Céder et archiver",
                "تفويت وأرشفة",
              )}
              onCancel={() => {
                setDisposeOpen(false);
                setDisposalDocuments([]);
              }}
              danger
            />
          </form>
        </Modal>
      )}
    </section>
  );
}

function SpecificDetails({
  bien,
  tr,
}: {
  bien: BienApiListItem;
  tr: (
    fr: string,
    ar: string,
  ) => string;
}) {
  const raw =
    bien.raw;

  const values:
    {
      label: string;
      value?: string;
    }[] = [];

  const add = (
    label: string,
    value: unknown,
    suffix = "",
  ) => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    ) {
      return;
    }

    values.push({
      label,
      value: `${String(value)}${suffix}`,
    });
  };

  if (
    bien.type ===
    "VEHICLE"
  ) {
    add(
      tr(
        "Immatriculation",
        "رقم التسجيل",
      ),
      raw.registrationNumber,
    );

    add(
      tr(
        "Marque",
        "العلامة",
      ),
      raw.make,
    );

    add(
      tr(
        "Numéro de châssis",
        "رقم الهيكل",
      ),
      raw.chassisNumber,
    );

    add(
      tr(
        "Puissance fiscale",
        "القوة الجبائية",
      ),
      raw.fiscalHorsepower,
      " CV",
    );

    add(
      tr(
        "Première mise en circulation",
        "أول وضع في السير",
      ),
      raw.firstRegistrationDate,
    );

    add(
      tr(
        "Année",
        "السنة",
      ),
      raw.manufactureYear,
    );

    add(
      tr(
        "Kilométrage",
        "عداد الكيلومترات",
      ),
      raw.odometer,
      " km",
    );
  }

  if (
    bien.type ===
    "MACHINE"
  ) {
    add(
      tr(
        "Marque",
        "العلامة",
      ),
      raw.brand,
    );

    add(
      tr(
        "Modèle",
        "الطراز",
      ),
      raw.model,
    );

    add(
      tr(
        "Numéro de série",
        "الرقم التسلسلي",
      ),
      raw.serialNumber,
    );

    add(
      tr(
        "Référence technique",
        "المرجع التقني",
      ),
      raw.technicalRef,
    );

    add(
      tr(
        "Puissance",
        "القدرة",
      ),
      raw.power,
    );
  }

  if (
    bien.type ===
    "REAL_ESTATE"
  ) {
    add(
      tr(
        "Référence foncière",
        "المرجع العقاري",
      ),
      raw.landTitleReference,
    );

    add(
      tr(
        "Référence cadastrale",
        "المرجع المساحي",
      ),
      raw.cadastralReference,
    );

    add(
      tr(
        "Superficie",
        "المساحة",
      ),
      raw.areaM2,
      " m²",
    );

    add(
      tr(
        "Localisation GPS",
        "الموقع GPS",
      ),
      raw.gpsLocation,
    );

    add(
      tr(
        "Domaine",
        "المجال",
      ),
      raw.domain,
    );

    add(
      tr(
        "Type immobilier",
        "نوع العقار",
      ),
      raw.realEstateType,
    );
  }

  if (
    values.length === 0
  ) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {values.map(
        (item) => (
          <Info
            key={
              item.label
            }
            label={
              item.label
            }
            value={
              item.value ??
              "—"
            }
          />
        ),
      )}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?:
    | "text"
    | "number"
    | "date";
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}

      {required && (
        <span className="ms-1 text-red-500">
          *
        </span>
      )}

      <input
        type={type}
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-900"
      />
    </label>
  );
}

function ActionButtons({
  busy,
  cancelLabel,
  submitLabel,
  onCancel,
  danger = false,
}: {
  busy: boolean;
  cancelLabel: string;
  submitLabel: string;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2 rtl:justify-start">
      <button
        type="button"
        disabled={busy}
        onClick={
          onCancel
        }
        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
      >
        {cancelLabel}
      </button>

      <button
        type="submit"
        disabled={busy}
        className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${
          danger
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {busy
          ? "..."
          : submitLabel}
      </button>
    </div>
  );
}

export default BienDetailsPage;

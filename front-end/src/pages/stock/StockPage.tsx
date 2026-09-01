
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BellRing,
  Boxes,
  Check,
  ClipboardCheck,
  ClipboardPlus,
  PackageCheck,
  Plus,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ArticleFilters from "../../components/stock/ArticleFilters";
import ArticleTable from "../../components/stock/ArticleTable";
import RequestRejectionModal from "../../components/stock/RequestRejectionModal";
import StockMovementModal from "../../components/stock/StockMovementModal";
import SupplyRequestModal from "../../components/stock/SupplyRequestModal";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PermissionGuard from "../../components/common/PermissionGuard";
import Toast from "../../components/common/Toast";

import { PERMISSIONS } from "../../constants/permissions";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { notificationService } from "../../services/notificationService";
import { stockService } from "../../services/stockService";

import type { AppDocument } from "../../types/document";
import type {
  RestockAlert,
  StockArticle,
  StockMovement,
  StockMovementType,
  SupplyRequest,
} from "../../types/stock";

function StockPage() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [articles, setArticles] =
    useState<StockArticle[]>([]);
  const [movements, setMovements] =
    useState<StockMovement[]>([]);
  const [requests, setRequests] =
    useState<SupplyRequest[]>([]);
  const [restockAlerts, setRestockAlerts] =
    useState<RestockAlert[]>([]);

  const [search, setSearch] = useState("");
  const [alertOnly, setAlertOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [
    articleToDelete,
    setArticleToDelete,
  ] = useState<StockArticle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [
    selectedMovementArticle,
    setSelectedMovementArticle,
  ] = useState<StockArticle | null>(null);
  const [
    selectedMovementType,
    setSelectedMovementType,
  ] = useState<StockMovementType>("ENTRY");
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

  const [
    requestToReject,
    setRequestToReject,
  ] = useState<SupplyRequest | null>(null);
  const [
    rejectionLoading,
    setRejectionLoading,
  ] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
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
        restockData,
      ] = await Promise.all([
        stockService.getArticles(),
        stockService.getMovements(),
        stockService.getRequests(),
        stockService.getRestockAlerts(),
      ]);

      setArticles(articleData);
      setMovements(movementData);
      setRequests(requestData);
      setRestockAlerts(restockData);
    } catch {
      setError(
        tr(
          "Impossible de charger les données du stock.",
          "تعذر تحميل بيانات المخزون.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesSearch =
        !q ||
        article.reference.toLowerCase().includes(q) ||
        article.barcode.toLowerCase().includes(q) ||
        article.brand.toLowerCase().includes(q) ||
        article.designation.toLowerCase().includes(q) ||
        article.designationAr.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q) ||
        article.categoryAr.toLowerCase().includes(q);

      const low =
        article.quantity <= article.minimumQuantity;

      return (
        matchesSearch &&
        (!alertOnly || low)
      );
    });
  }, [articles, search, alertOnly]);

  const lowStockCount =
    articles.filter(
      (article) =>
        article.quantity <= article.minimumQuantity,
    ).length;

  const pendingRequestsCount =
    requests.filter(
      (request) => request.status === "PENDING",
    ).length;

  const waitingRestockCount =
    restockAlerts.filter(
      (alert) => alert.status === "WAITING",
    ).length;

  const recentMovements = movements.slice(0, 5);

  const currentRequester = {
    id: user?.id ?? 0,
    name: user
      ? `${user.firstName} ${user.lastName}`
      : tr("Utilisateur connecté", "المستخدم المتصل"),
  };

  const openMovementModal = (
    article: StockArticle,
    type: StockMovementType,
  ) => {
    setSelectedMovementArticle(article);
    setSelectedMovementType(type);
    setMovementModalOpen(true);
  };

  const handleMovementSubmit = async (data: {
    articleId: number;
    type: StockMovementType;
    quantity: number;
    reason: string;
    supplierOrBeneficiary?: string;
    reference?: string;
    date?: string;
    documents?: AppDocument[];
    unitPriceHt?: number;
    vatRate?: number;
  }) => {
    try {
      setMovementLoading(true);

      await stockService.createMovement({
        ...data,
        performedBy: currentRequester.name,
      });

      setMovementModalOpen(false);
      setSelectedMovementArticle(null);

      showToast(
        data.type === "ENTRY"
          ? tr(
              "Entrée enregistrée avec le nouveau prix et la TVA.",
              "تم تسجيل الإدخال بالثمن والضريبة الجديدين.",
            )
          : tr(
              "Sortie enregistrée.",
              "تم تسجيل الإخراج.",
            ),
      );

      await loadData();
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : tr("Erreur de mouvement.", "خطأ في حركة المخزون."),
        "error",
      );
    } finally {
      setMovementLoading(false);
    }
  };

  const handleCreateRequest = async (data: {
    articleId: number;
    requestedQuantity: number;
    requesterId: number;
    requester: string;
    reason: string;
    documents?: AppDocument[];
  }) => {
    try {
      setRequestLoading(true);

      const request =
        await stockService.createRequest(data);

      await notificationService.createManual({
        title: "Nouvelle demande de fourniture",
        titleAr: "طلب تموين جديد",
        message: `${request.requester} demande ${request.requestedQuantity} unité(s) de ${request.articleDesignation}.`,
        messageAr: `${request.requester} يطلب ${request.requestedQuantity} من ${request.articleDesignationAr}.`,
        type: "INFO",
        module: "STOCK",
        targetUrl: "/stock",
        recipientPermission:
          PERMISSIONS.VALIDATE_SUPPLY_REQUEST,
      });

      setRequestModalOpen(false);

      showToast(
        tr(
          "Demande envoyée. Son statut est « En attente » jusqu’à la décision du responsable.",
          "تم إرسال الطلب. حالته « قيد الانتظار » إلى أن يقرر المسؤول.",
        ),
      );

      await loadData();
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : tr(
              "Impossible de créer la demande.",
              "تعذر إنشاء الطلب.",
            ),
        "error",
      );
    } finally {
      setRequestLoading(false);
    }
  };

  const handleRestockAlert = async (data: {
    articleId: number;
    requestedQuantity: number;
    requesterId: number;
    requester: string;
    reason: string;
  }) => {
    try {
      setRequestLoading(true);

      const alert =
        await stockService.createRestockAlert(data);

      await notificationService.createManual({
        title: "Réapprovisionnement nécessaire",
        titleAr: "الحاجة إلى إعادة تزويد المخزون",
        message: `${alert.requester} a besoin de ${alert.requestedQuantity} unité(s) de ${alert.articleDesignation}, mais le stock disponible est ${alert.availableQuantityAtRequest}.`,
        messageAr: `${alert.requester} يحتاج ${alert.requestedQuantity} من ${alert.articleDesignationAr}، بينما المتوفر هو ${alert.availableQuantityAtRequest}.`,
        type: "WARNING",
        module: "STOCK",
        targetUrl: "/stock",
        recipientPermission:
          PERMISSIONS.VALIDATE_SUPPLY_REQUEST,
      });

      setRequestModalOpen(false);

      showToast(
        tr(
          "Le responsable a été notifié du besoin de réapprovisionnement.",
          "تم إشعار المسؤول بالحاجة إلى إعادة التزويد.",
        ),
        "info",
      );

      await loadData();
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : tr(
              "Impossible d’envoyer l’alerte.",
              "تعذر إرسال التنبيه.",
            ),
        "error",
      );
    } finally {
      setRequestLoading(false);
    }
  };

  const approveRequest = async (
    request: SupplyRequest,
  ) => {
    try {
      const updated =
        await stockService.updateRequestStatus(
          request.id,
          "APPROVED",
        );

      await notificationService.createManual({
        title: "Demande acceptée",
        titleAr: "تم قبول الطلب",
        message: `Votre demande de ${updated.requestedQuantity} unité(s) de ${updated.articleDesignation} est acceptée. Après récupération, cliquez sur « Reçu » pour enregistrer la sortie du stock.`,
        messageAr: `تم قبول طلبك لـ ${updated.requestedQuantity} من ${updated.articleDesignationAr}. بعد استلام الكمية اضغط « تم الاستلام » لتسجيل خروجها من المخزون.`,
        type: "SUCCESS",
        module: "STOCK",
        targetUrl: "/stock",
        recipientUserId: updated.requesterId,
      });

      showToast(
        tr(
          "Demande acceptée. La quantité est réservée en attente de confirmation de réception.",
          "تم قبول الطلب وحجز الكمية في انتظار تأكيد الاستلام.",
        ),
      );

      await loadData();
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : tr(
              "Impossible d’accepter la demande.",
              "تعذر قبول الطلب.",
            ),
        "error",
      );
    }
  };

  const rejectRequest = async (
    request: SupplyRequest,
    reason: string,
  ) => {
    try {
      setRejectionLoading(true);

      const updated =
        await stockService.updateRequestStatus(
          request.id,
          "REJECTED",
          reason,
        );

      await notificationService.createManual({
        title: "Demande refusée",
        titleAr: "تم رفض الطلب",
        message: `Votre demande de ${updated.articleDesignation} a été refusée. Motif : ${reason}`,
        messageAr: `تم رفض طلب ${updated.articleDesignationAr}. السبب: ${reason}`,
        type: "ERROR",
        module: "STOCK",
        targetUrl: "/stock",
        recipientUserId: updated.requesterId,
      });

      setRequestToReject(null);

      showToast(
        tr(
          "Demande refusée et demandeur notifié.",
          "تم رفض الطلب وإشعار مقدم الطلب.",
        ),
      );

      await loadData();
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : tr(
              "Impossible de refuser la demande.",
              "تعذر رفض الطلب.",
            ),
        "error",
      );
    } finally {
      setRejectionLoading(false);
    }
  };

  const confirmReceipt = async (
    request: SupplyRequest,
  ) => {
    try {
      const updated =
        await stockService.confirmRequestReceipt(
          request.id,
          currentRequester.id,
          currentRequester.name,
        );

      await notificationService.createManual({
        title: "Sortie enregistrée",
        titleAr: "تم تسجيل خروج الكمية",
        message: `${updated.requester} a confirmé la réception de ${updated.requestedQuantity} unité(s) de ${updated.articleDesignation}. La sortie a été enregistrée automatiquement.`,
        messageAr: `${updated.requester} أكد استلام ${updated.requestedQuantity} من ${updated.articleDesignationAr}. تم تسجيل الخروج تلقائياً.`,
        type: "INFO",
        module: "STOCK",
        targetUrl: "/stock/historique",
        recipientPermission:
          PERMISSIONS.VALIDATE_SUPPLY_REQUEST,
      });

      showToast(
        tr(
          "Réception confirmée. La sortie du stock a été enregistrée automatiquement.",
          "تم تأكيد الاستلام وتسجيل خروج الكمية من المخزون تلقائياً.",
        ),
      );

      await loadData();
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : tr(
              "Impossible de confirmer la réception.",
              "تعذر تأكيد الاستلام.",
            ),
        "error",
      );
    }
  };

  const notifyRestockReady = async (
    alert: RestockAlert,
  ) => {
    try {
      const updated =
        await stockService.markRestockReady(
          alert.id,
        );

      await notificationService.createManual({
        title: "Quantité disponible",
        titleAr: "الكمية أصبحت متوفرة",
        message: `${updated.requestedQuantity} unité(s) de ${updated.articleDesignation} sont maintenant disponibles. Vous pouvez créer votre demande.`,
        messageAr: `أصبحت ${updated.requestedQuantity} من ${updated.articleDesignationAr} متوفرة الآن. يمكنك إنشاء طلبك.`,
        type: "SUCCESS",
        module: "STOCK",
        targetUrl: "/stock",
        recipientUserId: updated.requesterId,
      });

      showToast(
        tr(
          "Le demandeur a été notifié que la quantité est disponible.",
          "تم إشعار مقدم الطلب بأن الكمية أصبحت متوفرة.",
        ),
      );

      await loadData();
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : tr(
              "La quantité n’est pas encore suffisante.",
              "الكمية ما زالت غير كافية.",
            ),
        "error",
      );
    }
  };

  const handleDelete = async () => {
    if (!articleToDelete) {
      return;
    }

    try {
      setDeleting(true);
      await stockService.removeArticle(
        articleToDelete.id,
      );
      setArticleToDelete(null);
      showToast(
        tr(
          "Article supprimé.",
          "تم حذف المادة.",
        ),
      );
      await loadData();
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : tr("Erreur de suppression.", "خطأ في الحذف."),
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-6">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast((previous) => ({
            ...previous,
            open: false,
          }))
        }
      />

      <StockMovementModal
        open={movementModalOpen}
        type={selectedMovementType}
        article={selectedMovementArticle}
        loading={movementLoading}
        onClose={() => {
          if (!movementLoading) {
            setMovementModalOpen(false);
            setSelectedMovementArticle(null);
          }
        }}
        onSubmit={handleMovementSubmit}
      />

      <SupplyRequestModal
        open={requestModalOpen}
        articles={articles}
        requester={currentRequester}
        loading={requestLoading}
        onClose={() => {
          if (!requestLoading) {
            setRequestModalOpen(false);
          }
        }}
        onSubmit={handleCreateRequest}
        onRestockAlert={handleRestockAlert}
      />

      <RequestRejectionModal
        open={requestToReject !== null}
        request={requestToReject}
        loading={rejectionLoading}
        onClose={() => setRequestToReject(null)}
        onSubmit={rejectRequest}
      />

      <ConfirmDialog
        open={articleToDelete !== null}
        title={tr("Supprimer l’article", "حذف المادة")}
        message={
          articleToDelete
            ? tr(
                `Voulez-vous vraiment supprimer « ${articleToDelete.designation} » ?`,
                `هل تريد فعلاً حذف « ${articleToDelete.designationAr} »؟`,
              )
            : ""
        }
        confirmLabel={tr("Supprimer", "حذف")}
        cancelLabel={tr("Annuler", "إلغاء")}
        loading={deleting}
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() => setArticleToDelete(null)}
      />

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
            <Boxes className="text-orange-600" />
            {tr("Gestion du stock", "تدبير المخزون")}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {tr(
              "Articles, prix, entrées, sorties, demandes et alertes de réapprovisionnement.",
              "المواد والأسعار والإدخالات والإخراجات والطلبات وتنبيهات إعادة التزويد.",
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <PermissionGuard
            permission={PERMISSIONS.CREATE_SUPPLY_REQUEST}
          >
            <button
              type="button"
              onClick={() => setRequestModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300"
            >
              <ClipboardPlus size={19} />
              {tr("Créer une demande", "إنشاء طلب")}
            </button>
          </PermissionGuard>

          <PermissionGuard
            permission={PERMISSIONS.CREATE_ARTICLE}
          >
            <Link
              to={ROUTES.ADD_ARTICLE}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700"
            >
              <Plus size={19} />
              {tr("Ajouter un article", "إضافة مادة")}
            </Link>
          </PermissionGuard>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={tr("Articles", "المواد")}
          value={articles.length}
        />
        <Metric
          label={tr("Alertes de stock", "تنبيهات المخزون")}
          value={lowStockCount}
        />
        <Metric
          label={tr("Demandes en attente", "الطلبات قيد الانتظار")}
          value={pendingRequestsCount}
        />
        <Metric
          label={tr("Réapprovisionnements", "طلبات إعادة التزويد")}
          value={waitingRestockCount}
        />
      </div>

      <ArticleFilters
        search={search}
        alertOnly={alertOnly}
        onSearchChange={setSearch}
        onAlertOnlyChange={setAlertOnly}
      />

      <ArticleTable
        articles={filteredArticles}
        loading={loading}
        onDelete={setArticleToDelete}
        onEntry={(article) =>
          openMovementModal(article, "ENTRY")
        }
        onExit={(article) =>
          openMovementModal(article, "EXIT")
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <PermissionGuard
          permission={PERMISSIONS.GET_STOCK_HISTORY}
        >
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {tr("Mouvements récents", "آخر حركات المخزون")}
              </h2>

              <Link
                to={ROUTES.STOCK_HISTORY}
                className="text-sm font-semibold text-orange-600"
              >
                {tr("Voir tout", "عرض الكل")}
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentMovements.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900">
                  {tr("Aucun mouvement", "لا توجد حركات")}
                </p>
              ) : (
                recentMovements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
                  >
                    {movement.type === "ENTRY" ? (
                      <ArrowDownToLine className="shrink-0 text-green-600" />
                    ) : (
                      <ArrowUpFromLine className="shrink-0 text-orange-600" />
                    )}

                    <div>
                      <p className="font-semibold">
                        {isArabic
                          ? movement.articleDesignationAr
                          : movement.articleDesignation}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {movement.type === "ENTRY"
                          ? tr("Entrée", "إدخال")
                          : tr("Sortie", "إخراج")}{" "}
                        {movement.quantity}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {movement.reason}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {movement.date} · {movement.performedBy}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </PermissionGuard>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-orange-600" />
            <h2 className="text-lg font-semibold">
              {tr("Demandes de fourniture", "طلبات التموين")}
            </h2>
          </div>

          <div className="mt-4 space-y-3">
            {requests.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900">
                {tr("Aucune demande", "لا توجد طلبات")}
              </p>
            ) : (
              requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isArabic={isArabic}
                  currentUserId={user?.id}
                  canValidate={
                    user?.role.permissions.includes(
                      PERMISSIONS.VALIDATE_SUPPLY_REQUEST,
                    ) ?? false
                  }
                  canReject={
                    user?.role.permissions.includes(
                      PERMISSIONS.REJECT_SUPPLY_REQUEST,
                    ) ?? false
                  }
                  onApprove={() => {
                    void approveRequest(request);
                  }}
                  onReject={() =>
                    setRequestToReject(request)
                  }
                  onReceipt={() => {
                    void confirmReceipt(request);
                  }}
                />
              ))
            )}
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
        <div className="flex items-center gap-2">
          <BellRing className="text-amber-700" />
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-200">
            {tr(
              "Besoins de réapprovisionnement",
              "احتياجات إعادة التزويد",
            )}
          </h2>
        </div>

        <div className="mt-4 space-y-3">
          {restockAlerts.length === 0 ? (
            <p className="rounded-xl bg-white/60 p-4 text-sm text-amber-800 dark:bg-slate-900/40 dark:text-amber-200">
              {tr(
                "Aucun besoin de réapprovisionnement signalé.",
                "لا توجد حاجة لإعادة التزويد حالياً.",
              )}
            </p>
          ) : (
            restockAlerts.map((alert) => {
              const article = articles.find(
                (item) => item.id === alert.articleId,
              );
              const enough =
                (article?.quantity ?? 0) >=
                alert.requestedQuantity;

              return (
                <div
                  key={alert.id}
                  className="rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-900/50 dark:bg-slate-900"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <p className="font-semibold">
                        {isArabic
                          ? alert.articleDesignationAr
                          : alert.articleDesignation}
                      </p>
                      <p className="mt-1 text-sm">
                        {tr("Demandé", "المطلوب")}:{" "}
                        {alert.requestedQuantity} ·{" "}
                        {tr("Stock actuel", "المخزون الحالي")}:{" "}
                        {article?.quantity ?? 0}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {alert.requester} · {alert.createdAt}
                      </p>
                    </div>

                    {alert.status === "READY_NOTIFIED" ? (
                      <span className="h-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {tr(
                          "Demandeur notifié",
                          "تم إشعار مقدم الطلب",
                        )}
                      </span>
                    ) : (
                      <PermissionGuard
                        permission={
                          PERMISSIONS.VALIDATE_SUPPLY_REQUEST
                        }
                      >
                        <button
                          type="button"
                          disabled={!enough}
                          onClick={() => {
                            void notifyRestockReady(alert);
                          }}
                          className="inline-flex h-fit items-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <PackageCheck size={18} />
                          {enough
                            ? tr(
                                "Notifier : quantité prête",
                                "إشعار: الكمية جاهزة",
                              )
                            : tr(
                                "Stock encore insuffisant",
                                "المخزون ما زال غير كافٍ",
                              )}
                        </button>
                      </PermissionGuard>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </article>
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </article>
  );
}

function RequestCard({
  request,
  isArabic,
  currentUserId,
  canValidate,
  canReject,
  onApprove,
  onReject,
  onReceipt,
}: {
  request: SupplyRequest;
  isArabic: boolean;
  currentUserId?: number;
  canValidate: boolean;
  canReject: boolean;
  onApprove: () => void;
  onReject: () => void;
  onReceipt: () => void;
}) {
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const statusLabel = {
    PENDING: tr("En attente", "قيد الانتظار"),
    APPROVED: tr(
      "Acceptée - prête à récupérer",
      "مقبولة - جاهزة للاستلام",
    ),
    REJECTED: tr("Refusée", "مرفوضة"),
    RECEIVED: tr(
      "Reçue - sortie enregistrée",
      "تم الاستلام - الخروج مسجل",
    ),
  }[request.status];

  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <p className="font-semibold">
            {isArabic
              ? request.articleDesignationAr
              : request.articleDesignation}
          </p>
          <p className="mt-1 text-sm">
            {tr("Quantité", "الكمية")}:{" "}
            {request.requestedQuantity}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {request.reason}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {request.requester} · {request.requestDate}
          </p>

          {request.rejectionReason && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-950/20 dark:text-red-300">
              {tr("Motif du refus", "سبب الرفض")}:{" "}
              {request.rejectionReason}
            </p>
          )}
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-semibold",
              request.status === "PENDING"
                ? "bg-amber-100 text-amber-700"
                : request.status === "APPROVED"
                  ? "bg-blue-100 text-blue-700"
                  : request.status === "RECEIVED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700",
            ].join(" ")}
          >
            {statusLabel}
          </span>

          {request.status === "PENDING" && (
            <div className="flex gap-2">
              {canValidate && (
                <button
                  type="button"
                  onClick={onApprove}
                  title={tr("Accepter", "قبول")}
                  className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100"
                >
                  <Check size={18} />
                </button>
              )}

              {canReject && (
                <button
                  type="button"
                  onClick={onReject}
                  title={tr("Refuser", "رفض")}
                  className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}

          {request.status === "APPROVED" &&
            currentUserId === request.requesterId && (
              <button
                type="button"
                onClick={onReceipt}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white"
              >
                <PackageCheck size={16} />
                {tr(
                  "Reçu",
                  "تم الاستلام",
                )}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

export default StockPage;

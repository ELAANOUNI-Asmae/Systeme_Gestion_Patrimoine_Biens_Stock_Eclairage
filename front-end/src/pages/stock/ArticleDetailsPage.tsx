
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  Barcode,
  Boxes,
  CalendarDays,
  FileText,
  History,
  MapPin,
  Pencil,
  Tag,
  TriangleAlert,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import PermissionGuard from "../../components/common/PermissionGuard";
import { PERMISSIONS } from "../../constants/permissions";
import { ROUTES } from "../../constants/routes";
import { stockService } from "../../services/stockService";
import {
  calculateTotalHt,
  calculateTotalTtc,
  calculateUnitPriceTtc,
  type StockArticle,
  type StockMovement,
} from "../../types/stock";

function ArticleDetailsPage() {
  const { id } = useParams();
  const articleId = Number(id);
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [article, setArticle] =
    useState<StockArticle | null>(null);
  const [movements, setMovements] =
    useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!Number.isFinite(articleId)) {
          throw new Error(
            tr(
              "Identifiant invalide.",
              "المعرّف غير صالح.",
            ),
          );
        }

        const [articleData, movementData] =
          await Promise.all([
            stockService.getArticleById(articleId),
            stockService.getMovementsByArticleId(articleId),
          ]);

        setArticle(articleData);
        setMovements(movementData);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : tr(
                "Article introuvable.",
                "المادة غير موجودة.",
              ),
        );
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [articleId]);

  const totals = useMemo(
    () => ({
      entries: movements
        .filter((movement) => movement.type === "ENTRY")
        .reduce((total, movement) => total + movement.quantity, 0),
      exits: movements
        .filter((movement) => movement.type === "EXIT")
        .reduce((total, movement) => total + movement.quantity, 0),
    }),
    [movements],
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
        {tr("Chargement", "جارٍ التحميل")}
      </div>
    );
  }

  if (!article) {
    return (
      <section className="space-y-4">
        <Link
          to={ROUTES.STOCK}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600"
        >
          <ArrowLeft size={18} className="rtl:rotate-180" />
          {tr("Retour au stock", "العودة إلى المخزون")}
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </section>
    );
  }

  const designation =
    isArabic
      ? article.designationAr
      : article.designation;
  const category =
    isArabic
      ? article.categoryAr
      : article.category;
  const location =
    isArabic
      ? article.locationAr
      : article.location;
  const low =
    article.quantity <= article.minimumQuantity;

  const information = [
    {
      label: tr("Référence", "المرجع"),
      value: article.reference,
      icon: Tag,
    },
    {
      label: tr("Code-barres", "الباركود"),
      value: article.barcode,
      icon: Barcode,
    },
    {
      label: tr("Marque", "العلامة"),
      value: article.brand,
      icon: Tag,
    },
    {
      label: tr("Catégorie", "الفئة"),
      value: category,
      icon: Boxes,
    },
    {
      label: tr("Quantité", "الكمية"),
      value: `${article.quantity} ${article.unit}`,
      icon: Boxes,
    },
    {
      label: tr("Seuil minimum", "الحد الأدنى"),
      value: `${article.minimumQuantity} ${article.unit}`,
      icon: TriangleAlert,
    },
    {
      label: tr("Emplacement", "المكان"),
      value: location,
      icon: MapPin,
    },
    {
      label: tr("Prix unitaire HT", "ثمن الوحدة بدون الضريبة"),
      value: `${article.unitPriceHt.toFixed(2)} DH`,
      icon: Tag,
    },
    {
      label: tr("TVA", "الضريبة"),
      value: `${article.vatRate.toFixed(2)} %`,
      icon: Tag,
    },
    {
      label: tr("Prix unitaire TTC", "ثمن الوحدة شامل الضريبة"),
      value: `${calculateUnitPriceTtc(
        article.unitPriceHt,
        article.vatRate,
      ).toFixed(2)} DH`,
      icon: Tag,
    },
    {
      label: tr("Valeur totale HT", "القيمة الإجمالية بدون الضريبة"),
      value: `${calculateTotalHt(
        article.quantity,
        article.unitPriceHt,
      ).toFixed(2)} DH`,
      icon: Tag,
    },
    {
      label: tr("Valeur totale TTC", "القيمة الإجمالية شامل الضريبة"),
      value: `${calculateTotalTtc(
        article.quantity,
        article.unitPriceHt,
        article.vatRate,
      ).toFixed(2)} DH`,
      icon: Tag,
    },
    {
      label: tr("Dernière mise à jour", "آخر تحديث"),
      value: article.updatedAt,
      icon: CalendarDays,
    },
  ];

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          to={ROUTES.STOCK}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600"
        >
          <ArrowLeft size={18} className="rtl:rotate-180" />
          {tr("Retour au stock", "العودة إلى المخزون")}
        </Link>

        <PermissionGuard permission={PERMISSIONS.UPDATE_ITEM}>
          <Link
            to={`/stock/articles/${article.id}/modifier`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Pencil size={18} />
            {tr("Modifier", "تعديل")}
          </Link>
        </PermissionGuard>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-700 sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold">
              {designation}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {article.reference} · {article.brand}
            </p>
          </div>

          <span
            className={
              low
                ? "h-fit rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700"
                : "h-fit rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700"
            }
          >
            {low
              ? tr("Stock faible", "مخزون منخفض")
              : tr("Disponible", "متوفر")}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {information.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
              >
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Icon size={16} className="text-orange-600" />
                  {item.label}
                </p>
                <p className="mt-2 font-medium">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <FileText className="text-orange-600" />
          <h2 className="font-bold">
            {tr("Documents associés", "الوثائق المرتبطة")}
          </h2>
        </div>

        {article.documents.length === 0 ? (
          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900">
            {tr("Aucun document", "لا توجد وثائق")}
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {article.documents.map((document) => (
              <div
                key={document.id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <p className="font-semibold">
                  {document.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {document.fileName}
                </p>
                {document.category === "OFFICIAL" &&
                  document.expirationDate && (
                    <p className="mt-2 text-xs font-medium text-orange-600">
                      {tr("Expire le", "تنتهي في")}{" "}
                      {document.expirationDate}
                    </p>
                  )}
              </div>
            ))}
          </div>
        )}
      </article>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={tr("Mouvements", "الحركات")}
          value={movements.length}
          icon={<History />}
        />
        <StatCard
          label={tr("Total entrées", "إجمالي الإدخالات")}
          value={totals.entries}
          icon={<ArrowDownToLine />}
        />
        <StatCard
          label={tr("Total sorties", "إجمالي الإخراجات")}
          value={totals.exits}
          icon={<ArrowUpFromLine />}
        />
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5 dark:border-slate-700">
          <History className="text-orange-600" />
          <h2 className="font-bold">
            {tr("Historique de l’article", "سجل المادة")}
          </h2>
        </div>

        {movements.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            {tr("Aucun mouvement", "لا توجد حركات")}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {movements.map((movement) => {
              const entry = movement.type === "ENTRY";
              const totalTtc = calculateTotalTtc(
                movement.quantity,
                movement.unitPriceHt,
                movement.vatRate,
              );

              return (
                <div key={movement.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <div>
                      <p className="font-semibold">
                        {entry
                          ? tr("Entrée", "إدخال")
                          : tr("Sortie", "إخراج")}{" "}
                        · {movement.quantity} {article.unit}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {movement.reason}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {tr("PU HT", "ثمن الوحدة بدون الضريبة")}:{" "}
                        {movement.unitPriceHt.toFixed(2)} DH ·{" "}
                        {tr("TVA", "الضريبة")}:{" "}
                        {movement.vatRate.toFixed(2)}% ·{" "}
                        {tr("Total TTC", "الإجمالي شامل الضريبة")}:{" "}
                        {totalTtc.toFixed(2)} DH
                      </p>
                      {movement.reference && (
                        <p className="mt-1 text-xs text-slate-500">
                          {tr("Référence", "المرجع")}:{" "}
                          {movement.reference}
                        </p>
                      )}
                    </div>

                    <div className="text-sm text-slate-500 sm:text-end">
                      <p>{movement.date}</p>
                      <p className="mt-1">
                        {movement.performedBy}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className="text-orange-600">{icon}</div>
      </div>
    </article>
  );
}

export default ArticleDetailsPage;

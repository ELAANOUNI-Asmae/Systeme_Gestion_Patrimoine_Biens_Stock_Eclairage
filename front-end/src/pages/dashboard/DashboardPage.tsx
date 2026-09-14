import {
  AlertTriangle,
  Building2,
  Boxes,
  CircleCheckBig,
  Lightbulb,
  PackageSearch,
  RefreshCw,
  Users,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { PERMISSIONS } from "../../constants/permissions";
import { useAuth } from "../../hooks/useAuth";
import { bienApiService } from "../../services/bienApiService";
import { lightingService } from "../../services/lightingService";
import { stockService } from "../../services/stockService";
import { userService } from "../../services/userService";

type Values = {
  usersTotal: number | null;
  usersActive: number | null;
  usersInactive: number | null;
  assetsTotal: number | null;
  assetsAvailable: number | null;
  assetsMaintenance: number | null;
  stockArticles: number | null;
  stockQuantity: number | null;
  stockLow: number | null;
  lightsTotal: number | null;
  lightsOperational: number | null;
  lightsIssue: number | null;
  failuresOpen: number | null;
};

const emptyValues: Values = {
  usersTotal: null,
  usersActive: null,
  usersInactive: null,
  assetsTotal: null,
  assetsAvailable: null,
  assetsMaintenance: null,
  stockArticles: null,
  stockQuantity: null,
  stockLow: null,
  lightsTotal: null,
  lightsOperational: null,
  lightsIssue: null,
  failuresOpen: null,
};

function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const canUsers = hasPermission(PERMISSIONS.GET_ALL_PROFILS);
  const canAssets = hasPermission(PERMISSIONS.GET_ALL_ASSETS);
  const canStock = hasPermission(PERMISSIONS.GET_ALL_ITEMS);
  const canLighting = hasPermission(PERMISSIONS.GET_ALL_LIGHT_POINT);
  const canFailures = hasPermission(PERMISSIONS.GET_ALL_FAILURE);

  const [values, setValues] = useState<Values>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    setValues(emptyValues);
    let partialError = false;

    const tasks: Promise<void>[] = [];

    if (canUsers) {
      tasks.push(
        userService.getAll().then((users) => {
          setValues((previous) => ({
            ...previous,
            usersTotal: users.length,
            usersActive: users.filter((item) => item.active).length,
            usersInactive: users.filter((item) => !item.active).length,
          }));
        }).catch(() => { partialError = true; }),
      );
    }

    if (canAssets) {
      tasks.push(
        bienApiService.getAll().then((assets) => {
          setValues((previous) => ({
            ...previous,
            assetsTotal: assets.length,
            assetsAvailable: assets.filter((item) => item.assetStatus === "AVAILABLE").length,
            assetsMaintenance: assets.filter((item) => item.assetStatus === "UNDER_MAINTENANCE").length,
          }));
        }).catch(() => { partialError = true; }),
      );
    }

    if (canStock) {
      tasks.push(
        stockService.getArticles().then((articles) => {
          setValues((previous) => ({
            ...previous,
            stockArticles: articles.length,
            stockQuantity: articles.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
            stockLow: articles.filter((item) => item.quantity <= item.minimumQuantity).length,
          }));
        }).catch(() => { partialError = true; }),
      );
    }

    if (canLighting) {
      tasks.push(
        lightingService.getLights().then((lights) => {
          setValues((previous) => ({
            ...previous,
            lightsTotal: lights.length,
            lightsOperational: lights.filter((item) => item.status === "ACTIVE").length,
            lightsIssue: lights.filter((item) => item.status === "DAMAGED" || item.status === "UNDER_MAINTENANCE").length,
          }));
        }).catch(() => { partialError = true; }),
      );
    }

    if (canFailures) {
      tasks.push(
        lightingService.getFailures().then((failures) => {
          setValues((previous) => ({
            ...previous,
            failuresOpen: failures.filter((item) => item.status !== "RESOLVED").length,
          }));
        }).catch(() => { partialError = true; }),
      );
    }

    await Promise.all(tasks);
    if (partialError) {
      setError(isArabic
        ? "تعذر تحميل بعض بيانات لوحة القيادة."
        : "Certaines données du tableau de bord n'ont pas pu être chargées.");
    }
    setLoading(false);
  }, [canAssets, canFailures, canLighting, canStock, canUsers, isArabic]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const displayedName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const greeting = isArabic
    ? (displayedName ? `مرحباً ${displayedName}` : "مرحباً")
    : (displayedName ? `Bonjour ${displayedName}` : "Bonjour");

  const cards = useMemo(() => [
    { id: "users-total", label: isArabic ? "المستخدمون" : "Utilisateurs", description: isArabic ? "إجمالي الحسابات" : "Comptes enregistrés", value: values.usersTotal, icon: Users, visible: canUsers },
    { id: "users-active", label: isArabic ? "الحسابات النشطة" : "Utilisateurs actifs", description: isArabic ? "حسابات مفعلة" : "Comptes actifs", value: values.usersActive, icon: CircleCheckBig, visible: canUsers },
    { id: "assets-total", label: isArabic ? "الممتلكات" : "Biens", description: isArabic ? "إجمالي الممتلكات" : "Patrimoine enregistré", value: values.assetsTotal, icon: Building2, visible: canAssets },
    { id: "assets-available", label: isArabic ? "الممتلكات المتاحة" : "Biens disponibles", description: isArabic ? "جاهزة للاستعمال" : "Disponibles", value: values.assetsAvailable, icon: CircleCheckBig, visible: canAssets },
    { id: "stock-articles", label: isArabic ? "مواد المخزون" : "Articles stock", description: isArabic ? "عدد المراجع" : "Références en stock", value: values.stockArticles, icon: Boxes, visible: canStock },
    { id: "stock-quantity", label: isArabic ? "الكمية الإجمالية" : "Quantité totale", description: isArabic ? "مجموع الوحدات" : "Toutes unités confondues", value: values.stockQuantity, icon: PackageSearch, visible: canStock },
    { id: "lights-total", label: isArabic ? "نقاط الإنارة" : "Points lumineux", description: isArabic ? "إجمالي النقاط" : "Équipements suivis", value: values.lightsTotal, icon: Lightbulb, visible: canLighting },
    { id: "lights-active", label: isArabic ? "الإنارة المشتغلة" : "Points opérationnels", description: isArabic ? "في حالة جيدة" : "Fonctionnement normal", value: values.lightsOperational, icon: CircleCheckBig, visible: canLighting },
  ].filter((item) => item.visible), [canAssets, canLighting, canStock, canUsers, isArabic, values]);

  const alerts = useMemo(() => [
    { id: "assets-maintenance", label: isArabic ? "ممتلكات قيد الصيانة" : "Biens en maintenance", value: values.assetsMaintenance, icon: Wrench, visible: canAssets, classes: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/20 dark:text-orange-300" },
    { id: "stock-low", label: isArabic ? "مخزون منخفض" : "Stock faible", value: values.stockLow, icon: AlertTriangle, visible: canStock, classes: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300" },
    { id: "lighting-issue", label: isArabic ? "إنارة معطلة / صيانة" : "Éclairage en panne / maintenance", value: values.lightsIssue, icon: Wrench, visible: canLighting, classes: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/20 dark:text-orange-300" },
    { id: "failures-open", label: isArabic ? "الأعطاب المفتوحة" : "Pannes ouvertes", value: values.failuresOpen, icon: AlertTriangle, visible: canFailures, classes: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300" },
  ].filter((item) => item.visible), [canAssets, canFailures, canLighting, canStock, isArabic, values]);

  const hasModule = canUsers || canAssets || canStock || canLighting;

  return (
    <section className="space-y-6">
      <div className="moroccan-pattern relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 sm:p-7">
        <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">SGPBSE</p>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">{greeting}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              {isArabic ? "إحصائيات حقيقية حسب الوحدات المسموح لك بالوصول إليها." : t("dashboard.description", { defaultValue: "Statistiques réelles des modules auxquels votre rôle a accès." })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-orange-100 bg-white/80 px-5 py-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{isArabic ? "متصل بصفة" : "Connecté en tant que"}</p>
              <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">{user?.role.name ?? "-"}</p>
            </div>
            {hasModule && (
              <button type="button" onClick={() => void loadDashboard()} disabled={loading} title={isArabic ? "تحديث" : "Actualiser"} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">{error}</div>}

      {cards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-orange-500/40">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.label}</p><p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{loading && card.value === null ? "..." : card.value ?? "—"}</p><p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{card.description}</p></div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition-all group-hover:bg-orange-600 group-hover:text-white dark:bg-orange-500/15 dark:text-orange-400"><Icon size={23} /></div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {alerts.map((item) => { const Icon = item.icon; return <article key={item.id} className={`rounded-2xl border p-5 transition ${item.classes}`}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">{item.label}</p><p className="mt-2 text-3xl font-extrabold">{loading && item.value === null ? "..." : item.value ?? "—"}</p></div><Icon size={25} /></div></article>; })}
        </div>
      )}

      {!hasModule && !loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-700"><PackageSearch size={26} /></div>
          <h2 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">{isArabic ? "لوحة القيادة" : "Tableau de bord"}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">{isArabic ? "لا توجد وحدات متاحة لهذا الحساب." : "Votre rôle ne possède actuellement aucun accès de consultation aux modules métier."}</p>
        </div>
      )}
    </section>
  );
}

export default DashboardPage;

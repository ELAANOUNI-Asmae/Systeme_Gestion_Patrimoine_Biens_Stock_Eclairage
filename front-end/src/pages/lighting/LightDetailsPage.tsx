import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Gauge,
  MapPin,
  Navigation,
  Pencil,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PermissionGuard from "../../components/common/PermissionGuard";
import { PERMISSIONS } from "../../constants/permissions";
import { ROUTES } from "../../constants/routes";
import { lightingService } from "../../services/lightingService";
import type {
  Light,
  LightStatus,
} from "../../types/lighting";

const statusClasses: Record<LightStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-slate-100 text-slate-700",
  DAMAGED: "bg-red-100 text-red-700",
  UNDER_MAINTENANCE: "bg-orange-100 text-orange-700",
};

function LightDetailsPage() {
  const { id } = useParams();
  const lightId = Number(id);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [light, setLight] = useState<Light | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLight(await lightingService.getLightById(lightId));
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : tr("Point introuvable.", "نقطة الإنارة غير موجودة."),
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [lightId]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        {tr("Chargement...", "جارٍ التحميل...")}
      </div>
    );
  }

  if (!light) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  const info = [
    { icon: Tag, label: tr("Référence", "المرجع"), value: light.reference },
    { icon: MapPin, label: tr("Localisation", "الموقع"), value: light.localisation },
    { icon: Gauge, label: tr("Puissance", "القدرة"), value: `${light.power} W` },
    {
      icon: CalendarDays,
      label: tr("Date d’installation", "تاريخ التركيب"),
      value: light.installationDate,
    },
    {
      icon: Navigation,
      label: tr("Coordonnées GPS", "الإحداثيات"),
      value: `${light.latitude}, ${light.longitude}`,
    },
  ];

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to={ROUTES.LIGHTING}
            className="inline-flex items-center gap-2 text-sm text-slate-600"
          >
            <ArrowLeft size={18} className={isArabic ? "rotate-180" : ""} />
            {tr("Retour à l’éclairage", "العودة إلى الإنارة")}
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            {isArabic ? light.designationAr : light.designation}
          </h1>

          <span
            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[light.status]}`}
          >
            {t(`lighting.statuses.${light.status}`)}
          </span>
        </div>

        <PermissionGuard permission={PERMISSIONS.UPDATE_LIGHT}>
          <Link
            to={`/eclairage/${light.id}/modifier`}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 font-semibold text-white"
          >
            <Pencil size={17} />
            {tr("Modifier", "تعديل")}
          </Link>
        </PermissionGuard>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-bold">
          {tr("Informations du point lumineux", "معلومات نقطة الإنارة")}
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {info.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                <Icon size={15} />
                {label}
              </div>
              <p className="mt-2 font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <FileText size={19} />
          {tr("Documents associés", "الوثائق المرتبطة")}
        </h2>

        {light.documents.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            {tr("Aucun document.", "لا توجد وثائق.")}
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {light.documents.map((document) => (
              <button
                type="button"
                key={document.id}
                onClick={() => {
                  if (document.file) {
                    window.open(URL.createObjectURL(document.file), "_blank");
                  }
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-start hover:border-orange-300 dark:border-slate-700"
              >
                <FileText size={18} className="text-orange-600" />
                <div>
                  <p className="font-semibold">{document.name}</p>
                  <p className="text-xs text-slate-500">{document.fileName}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default LightDetailsPage;

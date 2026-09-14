import {
  MapPin,
  Search,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";

import DocumentManager from "../documents/DocumentManager";
import type { AppDocument } from "../../types/document";
import type {
  Failure,
  Light,
  Technician,
} from "../../types/lighting";

export type InterventionData = {
  technicianId: number;
  interventionDate: string;
  description: string;
  documents?: AppDocument[];
};

type Props = {
  open: boolean;
  failure: Failure | null;
  light: Light | null;
  technicians: Technician[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: InterventionData) => Promise<void> | void;
};

const radians = (value: number) => (value * Math.PI) / 180;

const distanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) *
      Math.cos(radians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

function InterventionModal({
  open,
  failure,
  light,
  technicians,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const [search, setSearch] = useState("");
  const [technicianId, setTechnicianId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setSearch("");
      setTechnicianId(null);
      setDate(new Date().toISOString().slice(0, 10));
      setDescription("");
      setDocuments([]);
      setError("");
    }
  }, [open]);

  const ordered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return technicians
      .filter((technician) =>
        !query ||
        technician.name.toLowerCase().includes(query) ||
        technician.nameAr.toLowerCase().includes(query) ||
        technician.phone.toLowerCase().includes(query) ||
        technician.localisation.toLowerCase().includes(query),
      )
      .map((technician) => ({
        technician,
        distance: light
          ? distanceKm(
              light.latitude,
              light.longitude,
              technician.latitude,
              technician.longitude,
            )
          : Number.POSITIVE_INFINITY,
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [technicians, search, light]);

  if (!open || !failure) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (technicianId == null) {
      setError(tr("Sélectionnez un technicien.", "اختر تقنياً."));
      return;
    }
    if (!date) {
      setError(tr("Sélectionnez une date.", "اختر تاريخاً."));
      return;
    }
    if (!description.trim()) {
      setError(
        tr(
          "Décrivez les travaux à effectuer.",
          "اكتب وصف الأشغال المراد تنفيذها.",
        ),
      );
      return;
    }

    setError("");
    await onSubmit({
      technicianId,
      interventionDate: date,
      description: description.trim(),
      documents,
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold">
              {tr("Planifier une intervention", "برمجة تدخل")}
            </h2>
            <p className="text-sm text-slate-500">
              {failure.lightReference} ·{" "}
              {isArabic ? failure.lightDesignationAr : failure.lightDesignation}
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-lg p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section>
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <UserRound size={18} />
              {tr("Choisir le technicien", "اختيار التقني")}
            </h3>

            <div className="relative">
              <Search size={17} className="absolute start-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={tr(
                  "Rechercher par nom, téléphone ou localisation",
                  "البحث بالاسم أو الهاتف أو الموقع",
                )}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-3 dark:border-slate-600 dark:bg-slate-900"
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {tr(
                "Les techniciens les plus proches sont proposés en premier.",
                "يتم اقتراح أقرب التقنيين أولاً.",
              )}
            </p>

            <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto md:grid-cols-2">
              {ordered.map(({ technician, distance }, index) => (
                <button
                  type="button"
                  key={technician.id}
                  onClick={() => setTechnicianId(technician.id)}
                  className={[
                    "rounded-xl border p-3 text-start",
                    technician.id === technicianId
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                      : "border-slate-200 dark:border-slate-700",
                  ].join(" ")}
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {isArabic ? technician.nameAr : technician.name}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={13} />
                        {technician.localisation}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {technician.phone}
                      </p>
                    </div>
                    <div className="text-end">
                      {index < 2 && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">
                          {tr("Proche", "قريب")}
                        </span>
                      )}
                      {Number.isFinite(distance) && (
                        <p className="mt-2 text-xs font-semibold text-orange-600">
                          {distance.toFixed(1)} km
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <label className="block text-sm font-medium">
            {tr("Date prévue", "التاريخ المبرمج")} *
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </label>

          <label className="block text-sm font-medium">
            {tr("Travaux à effectuer", "الأشغال المراد تنفيذها")} *
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </label>

          <DocumentManager documents={documents} onChange={setDocuments} />

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-4 py-2.5"
            >
              {tr("Annuler", "إلغاء")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white"
            >
              <Wrench size={18} />
              {tr("Planifier", "برمجة")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InterventionModal;

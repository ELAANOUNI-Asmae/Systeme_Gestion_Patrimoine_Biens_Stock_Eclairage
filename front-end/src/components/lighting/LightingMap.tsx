import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "leaflet/dist/leaflet.css";

import type {
  Light,
  LightStatus,
} from "../../types/lighting";

type Props = {
  lights: Light[];
};

const colors: Record<LightStatus, string> = {
  ACTIVE: "#16a34a",
  INACTIVE: "#64748b",
  DAMAGED: "#dc2626",
  UNDER_MAINTENANCE: "#ea580c",
};

const iconFor = (status: LightStatus) =>
  L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:9999px;background:${colors[status]};border:3px solid white;box-shadow:0 2px 8px rgba(15,23,42,.35)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });

function LightingMap({ lights }: Props) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const tr = (fr: string, ar: string) => (isArabic ? ar : fr);

  const center: [number, number] =
    lights.length > 0
      ? [lights[0].latitude, lights[0].longitude]
      : [30.4208, -9.5981];

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 p-5 dark:border-slate-700">
        <h2 className="text-lg font-bold">
          {tr("Carte des points lumineux", "خريطة نقاط الإنارة")}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {tr(
            "Visualisez la localisation et l’état des points.",
            "اعرض مواقع وحالة نقاط الإنارة.",
          )}
        </p>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="h-[520px] w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {lights.map((light) => (
          <Marker
            key={light.id}
            position={[light.latitude, light.longitude]}
            icon={iconFor(light.status)}
          >
            <Popup>
              <div className="min-w-52">
                <p className="font-bold">
                  {isArabic ? light.designationAr : light.designation}
                </p>
                <p className="text-xs text-slate-500">{light.reference}</p>
                <p className="mt-2 text-sm">{light.localisation}</p>
                <p className="mt-1 text-sm">
                  {tr("Puissance", "القدرة")}: {light.power} W
                </p>
                <p className="mt-1 text-sm">
                  {tr("Statut", "الحالة")}:{" "}
                  {t(`lighting.statuses.${light.status}`)}
                </p>
                <Link
                  to={`/eclairage/${light.id}`}
                  className="mt-3 inline-block font-semibold text-orange-600"
                >
                  {tr("Voir les détails", "عرض التفاصيل")}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </article>
  );
}

export default LightingMap;

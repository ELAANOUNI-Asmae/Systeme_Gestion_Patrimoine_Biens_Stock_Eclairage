import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";

import L from "leaflet";

import {
  useTranslation,
} from "react-i18next";

import {
  Link,
} from "react-router-dom";

import "leaflet/dist/leaflet.css";

import type {
  Light,
  LightStatus,
} from "../../types/lighting";

type LightingMapProps = {
  lights: Light[];
};

const markerColors: Record<
  LightStatus,
  string
> = {
  ACTIVE: "#16a34a",
  INACTIVE: "#64748b",
  DAMAGED: "#dc2626",
  UNDER_MAINTENANCE: "#ea580c",
};

const createMarkerIcon = (
  status: LightStatus,
) =>
  L.divIcon({
    className: "",

    html: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        background: ${markerColors[status]};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.35);
      "></div>
    `,

    iconSize: [
      22,
      22,
    ],

    iconAnchor: [
      11,
      11,
    ],

    popupAnchor: [
      0,
      -12,
    ],
  });

function LightingMap({
  lights,
}: LightingMapProps) {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language.startsWith(
      "ar",
    );

  const center:
    [number, number] =
    lights.length > 0
      ? [
          lights[0].latitude,
          lights[0].longitude,
        ]
      : [
          30.4208,
          -9.5981,
        ];

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 p-5 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {t(
            "lighting.map.title",
          )}
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t(
            "lighting.map.description",
          )}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-600" />

            {t(
              "lighting.statuses.ACTIVE",
            )}
          </span>

          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-600" />

            {t(
              "lighting.statuses.DAMAGED",
            )}
          </span>

          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-600" />

            {t(
              "lighting.statuses.UNDER_MAINTENANCE",
            )}
          </span>

          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-500" />

            {t(
              "lighting.statuses.INACTIVE",
            )}
          </span>
        </div>
      </div>

      <div className="h-130 w-full">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {lights.map(
            (light) => {
              const designation =
                isArabic
                  ? light.designationAr
                  : light.designation;

              const zone =
                isArabic
                  ? light.zoneAr
                  : light.zone;

              const address =
                isArabic
                  ? light.addressAr
                  : light.address;

              return (
                <Marker
                  key={
                    light.id
                  }
                  position={[
                    light.latitude,
                    light.longitude,
                  ]}
                  icon={createMarkerIcon(
                    light.status,
                  )}
                >
                  <Popup>
                    <div
                      className="min-w-48"
                      dir={
                        isArabic
                          ? "rtl"
                          : "ltr"
                      }
                    >
                      <p className="font-bold">
                        {designation}
                      </p>

                      <p
                        className="mt-1 text-xs"
                        dir="ltr"
                      >
                        {
                          light.reference
                        }
                      </p>

                      <p className="mt-2 text-sm">
                        {zone}
                      </p>

                      <p className="mt-1 text-sm">
                        {address}
                      </p>

                      <p className="mt-2 text-sm">
                        <strong>
                          {t(
                            "lighting.map.status",
                          )}
                          :
                        </strong>{" "}
                        {t(
                          `lighting.statuses.${light.status}`,
                        )}
                      </p>

                      <p className="mt-1 text-sm">
                        <strong>
                          {t(
                            "lighting.map.power",
                          )}
                          :
                        </strong>{" "}
                        {
                          light.power
                        }{" "}
                        W
                      </p>

                      <Link
                        to={`/eclairage/${light.id}`}
                        className="mt-3 inline-block font-semibold text-orange-600 hover:text-orange-700"
                      >
                        {t(
                          "lighting.map.details",
                        )}
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            },
          )}
        </MapContainer>
      </div>
    </article>
  );
}

export default LightingMap;
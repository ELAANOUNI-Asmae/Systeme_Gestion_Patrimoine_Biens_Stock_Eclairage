import {
  CheckCircle2,
  Crosshair,
  Globe2,
  Lightbulb,
  LocateFixed,
  LogIn,
  MapPin,
  Send,
} from "lucide-react";
import L from "leaflet";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "leaflet/dist/leaflet.css";

import { ROUTES } from "../../constants/routes";
import { lightingService } from "../../services/lightingService";
import type {
  Failure,
  Light,
} from "../../types/lighting";

type LocationMode =
  | "TEXT"
  | "MAP";

type MapPosition = {
  latitude: number;
  longitude: number;
};

const DEFAULT_CENTER: [number, number] = [
  30.4208,
  -9.5981,
];

const markerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 24px;
      height: 24px;
      border-radius: 9999px;
      background: #ea580c;
      border: 4px solid white;
      box-shadow: 0 4px 14px rgba(15, 23, 42, .35);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const normalizeText = (
  value: string,
) =>
  value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLocaleLowerCase()
    .replace(
      /[^\p{L}\p{N}]+/gu,
      " ",
    )
    .trim();

const textMatchScore = (
  query: string,
  value: string,
) => {
  const normalizedQuery =
    normalizeText(query);

  const normalizedValue =
    normalizeText(value);

  if (
    !normalizedQuery ||
    !normalizedValue
  ) {
    return 0;
  }

  if (
    normalizedQuery ===
    normalizedValue
  ) {
    return 100;
  }

  if (
    normalizedValue.includes(
      normalizedQuery,
    )
  ) {
    return 85;
  }

  if (
    normalizedQuery.includes(
      normalizedValue,
    )
  ) {
    return 70;
  }

  const queryTokens =
    normalizedQuery
      .split(" ")
      .filter(Boolean);

  const valueTokens =
    new Set(
      normalizedValue
        .split(" ")
        .filter(Boolean),
    );

  if (
    queryTokens.length === 0
  ) {
    return 0;
  }

  const matchedTokens =
    queryTokens.filter(
      (token) =>
        valueTokens.has(token),
    ).length;

  return Math.round(
    (matchedTokens /
      queryTokens.length) *
      60,
  );
};

const resolveLightByText = (
  localisation: string,
  lights: Light[],
) => {
  const ranked =
    lights
      .map(
        (light) => ({
          light,
          score:
            textMatchScore(
              localisation,
              light.localisation,
            ),
        }),
      )
      .sort(
        (first, second) =>
          second.score -
          first.score,
      );

  const best =
    ranked[0];

  if (
    !best ||
    best.score < 45
  ) {
    return null;
  }

  return best.light;
};

const distanceInKm = (
  firstLatitude: number,
  firstLongitude: number,
  secondLatitude: number,
  secondLongitude: number,
) => {
  const earthRadius = 6371;

  const toRadians = (
    value: number,
  ) =>
    (value * Math.PI) /
    180;

  const latitudeDelta =
    toRadians(
      secondLatitude -
        firstLatitude,
    );

  const longitudeDelta =
    toRadians(
      secondLongitude -
        firstLongitude,
    );

  const firstLatitudeRad =
    toRadians(
      firstLatitude,
    );

  const secondLatitudeRad =
    toRadians(
      secondLatitude,
    );

  const a =
    Math.sin(
      latitudeDelta / 2,
    ) ** 2 +
    Math.cos(
      firstLatitudeRad,
    ) *
      Math.cos(
        secondLatitudeRad,
      ) *
      Math.sin(
        longitudeDelta / 2,
      ) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return earthRadius * c;
};

const resolveNearestLight = (
  position: MapPosition,
  lights: Light[],
) => {
  if (
    lights.length === 0
  ) {
    return null;
  }

  return [
    ...lights,
  ].sort(
    (
      first,
      second,
    ) =>
      distanceInKm(
        position.latitude,
        position.longitude,
        first.latitude,
        first.longitude,
      ) -
      distanceInKm(
        position.latitude,
        position.longitude,
        second.latitude,
        second.longitude,
      ),
  )[0];
};

function MapClickHandler({
  onSelect,
}: {
  onSelect: (
    position: MapPosition,
  ) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude:
          event.latlng.lat,
        longitude:
          event.latlng.lng,
      });
    },
  });

  return null;
}

function MapCenterController({
  position,
}: {
  position: MapPosition | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.flyTo(
      [
        position.latitude,
        position.longitude,
      ],
      Math.max(
        map.getZoom(),
        16,
      ),
      {
        animate: true,
        duration: 0.6,
      },
    );
  }, [
    map,
    position,
  ]);

  return null;
}

function PublicFailureReportPage() {
  const {
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
    isArabic
      ? ar
      : fr;

  const [
    lights,
    setLights,
  ] = useState<Light[]>([]);

  const [
    failures,
    setFailures,
  ] = useState<Failure[]>([]);

  const [
    mode,
    setMode,
  ] =
    useState<LocationMode>(
      "TEXT",
    );

  const [
    localisation,
    setLocalisation,
  ] = useState("");

  const [
    mapPosition,
    setMapPosition,
  ] =
    useState<MapPosition | null>(
      null,
    );

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    createdFailure,
    setCreatedFailure,
  ] =
    useState<Failure | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    locating,
    setLocating,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    submittedLocationLabel,
    setSubmittedLocationLabel,
  ] = useState("");

  const loadData =
    async () => {
      try {
        setLoading(true);
        setError("");

        const [
          lightData,
          failureData,
        ] =
          await Promise.all([
            lightingService.getLights(),
            lightingService.getFailures(),
          ]);

        setLights(
          lightData,
        );

        setFailures(
          failureData,
        );
      } catch {
        setError(
          tr(
            "Le service de signalement est temporairement indisponible.",
            "خدمة التبليغ غير متاحة مؤقتاً.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadData();
    // The public page keeps its own bilingual copy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unresolvedLightIds =
    useMemo(
      () =>
        new Set(
          failures
            .filter(
              (failure) =>
                failure.status !==
                "RESOLVED",
            )
            .map(
              (failure) =>
                failure.lightId,
            ),
        ),
      [failures],
    );

  const textResolvedLight =
    useMemo(
      () =>
        resolveLightByText(
          localisation,
          lights,
        ),
      [
        localisation,
        lights,
      ],
    );

  const mapResolvedLight =
    useMemo(
      () =>
        mapPosition
          ? resolveNearestLight(
              mapPosition,
              lights,
            )
          : null,
      [
        mapPosition,
        lights,
      ],
    );

  const selectedLight =
    mode === "TEXT"
      ? textResolvedLight
      : mapResolvedLight;

  const displayedMapCenter:
    [number, number] =
    mapPosition
      ? [
          mapPosition.latitude,
          mapPosition.longitude,
        ]
      : DEFAULT_CENTER;

  const changeLanguage =
    async (
      language:
        | "fr"
        | "ar",
    ) => {
      await i18n.changeLanguage(
        language,
      );
    };

  const useCurrentPosition =
    () => {
      if (
        !navigator.geolocation
      ) {
        setError(
          tr(
            "La géolocalisation n’est pas disponible sur ce navigateur.",
            "تحديد الموقع غير متاح في هذا المتصفح.",
          ),
        );

        return;
      }

      setLocating(true);
      setError("");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapPosition({
            latitude:
              position.coords
                .latitude,
            longitude:
              position.coords
                .longitude,
          });

          setLocating(false);
        },
        () => {
          setError(
            tr(
              "Impossible de récupérer votre position. Vous pouvez cliquer directement sur la carte.",
              "تعذر تحديد موقعك. يمكنك اختيار المكان مباشرة من الخريطة.",
            ),
          );

          setLocating(false);
        },
        {
          enableHighAccuracy:
            true,
          timeout: 10000,
        },
      );
    };

  const resetForm =
    () => {
      setMode("TEXT");
      setLocalisation("");
      setMapPosition(null);
      setDescription("");
      setCreatedFailure(
        null,
      );
      setSubmittedLocationLabel(
        "",
      );
      setError("");

      void loadData();
    };

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        mode === "TEXT" &&
        !localisation.trim()
      ) {
        setError(
          tr(
            "Veuillez saisir la localisation de la panne.",
            "يرجى إدخال موقع العطب.",
          ),
        );

        return;
      }

      if (
        mode === "MAP" &&
        !mapPosition
      ) {
        setError(
          tr(
            "Veuillez choisir l’endroit de la panne sur la carte.",
            "يرجى اختيار مكان العطب على الخريطة.",
          ),
        );

        return;
      }

      if (
        !selectedLight
      ) {
        setError(
          mode === "TEXT"
            ? tr(
                "Cette localisation n’a pas pu être reconnue automatiquement. Choisissez l’endroit sur la carte.",
                "تعذر التعرف على هذا الموقع تلقائياً. يرجى اختيار المكان على الخريطة.",
              )
            : tr(
                "Aucun point d’éclairage n’a pu être associé à cette position.",
                "تعذر ربط هذا الموقع بنقطة إنارة.",
              ),
        );

        return;
      }

      if (
        unresolvedLightIds.has(
          selectedLight.id,
        )
      ) {
        setError(
          tr(
            "Une panne est déjà signalée dans cette localisation et elle est en cours de traitement.",
            "تم التبليغ مسبقاً عن عطب في هذا الموقع وهو قيد المعالجة.",
          ),
        );

        return;
      }

      if (
        !description.trim()
      ) {
        setError(
          tr(
            "Veuillez décrire la panne constatée.",
            "يرجى وصف العطب الذي تمت ملاحظته.",
          ),
        );

        return;
      }

      try {
        setSubmitting(true);
        setError("");

        const failure =
          await lightingService.createFailure(
            {
              lightId:
                selectedLight.id,
              description:
                description.trim(),
              reportedBy:
                "PUBLIC",
              documents: [],
            },
          );

        setCreatedFailure(
          failure,
        );

        setFailures(
          (previous) => [
            failure,
            ...previous,
          ],
        );

        setSubmittedLocationLabel(
          mode === "TEXT"
            ? localisation.trim()
            : mapPosition
              ? `${mapPosition.latitude.toFixed(
                  5,
                )}, ${mapPosition.longitude.toFixed(
                  5,
                )}`
              : "",
        );
      } catch {
        setError(
          tr(
            "Le signalement n’a pas pu être envoyé. Veuillez réessayer.",
            "تعذر إرسال التبليغ. يرجى المحاولة من جديد.",
          ),
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <main
      dir={
        isArabic
          ? "rtl"
          : "ltr"
      }
      className="min-h-screen bg-slate-100 text-slate-900"
    >
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-sm">
              <Lightbulb
                size={23}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-tight text-slate-950 sm:text-lg">
                SGPBSE
              </p>

              <p className="hidden text-xs text-slate-500 sm:block">
                {tr(
                  "Éclairage public",
                  "الإنارة العمومية",
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
              <Globe2
                size={16}
                className="mx-1 text-slate-500"
              />

              <button
                type="button"
                onClick={() => {
                  void changeLanguage(
                    "fr",
                  );
                }}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                  !isArabic
                    ? "bg-white text-orange-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                FR
              </button>

              <button
                type="button"
                onClick={() => {
                  void changeLanguage(
                    "ar",
                  );
                }}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                  isArabic
                    ? "bg-white text-orange-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                AR
              </button>
            </div>

            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
            >
              <LogIn
                size={17}
              />

              <span className="hidden sm:inline">
                {tr(
                  "Connexion",
                  "تسجيل الدخول",
                )}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-6 text-white shadow-xl sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-orange-100">
              <MapPin
                size={15}
              />

              {tr(
                "Accès public · aucun compte requis",
                "ولوج عمومي · لا يتطلب حساباً",
              )}
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              {tr(
                "Signaler une panne d’éclairage public",
                "التبليغ عن عطب في الإنارة العمومية",
              )}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              {tr(
                "Indiquez simplement où se trouve la panne puis décrivez le problème. Vous n’avez pas besoin de connaître la référence du point lumineux.",
                "حدد فقط مكان العطب ثم صف المشكلة. لا تحتاج إلى معرفة مرجع نقطة الإنارة.",
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {createdFailure ? (
              <div className="flex min-h-[470px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle2
                    size={42}
                  />
                </div>

                <h2 className="mt-6 text-2xl font-black text-slate-950">
                  {tr(
                    "Signalement envoyé",
                    "تم إرسال التبليغ",
                  )}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  {tr(
                    "Merci. Votre signalement a été enregistré et sera transmis au service concerné.",
                    "شكراً. تم تسجيل تبليغك وسيتم توجيهه إلى المصلحة المعنية.",
                  )}
                </p>

                <div className="mt-6 w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-4 text-start">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {tr(
                      "Numéro du signalement",
                      "رقم التبليغ",
                    )}
                  </p>

                  <p className="mt-1 text-lg font-black text-slate-900">
                    P-
                    {
                      createdFailure.id
                    }
                  </p>

                  {submittedLocationLabel && (
                    <>
                      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                        {tr(
                          "Localisation fournie",
                          "الموقع المقدم",
                        )}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {
                          submittedLocationLabel
                        }
                      </p>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
                >
                  {tr(
                    "Signaler une autre panne",
                    "التبليغ عن عطب آخر",
                  )}
                </button>
              </div>
            ) : (
              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-7"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                      <LocateFixed
                        size={20}
                      />
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-slate-950">
                        {tr(
                          "1. Localiser la panne",
                          "1. تحديد مكان العطب",
                        )}
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {tr(
                          "Écrivez la localisation ou choisissez directement l’endroit sur la carte.",
                          "اكتب الموقع أو اختر المكان مباشرة على الخريطة.",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode(
                          "TEXT",
                        );
                        setError("");
                      }}
                      className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                        mode ===
                        "TEXT"
                          ? "bg-white text-orange-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tr(
                        "Écrire la localisation",
                        "كتابة الموقع",
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode(
                          "MAP",
                        );
                        setError("");
                      }}
                      className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                        mode ===
                        "MAP"
                          ? "bg-white text-orange-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tr(
                        "Choisir sur la carte",
                        "الاختيار من الخريطة",
                      )}
                    </button>
                  </div>

                  {mode ===
                  "TEXT" ? (
                    <div className="mt-5">
                      <label className="block text-sm font-bold text-slate-700">
                        {tr(
                          "Localisation",
                          "الموقع",
                        )}{" "}
                        *

                        <div className="relative mt-2">
                          <MapPin
                            size={18}
                            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            value={
                              localisation
                            }
                            onChange={(
                              event,
                            ) => {
                              setLocalisation(
                                event
                                  .target
                                  .value,
                              );
                              setError(
                                "",
                              );
                            }}
                            placeholder={tr(
                              "Ex. Hay Mohammadi, avenue..., quartier...",
                              "مثال: الحي المحمدي، شارع...، حي...",
                            )}
                            className="h-12 w-full rounded-xl border border-slate-300 bg-white ps-10 pe-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                          />
                        </div>
                      </label>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        {tr(
                          "Le système identifiera le point d’éclairage correspondant sans afficher la liste des points au public.",
                          "سيحدد النظام نقطة الإنارة المناسبة دون عرض قائمة نقاط الإنارة للعموم.",
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-700">
                          {tr(
                            "Cliquez sur la carte à l’endroit de la panne",
                            "اضغط على الخريطة في مكان العطب",
                          )}
                        </p>

                        <button
                          type="button"
                          disabled={
                            locating
                          }
                          onClick={
                            useCurrentPosition
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-orange-300 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Crosshair
                            size={16}
                          />

                          {locating
                            ? tr(
                                "Localisation...",
                                "جارٍ تحديد الموقع...",
                              )
                            : tr(
                                "Utiliser ma position",
                                "استخدام موقعي",
                              )}
                        </button>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <MapContainer
                          center={
                            displayedMapCenter
                          }
                          zoom={14}
                          scrollWheelZoom
                          className="h-[360px] w-full"
                        >
                          <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />

                          <MapClickHandler
                            onSelect={(
                              position,
                            ) => {
                              setMapPosition(
                                position,
                              );
                              setError(
                                "",
                              );
                            }}
                          />

                          <MapCenterController
                            position={
                              mapPosition
                            }
                          />

                          {mapPosition && (
                            <Marker
                              position={[
                                mapPosition.latitude,
                                mapPosition.longitude,
                              ]}
                              icon={
                                markerIcon
                              }
                            />
                          )}
                        </MapContainer>
                      </div>

                      <div className="mt-3 flex min-h-8 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        <MapPin
                          size={15}
                          className="shrink-0 text-orange-600"
                        />

                        {mapPosition
                          ? tr(
                              `Position choisie : ${mapPosition.latitude.toFixed(
                                5,
                              )}, ${mapPosition.longitude.toFixed(
                                5,
                              )}`,
                              `الموقع المختار: ${mapPosition.latitude.toFixed(
                                5,
                              )}, ${mapPosition.longitude.toFixed(
                                5,
                              )}`,
                            )
                          : tr(
                              "Aucune position choisie pour le moment.",
                              "لم يتم اختيار أي موقع بعد.",
                            )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-7">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <Lightbulb
                        size={20}
                      />
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-slate-950">
                        {tr(
                          "2. Décrire la panne",
                          "2. وصف العطب",
                        )}
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {tr(
                          "Décrivez ce que vous avez constaté.",
                          "صف ما لاحظته.",
                        )}
                      </p>
                    </div>
                  </div>

                  <label className="mt-5 block text-sm font-bold text-slate-700">
                    {tr(
                      "Description",
                      "الوصف",
                    )}{" "}
                    *

                    <textarea
                      rows={5}
                      value={
                        description
                      }
                      onChange={(
                        event,
                      ) => {
                        setDescription(
                          event
                            .target
                            .value,
                        );
                        setError(
                          "",
                        );
                      }}
                      placeholder={tr(
                        "Ex. Le lampadaire ne s’allume plus, clignote, câble apparent...",
                        "مثال: المصباح لا يشتغل، يومض، سلك ظاهر...",
                      )}
                      className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                  </label>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    submitting
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send
                    size={18}
                  />

                  {submitting
                    ? tr(
                        "Envoi en cours...",
                        "جارٍ الإرسال...",
                      )
                    : tr(
                        "Envoyer le signalement",
                        "إرسال التبليغ",
                      )}
                </button>
              </form>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <MapPin
                  size={21}
                />
              </div>

              <h3 className="mt-4 font-black text-slate-950">
                {tr(
                  "Pas besoin de connaître le point lumineux",
                  "لا حاجة لمعرفة نقطة الإنارة",
                )}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {tr(
                  "Indiquez uniquement l’endroit. L’association avec le point d’éclairage est faite en interne.",
                  "حدد المكان فقط، وسيتم ربطه بنقطة الإنارة داخل النظام.",
                )}
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <CheckCircle2
                  size={21}
                />
              </div>

              <h3 className="mt-4 font-black text-slate-950">
                {tr(
                  "Signalement simple",
                  "تبليغ بسيط",
                )}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {tr(
                  "Aucune connexion et aucun document ne sont demandés.",
                  "لا يتطلب التبليغ تسجيل الدخول أو إضافة أي وثيقة.",
                )}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default PublicFailureReportPage;

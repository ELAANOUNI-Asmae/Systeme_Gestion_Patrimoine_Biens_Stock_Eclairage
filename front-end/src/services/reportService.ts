import ExcelJS from "exceljs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import reportLogo from "../assets/images/LogoSGPBSE.png";

import {
  buildMockReport,
} from "../mock/reports";

import type {
  GenerateReportParams,
  ReportData,
  ReportMetric,
  ReportSection,
  ReportType,
} from "../types/report";

const delay = (
  milliseconds = 250,
) =>
  new Promise<void>((resolve) => {
    setTimeout(
      resolve,
      milliseconds,
    );
  });

/* =========================================================
   HELPERS
========================================================= */

const escapeHtml = (
  value: unknown,
) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll(
      "'",
      "&#039;",
    );

const formatDate = (
  value: string,
  language = "fr",
) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(
      `${value}T00:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    language.startsWith("ar")
      ? "ar-MA"
      : "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
};

const formatDateTime = (
  value: string,
  language = "fr",
) => {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    language.startsWith("ar")
      ? "ar-MA"
      : "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
};

const getReportTitle = (
  type: ReportType,
  language = "fr",
) => {
  const arabic =
    language.startsWith("ar");

  const titles: Record<
    ReportType,
    {
      fr: string;
      ar: string;
    }
  > = {
    USERS: {
      fr: "Rapport des utilisateurs",
      ar: "تقرير المستخدمين",
    },

    ASSETS: {
      fr: "Rapport du patrimoine",
      ar: "تقرير الممتلكات",
    },

    STOCK: {
      fr: "Rapport du stock",
      ar: "تقرير المخزون",
    },

    LIGHTING: {
      fr: "Rapport de l'éclairage public",
      ar: "تقرير الإنارة العمومية",
    },
  };

  return arabic
    ? titles[type].ar
    : titles[type].fr;
};

/* =========================================================
   TRANSLATIONS PDF / EXCEL
========================================================= */

const getTranslations = (
  language = "fr",
) => {
  const arabic =
    language.startsWith("ar");

  if (arabic) {
    return {
      systemName:
        "نظام تدبير الممتلكات والمخزون والإنارة العمومية",

      period:
        "الفترة",

      generatedAt:
        "تاريخ إنشاء التقرير",

      generatedBy:
        "تم إنشاء التقرير بواسطة",

      page:
        "الصفحة",

      noData:
        "لا توجد بيانات خلال الفترة المحددة.",

      statistics:
        "المؤشرات الرئيسية",

      documentTitle:
        "تقرير إداري",

      copyright:
        "SGPBSE - جميع الحقوق محفوظة",

      mockNotice:
        "بيانات تجريبية - في انتظار الربط مع الخادم",
    };
  }

  return {
    systemName:
      "Système de Gestion du Patrimoine, des Biens, du Stock et de l'Éclairage",

    period:
      "Période",

    generatedAt:
      "Généré le",

    generatedBy:
      "Rapport généré par",

    page:
      "Page",

    noData:
      "Aucune donnée disponible pour la période sélectionnée.",

    statistics:
      "Indicateurs clés",

    documentTitle:
      "Rapport administratif",

    copyright:
      "SGPBSE - Tous droits réservés",

    mockNotice:
      "Données de démonstration - en attente de connexion au backend",
  };
};

const translateMetric = (
  metric: ReportMetric,
  language = "fr",
) => {
  const arabic =
    language.startsWith("ar");

  const labels: Record<
    string,
    {
      fr: string;
      ar: string;
    }
  > = {
    "reports.statistics.totalUsers": {
      fr: "Utilisateurs",
      ar: "المستخدمون",
    },

    "reports.statistics.admins": {
      fr: "Administrateurs",
      ar: "المديرون",
    },

    "reports.statistics.managers": {
      fr: "Gestionnaires",
      ar: "المسيرون",
    },

    "reports.statistics.responsables": {
      fr: "Responsables",
      ar: "المسؤولون",
    },

    "reports.statistics.totalAssets": {
      fr: "Total des biens",
      ar: "إجمالي الممتلكات",
    },

    "reports.statistics.availableAssets": {
      fr: "Disponibles",
      ar: "المتاحة",
    },

    "reports.statistics.inUseAssets": {
      fr: "En service",
      ar: "قيد الاستعمال",
    },

    "reports.statistics.assetsMaintenance": {
      fr: "En maintenance",
      ar: "قيد الصيانة",
    },

    "reports.statistics.totalValue": {
      fr: "Valeur totale",
      ar: "القيمة الإجمالية",
    },

    "reports.statistics.articles": {
      fr: "Articles",
      ar: "المواد",
    },

    "reports.statistics.totalQuantity": {
      fr: "Quantité totale",
      ar: "الكمية الإجمالية",
    },

    "reports.statistics.stockAlerts": {
      fr: "Alertes de stock",
      ar: "تنبيهات المخزون",
    },

    "reports.statistics.pendingRequests": {
      fr: "Demandes en attente",
      ar: "الطلبات المعلقة",
    },

    "reports.statistics.totalLights": {
      fr: "Points lumineux",
      ar: "نقاط الإنارة",
    },

    "reports.statistics.activeLights": {
      fr: "Actifs",
      ar: "النقاط النشطة",
    },

    "reports.statistics.damagedLights": {
      fr: "Endommagés",
      ar: "المعطلة",
    },

    "reports.statistics.maintenanceLights": {
      fr: "En maintenance",
      ar: "قيد الصيانة",
    },

    "reports.statistics.failures": {
      fr: "Pannes signalées",
      ar: "الأعطال المبلغ عنها",
    },

    "reports.statistics.interventions": {
      fr: "Interventions",
      ar: "التدخلات",
    },
  };

  const label =
    labels[metric.labelKey];

  if (!label) {
    return metric.labelKey;
  }

  return arabic
    ? label.ar
    : label.fr;
};

const translateSection = (
  key: string,
  language = "fr",
) => {
  const arabic =
    language.startsWith("ar");

  const labels: Record<
    string,
    {
      fr: string;
      ar: string;
    }
  > = {
    "reports.sections.users": {
      fr: "Liste des utilisateurs",
      ar: "قائمة المستخدمين",
    },

    "reports.sections.assets": {
      fr: "État du patrimoine",
      ar: "وضعية الممتلكات",
    },

    "reports.sections.stockState": {
      fr: "État du stock",
      ar: "وضعية المخزون",
    },

    "reports.sections.stockMovements": {
      fr: "Mouvements du stock",
      ar: "حركات المخزون",
    },

    "reports.sections.supplyRequests": {
      fr: "Demandes de fourniture",
      ar: "طلبات التزويد",
    },

    "reports.sections.lights": {
      fr: "Points lumineux",
      ar: "نقاط الإنارة",
    },

    "reports.sections.failures": {
      fr: "Pannes signalées",
      ar: "الأعطال المبلغ عنها",
    },

    "reports.sections.interventions": {
      fr: "Interventions",
      ar: "التدخلات",
    },
  };

  const label =
    labels[key];

  if (!label) {
    return key;
  }

  return arabic
    ? label.ar
    : label.fr;
};

const translateColumn = (
  key: string,
  language = "fr",
) => {
  const arabic =
    language.startsWith("ar");

  const labels: Record<
    string,
    {
      fr: string;
      ar: string;
    }
  > = {
    "reports.columns.name": {
      fr: "Nom complet",
      ar: "الاسم الكامل",
    },

    "reports.columns.email": {
      fr: "E-mail",
      ar: "البريد الإلكتروني",
    },

    "reports.columns.phone": {
      fr: "Téléphone",
      ar: "الهاتف",
    },

    "reports.columns.cin": {
      fr: "CIN",
      ar: "رقم البطاقة الوطنية",
    },

    "reports.columns.gender": {
      fr: "Genre",
      ar: "الجنس",
    },

    "reports.columns.role": {
      fr: "Rôle",
      ar: "الدور",
    },

    "reports.columns.inventory": {
      fr: "N° inventaire",
      ar: "رقم الجرد",
    },

    "reports.columns.designation": {
      fr: "Désignation",
      ar: "التسمية",
    },

    "reports.columns.type": {
      fr: "Type",
      ar: "النوع",
    },

    "reports.columns.assignment": {
      fr: "Affectation",
      ar: "التخصيص",
    },

    "reports.columns.acquisitionDate": {
      fr: "Date d'acquisition",
      ar: "تاريخ الاقتناء",
    },

    "reports.columns.value": {
      fr: "Valeur",
      ar: "القيمة",
    },

    "reports.columns.status": {
      fr: "Statut",
      ar: "الحالة",
    },

    "reports.columns.reference": {
      fr: "Référence",
      ar: "المرجع",
    },

    "reports.columns.article": {
      fr: "Article",
      ar: "المادة",
    },

    "reports.columns.category": {
      fr: "Catégorie",
      ar: "الفئة",
    },

    "reports.columns.unit": {
      fr: "Unité",
      ar: "الوحدة",
    },

    "reports.columns.quantity": {
      fr: "Quantité",
      ar: "الكمية",
    },

    "reports.columns.minimum": {
      fr: "Seuil minimum",
      ar: "الحد الأدنى",
    },

    "reports.columns.location": {
      fr: "Localisation",
      ar: "الموقع",
    },

    "reports.columns.date": {
      fr: "Date",
      ar: "التاريخ",
    },

    "reports.columns.movementType": {
      fr: "Type de mouvement",
      ar: "نوع الحركة",
    },

    "reports.columns.reason": {
      fr: "Motif",
      ar: "السبب",
    },

    "reports.columns.user": {
      fr: "Utilisateur",
      ar: "المستخدم",
    },

    "reports.columns.requestedQuantity": {
      fr: "Quantité demandée",
      ar: "الكمية المطلوبة",
    },

    "reports.columns.requester": {
      fr: "Demandeur",
      ar: "صاحب الطلب",
    },

    "reports.columns.zone": {
      fr: "Zone",
      ar: "المنطقة",
    },

    "reports.columns.address": {
      fr: "Adresse",
      ar: "العنوان",
    },

    "reports.columns.power": {
      fr: "Puissance",
      ar: "القدرة",
    },

    "reports.columns.installationDate": {
      fr: "Installation",
      ar: "تاريخ التركيب",
    },

    "reports.columns.light": {
      fr: "Point lumineux",
      ar: "نقطة الإنارة",
    },

    "reports.columns.description": {
      fr: "Description",
      ar: "الوصف",
    },

    "reports.columns.reportedAt": {
      fr: "Date de signalement",
      ar: "تاريخ التبليغ",
    },

    "reports.columns.reportedBy": {
      fr: "Signalé par",
      ar: "تم التبليغ من طرف",
    },

    "reports.columns.failure": {
      fr: "Panne / Point",
      ar: "العطل / النقطة",
    },

    "reports.columns.technician": {
      fr: "Technicien",
      ar: "التقني",
    },
  };

  const label =
    labels[key];

  if (!label) {
    return key;
  }

  return arabic
    ? label.ar
    : label.fr;
};

/* =========================================================
   DATA
========================================================= */

const generateReport = async ({
  type,
  startDate,
  endDate,
}: GenerateReportParams): Promise<ReportData> => {
  await delay();

  return buildMockReport(
    type,
    startDate,
    endDate,
  );
};

/* =========================================================
   HTML GENERATION
========================================================= */

const buildStatisticsHtml = (
  statistics: ReportMetric[],
  language: string,
) => {
  if (
    statistics.length === 0
  ) {
    return "";
  }

  return `
    <div class="statistics-grid">
      ${statistics
        .map(
          (metric) => `
            <div class="stat-card">
              <div class="stat-value">
                ${escapeHtml(metric.value)}
                ${
                  metric.unit
                    ? `<span class="stat-unit">${escapeHtml(metric.unit)}</span>`
                    : ""
                }
              </div>

              <div class="stat-label">
                ${escapeHtml(
                  translateMetric(
                    metric,
                    language,
                  ),
                )}
              </div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
};

const buildSectionHtml = (
  section: ReportSection,
  language: string,
) => {
  const texts =
    getTranslations(language);

  const header = `
    <tr>
      ${section.columns
        .map(
          (column) => `
            <th>
              ${escapeHtml(
                translateColumn(
                  column.labelKey,
                  language,
                ),
              )}
            </th>
          `,
        )
        .join("")}
    </tr>
  `;

  const body =
    section.rows.length > 0
      ? section.rows
          .map(
            (row) => `
              <tr>
                ${section.columns
                  .map(
                    (
                      column,
                    ) => `
                      <td>
                        ${escapeHtml(
                          row.values[
                            column.key
                          ] ?? "-",
                        )}
                      </td>
                    `,
                  )
                  .join("")}
              </tr>
            `,
          )
          .join("")
      : `
        <tr>
          <td
            colspan="${section.columns.length}"
            class="empty-cell"
          >
            ${escapeHtml(texts.noData)}
          </td>
        </tr>
      `;

  return `
    <section class="report-section">
      <div class="section-title-row">
        <div class="section-accent"></div>

        <h2>
          ${escapeHtml(
            translateSection(
              section.titleKey,
              language,
            ),
          )}
        </h2>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            ${header}
          </thead>

          <tbody>
            ${body}
          </tbody>
        </table>
      </div>
    </section>
  `;
};

const buildReportHtml = (
  report: ReportData,
  language = "fr",
) => {
  const arabic =
    language.startsWith("ar");

  const texts =
    getTranslations(language);

  const title =
    getReportTitle(
      report.type,
      language,
    );

  return `
    <!DOCTYPE html>

    <html
      lang="${arabic ? "ar" : "fr"}"
      dir="${arabic ? "rtl" : "ltr"}"
    >
      <head>
        <meta charset="UTF-8" />

        <title>
          ${escapeHtml(title)}
        </title>

        <style>
          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
          }

          body {
            font-family:
              Arial,
              "Segoe UI",
              sans-serif;

            background: #ffffff;
            color: #1e293b;
          }

          .document {
            width: 1120px;
            padding: 42px 46px 36px;
            background: #ffffff;
          }

          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 30px;

            padding-bottom: 22px;
            border-bottom: 4px solid #f97316;
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 18px;
          }

          .logo {
            width: 88px;
            height: 88px;
            object-fit: contain;
          }

          .brand-name {
            margin: 0;

            font-size: 28px;
            font-weight: 900;

            letter-spacing: 0.5px;
            color: #f97316;
          }

          .brand-subtitle {
            max-width: 520px;
            margin-top: 5px;

            font-size: 13px;
            line-height: 1.55;

            color: #64748b;
          }

          .document-badge {
            padding: 9px 14px;

            border: 1px solid #fed7aa;
            border-radius: 999px;

            background: #fff7ed;

            font-size: 12px;
            font-weight: 800;

            color: #c2410c;
          }

          .title-area {
            padding: 35px 0 25px;
            text-align: center;
          }

          .title-area h1 {
            margin: 0;

            font-size: 30px;
            font-weight: 900;

            color: #0f172a;
          }

          .title-line {
            width: 70px;
            height: 4px;

            margin: 13px auto 17px;

            border-radius: 999px;

            background: #f97316;
          }

          .period {
            margin: 0;

            font-size: 14px;
            font-weight: 700;

            color: #475569;
          }

          .generated {
            margin-top: 7px;

            font-size: 12px;

            color: #94a3b8;
          }

          .statistics-heading {
            margin: 7px 0 12px;

            font-size: 15px;
            font-weight: 800;

            color: #334155;
          }

          .statistics-grid {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));

            gap: 12px;

            margin-bottom: 32px;
          }

          .stat-card {
            min-height: 100px;

            padding: 18px;

            border: 1px solid #e2e8f0;
            border-radius: 13px;

            background: #f8fafc;
          }

          .stat-card:nth-child(3n + 1) {
            border-top: 3px solid #f97316;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 900;

            color: #0f172a;
          }

          .stat-unit {
            margin-inline-start: 5px;

            font-size: 13px;
            font-weight: 700;

            color: #64748b;
          }

          .stat-label {
            margin-top: 7px;

            font-size: 12px;
            font-weight: 700;

            color: #64748b;
          }

          .report-section {
            margin-top: 30px;
          }

          .section-title-row {
            display: flex;
            align-items: center;
            gap: 10px;

            margin-bottom: 12px;
          }

          .section-accent {
            width: 5px;
            height: 24px;

            border-radius: 999px;

            background: #f97316;
          }

          .section-title-row h2 {
            margin: 0;

            font-size: 18px;
            font-weight: 900;

            color: #0f172a;
          }

          .table-wrapper {
            overflow: hidden;

            border: 1px solid #e2e8f0;
            border-radius: 12px;
          }

          table {
            width: 100%;

            border-collapse: collapse;

            table-layout: fixed;

            font-size: 10px;
          }

          th {
            padding: 11px 8px;

            background: #0f172a;
            color: #ffffff;

            font-size: 9.5px;
            font-weight: 800;

            text-align:
              ${arabic ? "right" : "left"};

            word-break: break-word;
          }

          td {
            padding: 10px 8px;

            border-bottom:
              1px solid #e2e8f0;

            vertical-align: top;

            line-height: 1.4;

            text-align:
              ${arabic ? "right" : "left"};

            color: #334155;

            word-break: break-word;
          }

          tbody tr:nth-child(even) {
            background: #f8fafc;
          }

          tbody tr:last-child td {
            border-bottom: none;
          }

          .empty-cell {
            padding: 24px;

            text-align: center;

            color: #94a3b8;
          }

          .mock-notice {
            margin-top: 34px;

            padding: 10px 14px;

            border-radius: 9px;

            background: #fff7ed;

            font-size: 10px;
            text-align: center;

            color: #9a3412;
          }

          .footer {
            display: flex;
            justify-content: space-between;
            gap: 20px;

            margin-top: 25px;
            padding-top: 15px;

            border-top: 1px solid #e2e8f0;

            font-size: 10px;

            color: #94a3b8;
          }
        </style>
      </head>

      <body>
        <div class="document">
          <header class="header">
            <div class="brand">
              <img
                src="${reportLogo}"
                alt="SGPBSE"
                class="logo"
              />

              <div>
                <h2 class="brand-name">
                  SGPBSE
                </h2>

                <div class="brand-subtitle">
                  ${escapeHtml(
                    texts.systemName,
                  )}
                </div>
              </div>
            </div>

            <div class="document-badge">
              ${escapeHtml(
                texts.documentTitle,
              )}
            </div>
          </header>

          <section class="title-area">
            <h1>
              ${escapeHtml(title)}
            </h1>

            <div class="title-line"></div>

            <p class="period">
              ${escapeHtml(texts.period)}
              :
              ${escapeHtml(
                formatDate(
                  report.startDate,
                  language,
                ),
              )}
              -
              ${escapeHtml(
                formatDate(
                  report.endDate,
                  language,
                ),
              )}
            </p>

            <p class="generated">
              ${escapeHtml(
                texts.generatedAt,
              )}
              :
              ${escapeHtml(
                formatDateTime(
                  report.generatedAt,
                  language,
                ),
              )}
            </p>
          </section>

          <div class="statistics-heading">
            ${escapeHtml(
              texts.statistics,
            )}
          </div>

          ${buildStatisticsHtml(
            report.statistics,
            language,
          )}

          ${report.sections
            .map((section) =>
              buildSectionHtml(
                section,
                language,
              ),
            )
            .join("")}

          <div class="mock-notice">
            ${escapeHtml(
              texts.mockNotice,
            )}
          </div>

          <footer class="footer">
            <span>
              ${escapeHtml(
                texts.copyright,
              )}
            </span>

            <span>
              SGPBSE • v1.0.0
            </span>
          </footer>
        </div>
      </body>
    </html>
  `;
};

/* =========================================================
   PDF
========================================================= */

const exportPdf = async (
  report: ReportData,
  language = "fr",
) => {
  const html =
    buildReportHtml(
      report,
      language,
    );

  const container =
    document.createElement(
      "div",
    );

  container.style.position =
    "fixed";

  container.style.left =
    "-100000px";

  container.style.top =
    "0";

  container.style.width =
    "1120px";

  container.innerHTML = html;

  document.body.appendChild(
    container,
  );

  try {
    const images =
      Array.from(
        container.querySelectorAll(
          "img",
        ),
      );

    await Promise.all(
      images.map(
        (image) =>
          new Promise<void>(
            (resolve) => {
              if (
                image.complete
              ) {
                resolve();
                return;
              }

              image.onload = () =>
                resolve();

              image.onerror = () =>
                resolve();
            },
          ),
      ),
    );

    const documentElement =
      container.querySelector(
        ".document",
      ) as HTMLElement | null;

    if (!documentElement) {
      throw new Error(
        "Impossible de générer le document PDF.",
      );
    }

    const canvas =
      await html2canvas(
        documentElement,
        {
          scale: 2,
          useCORS: true,
          backgroundColor:
            "#ffffff",
          logging: false,
        },
      );

    const imageData =
      canvas.toDataURL(
        "image/jpeg",
        0.95,
      );

    /*
     * A4 paysage:
     * meilleur choix pour les tableaux
     * avec plusieurs colonnes.
     */
    const pdf =
      new jsPDF({
        orientation:
          "landscape",
        unit: "mm",
        format: "a4",
      });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const margin = 8;

    const printableWidth =
      pageWidth -
      margin * 2;

    const printableHeight =
      pageHeight -
      margin * 2 -
      8;

    const imageWidth =
      printableWidth;

    const imageHeight =
      (canvas.height *
        imageWidth) /
      canvas.width;

    /*
     * Conversion de la hauteur
     * d'une page PDF vers la hauteur
     * correspondante dans le canvas.
     */
    const pageCanvasHeight =
      (printableHeight *
        canvas.width) /
      imageWidth;

    let sourceY = 0;

    let pageNumber = 1;

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          canvas.height /
            pageCanvasHeight,
        ),
      );

    while (
      sourceY <
      canvas.height
    ) {
      const sliceHeight =
        Math.min(
          pageCanvasHeight,
          canvas.height -
            sourceY,
        );

      const pageCanvas =
        document.createElement(
          "canvas",
        );

      pageCanvas.width =
        canvas.width;

      pageCanvas.height =
        sliceHeight;

      const context =
        pageCanvas.getContext(
          "2d",
        );

      if (!context) {
        throw new Error(
          "Impossible de préparer une page PDF.",
        );
      }

      context.fillStyle =
        "#ffffff";

      context.fillRect(
        0,
        0,
        pageCanvas.width,
        pageCanvas.height,
      );

      context.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );

      if (pageNumber > 1) {
        pdf.addPage(
          "a4",
          "landscape",
        );
      }

      const pageImage =
        pageCanvas.toDataURL(
          "image/jpeg",
          0.95,
        );

      const renderedHeight =
        (sliceHeight *
          imageWidth) /
        canvas.width;

      pdf.addImage(
        pageImage,
        "JPEG",
        margin,
        margin,
        imageWidth,
        renderedHeight,
      );

      /*
       * Pagination
       */
      pdf.setFont(
        "helvetica",
        "normal",
      );

      pdf.setFontSize(8);

      pdf.setTextColor(
        100,
        116,
        139,
      );

      const pageLabel =
        language.startsWith(
          "ar",
        )
          ? `${pageNumber} / ${totalPages}`
          : `Page ${pageNumber} / ${totalPages}`;

      pdf.text(
        pageLabel,
        pageWidth -
          margin,
        pageHeight - 4,
        {
          align: "right",
        },
      );

      sourceY +=
        sliceHeight;

      pageNumber += 1;
    }

    const fileName =
      `SGPBSE_${report.type}_${report.startDate}_${report.endDate}.pdf`;

    pdf.save(fileName);

    /*
     * imageData n'est pas utilisé
     * directement car le document
     * est découpé page par page.
     */
    void imageData;
    void imageHeight;
  } finally {
    document.body.removeChild(
      container,
    );
  }
};

/* =========================================================
   EXCEL
========================================================= */

const exportExcel = async (
  report: ReportData,
  language = "fr",
) => {
  const workbook =
    new ExcelJS.Workbook();

  workbook.creator =
    "SGPBSE";

  workbook.created =
    new Date();

  const summary =
    workbook.addWorksheet(
      language.startsWith("ar")
        ? "ملخص"
        : "Résumé",
    );

  summary.columns = [
    {
      width: 28,
    },
    {
      width: 24,
    },
  ];

  summary.addRow([
    "SGPBSE",
  ]);

  summary.addRow([
    getReportTitle(
      report.type,
      language,
    ),
  ]);

  summary.addRow([]);

  summary.addRow([
    getTranslations(
      language,
    ).period,
    `${formatDate(
      report.startDate,
      language,
    )} - ${formatDate(
      report.endDate,
      language,
    )}`,
  ]);

  summary.addRow([
    getTranslations(
      language,
    ).generatedAt,
    formatDateTime(
      report.generatedAt,
      language,
    ),
  ]);

  summary.addRow([]);

  summary.addRow([
    getTranslations(
      language,
    ).statistics,
  ]);

  report.statistics.forEach(
    (metric) => {
      summary.addRow([
        translateMetric(
          metric,
          language,
        ),

        `${metric.value}${
          metric.unit
            ? ` ${metric.unit}`
            : ""
        }`,
      ]);
    },
  );

  summary.getRow(1).font = {
    bold: true,
    size: 20,
  };

  summary.getRow(1).font = {
    bold: true,
    size: 20,
    color: {
      argb: "FFF97316",
    },
  };

  summary.getRow(2).font = {
    bold: true,
    size: 16,
  };

  report.sections.forEach(
    (
      section,
      sectionIndex,
    ) => {
      const rawName =
        translateSection(
          section.titleKey,
          language,
        );

      /*
       * Excel limite les noms
       * des feuilles à 31 caractères.
       */
      const sheetName =
        `${sectionIndex + 1}-${rawName}`
          .replace(
            /[\\/?*[\]:]/g,
            "-",
          )
          .slice(0, 31);

      const sheet =
        workbook.addWorksheet(
          sheetName,
        );

      const headers =
        section.columns.map(
          (column) =>
            translateColumn(
              column.labelKey,
              language,
            ),
        );

      sheet.addRow(
        headers,
      );

      section.rows.forEach(
        (row) => {
          sheet.addRow(
            section.columns.map(
              (column) =>
                row.values[
                  column.key
                ] ?? "",
            ),
          );
        },
      );

      const headerRow =
        sheet.getRow(1);

      headerRow.font = {
        bold: true,
        color: {
          argb:
            "FFFFFFFF",
        },
      };

      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb:
            "FF0F172A",
        },
      };

      headerRow.alignment = {
        vertical:
          "middle",
      };

      sheet.columns.forEach(
        (column) => {
          column.width = 22;
        },
      );

      sheet.views = [
        {
          state: "frozen",
          ySplit: 1,
        },
      ];

      sheet.autoFilter = {
        from: {
          row: 1,
          column: 1,
        },

        to: {
          row: 1,
          column:
            Math.max(
              1,
              section.columns
                .length,
            ),
        },
      };
    },
  );

  const buffer =
    await workbook.xlsx.writeBuffer();

  const blob =
    new Blob(
      [buffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    );

  const url =
    URL.createObjectURL(
      blob,
    );

  const link =
    document.createElement(
      "a",
    );

  link.href = url;

  link.download =
    `SGPBSE_${report.type}_${report.startDate}_${report.endDate}.xlsx`;

  document.body.appendChild(
    link,
  );

  link.click();

  document.body.removeChild(
    link,
  );

  URL.revokeObjectURL(
    url,
  );
};

/* =========================================================
   SERVICE
========================================================= */

export const reportService = {
  async generate(
    params: GenerateReportParams,
  ): Promise<ReportData> {
    return generateReport(
      params,
    );
  },

  async exportPdf(
    report: ReportData,
    language = "fr",
  ): Promise<void> {
    await exportPdf(
      report,
      language,
    );
  },

  async exportExcel(
    report: ReportData,
    language = "fr",
  ): Promise<void> {
    await exportExcel(
      report,
      language,
    );
  },
};
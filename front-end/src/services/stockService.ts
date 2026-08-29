import {
  initialMockArticles,
  initialMockMovements,
  initialMockSupplyRequests,
} from "../mock/stock";

import type {
  StockArticle,
  StockArticleFormData,
  StockMovement,
  StockMovementType,
  SupplyRequest,
  SupplyRequestStatus,
} from "../types/stock";

import type {
  AppDocument,
} from "../types/document";

let articles: StockArticle[] = [
  ...initialMockArticles,
];

let movements: StockMovement[] = [
  ...initialMockMovements,
];

let requests: SupplyRequest[] = [
  ...initialMockSupplyRequests,
];

const delay = (
  milliseconds = 200,
) =>
  new Promise<void>(
    (resolve) =>
      setTimeout(
        resolve,
        milliseconds,
      ),
  );

const normalizeReference = (
  value: string,
) =>
  value
    .trim()
    .toUpperCase();

const normalizeSerialNumber = (
  value?: string,
) =>
  value
    ?.trim()
    .toUpperCase() || undefined;

const normalizeBarcode = (
  value?: string,
) =>
  value?.trim() || undefined;

const cloneDocuments = (
  documents: AppDocument[],
) =>
  documents.map(
    (document) => ({
      ...document,
    }),
  );

export const stockService = {
  async getArticles() {
    await delay();

    return articles.map(
      (article) => ({
        ...article,
        documents:
          cloneDocuments(
            article.documents,
          ),
      }),
    );
  },

  async getArticleById(
    id: number,
  ) {
    await delay();

    const article =
      articles.find(
        (item) =>
          item.id === id,
      );

    if (!article) {
      throw new Error(
        "Article introuvable.",
      );
    }

    return {
      ...article,
      documents:
        cloneDocuments(
          article.documents,
        ),
    };
  },

  async createArticle(
    data: StockArticleFormData,
  ) {
    await delay();

    const reference =
      normalizeReference(
        data.reference,
      );

    const serialNumber =
      normalizeSerialNumber(
        data.serialNumber,
      );

    const barcode =
      normalizeBarcode(
        data.barcode,
      );

    const referenceExists =
      articles.some(
        (article) =>
          normalizeReference(
            article.reference,
          ) === reference,
      );

    if (referenceExists) {
      throw new Error(
        "Cette référence existe déjà.",
      );
    }

    if (
      serialNumber &&
      articles.some(
        (article) =>
          normalizeSerialNumber(
            article.serialNumber,
          ) === serialNumber,
      )
    ) {
      throw new Error(
        "Ce numéro de série existe déjà.",
      );
    }

    if (
      barcode &&
      articles.some(
        (article) =>
          normalizeBarcode(
            article.barcode,
          ) === barcode,
      )
    ) {
      throw new Error(
        "Ce code-barres existe déjà.",
      );
    }

    const newArticle: StockArticle = {
      id:
        Math.max(
          0,
          ...articles.map(
            (item) => item.id,
          ),
        ) + 1,

      ...data,

      reference,
      serialNumber,
      barcode,

      documents:
        cloneDocuments(
          data.documents ?? [],
        ),

      updatedAt:
        new Date()
          .toISOString()
          .slice(0, 10),
    };

    articles = [
      newArticle,
      ...articles,
    ];

    return {
      ...newArticle,
      documents:
        cloneDocuments(
          newArticle.documents,
        ),
    };
  },

  async updateArticle(
    id: number,
    data: StockArticleFormData,
  ) {
    await delay();

    const index =
      articles.findIndex(
        (article) =>
          article.id === id,
      );

    if (index === -1) {
      throw new Error(
        "Article introuvable.",
      );
    }

    const reference =
      normalizeReference(
        data.reference,
      );

    const serialNumber =
      normalizeSerialNumber(
        data.serialNumber,
      );

    const barcode =
      normalizeBarcode(
        data.barcode,
      );

    const duplicateReference =
      articles.some(
        (article) =>
          article.id !== id &&
          normalizeReference(
            article.reference,
          ) === reference,
      );

    if (duplicateReference) {
      throw new Error(
        "Cette référence existe déjà.",
      );
    }

    if (
      serialNumber &&
      articles.some(
        (article) =>
          article.id !== id &&
          normalizeSerialNumber(
            article.serialNumber,
          ) === serialNumber,
      )
    ) {
      throw new Error(
        "Ce numéro de série existe déjà.",
      );
    }

    if (
      barcode &&
      articles.some(
        (article) =>
          article.id !== id &&
          normalizeBarcode(
            article.barcode,
          ) === barcode,
      )
    ) {
      throw new Error(
        "Ce code-barres existe déjà.",
      );
    }

    const updated: StockArticle = {
      ...articles[index],
      ...data,
      id,
      reference,
      serialNumber,
      barcode,
      documents:
        cloneDocuments(
          data.documents,
        ),
      updatedAt:
        new Date()
          .toISOString()
          .slice(0, 10),
    };

    articles[index] = updated;

    return {
      ...updated,
      documents:
        cloneDocuments(
          updated.documents,
        ),
    };
  },

  async removeArticle(
    id: number,
  ) {
    await delay();

    const exists =
      articles.some(
        (article) =>
          article.id === id,
      );

    if (!exists) {
      throw new Error(
        "Article introuvable.",
      );
    }

    articles =
      articles.filter(
        (article) =>
          article.id !== id,
      );
  },

  async getMovements() {
    await delay();

    return movements.map(
      (movement) => ({
        ...movement,
        documents:
          cloneDocuments(
            movement.documents,
          ),
      }),
    );
  },

  async getMovementsByArticleId(
    articleId: number,
  ) {
    await delay();

    return movements
      .filter(
        (movement) =>
          movement.articleId ===
          articleId,
      )
      .map(
        (movement) => ({
          ...movement,
          documents:
            cloneDocuments(
              movement.documents,
            ),
        }),
      );
  },

  async createMovement(
    data: {
      articleId: number;
      type: StockMovementType;
      quantity: number;
      reason: string;
      supplierOrBeneficiary?: string;
      reference?: string;
      performedBy: string;
      date?: string;
      documents?: AppDocument[];
    },
  ) {
    await delay();

    if (
      !Number.isFinite(
        data.quantity,
      ) ||
      data.quantity <= 0
    ) {
      throw new Error(
        "La quantité doit être supérieure à zéro.",
      );
    }

    if (!data.reason.trim()) {
      throw new Error(
        "Le motif est obligatoire.",
      );
    }

    const article =
      articles.find(
        (item) =>
          item.id ===
          data.articleId,
      );

    if (!article) {
      throw new Error(
        "Article introuvable.",
      );
    }

    if (
      data.type === "EXIT" &&
      data.quantity >
        article.quantity
    ) {
      throw new Error(
        "Stock insuffisant.",
      );
    }

    article.quantity =
      data.type === "ENTRY"
        ? article.quantity +
          data.quantity
        : article.quantity -
          data.quantity;

    article.updatedAt =
      new Date()
        .toISOString()
        .slice(0, 10);

    const newMovement: StockMovement = {
      id:
        Math.max(
          0,
          ...movements.map(
            (item) => item.id,
          ),
        ) + 1,

      articleId:
        article.id,

      articleDesignation:
        article.designation,

      articleDesignationAr:
        article.designationAr,

      type: data.type,
      quantity: data.quantity,
      reason: data.reason.trim(),

      supplierOrBeneficiary:
        data.supplierOrBeneficiary
          ?.trim() || undefined,

      reference:
        data.reference
          ?.trim() || undefined,

      performedBy:
        data.performedBy.trim(),

      date:
        data.date ??
        new Date()
          .toISOString()
          .slice(0, 10),

      documents:
        cloneDocuments(
          data.documents ?? [],
        ),
    };

    movements = [
      newMovement,
      ...movements,
    ];

    return {
      ...newMovement,
      documents:
        cloneDocuments(
          newMovement.documents,
        ),
    };
  },

  async getRequests() {
    await delay();

    return requests.map(
      (request) => ({
        ...request,
        documents:
          cloneDocuments(
            request.documents,
          ),
      }),
    );
  },

  async createRequest(
    data: {
      articleDesignation: string;
      articleDesignationAr?: string;
      requestedQuantity: number;
      requester: string;
      reason: string;
      documents?: AppDocument[];
    },
  ) {
    await delay();

    if (
      !Number.isFinite(
        data.requestedQuantity,
      ) ||
      data.requestedQuantity <= 0
    ) {
      throw new Error(
        "La quantité demandée doit être supérieure à zéro.",
      );
    }

    if (
      !data.articleDesignation.trim() ||
      !data.requester.trim() ||
      !data.reason.trim()
    ) {
      throw new Error(
        "Les informations de la demande sont incomplètes.",
      );
    }

    const request: SupplyRequest = {
      id:
        Math.max(
          0,
          ...requests.map(
            (item) => item.id,
          ),
        ) + 1,

      articleDesignation:
        data.articleDesignation.trim(),

      articleDesignationAr:
        data.articleDesignationAr
          ?.trim() || undefined,

      requestedQuantity:
        data.requestedQuantity,

      requester:
        data.requester.trim(),

      reason:
        data.reason.trim(),

      requestDate:
        new Date()
          .toISOString()
          .slice(0, 10),

      status: "PENDING",

      documents:
        cloneDocuments(
          data.documents ?? [],
        ),
    };

    requests = [
      request,
      ...requests,
    ];

    return {
      ...request,
      documents:
        cloneDocuments(
          request.documents,
        ),
    };
  },

  async updateRequestStatus(
    id: number,
    status: SupplyRequestStatus,
  ) {
    await delay();

    const request =
      requests.find(
        (item) =>
          item.id === id,
      );

    if (!request) {
      throw new Error(
        "Demande introuvable.",
      );
    }

    request.status = status;

    return {
      ...request,
      documents:
        cloneDocuments(
          request.documents,
        ),
    };
  },
};

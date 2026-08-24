import {
  initialMockArticles,
  initialMockMovements,
  initialMockSupplyRequests,
} from "../mock/stock";

import type {
  StockArticle,
  StockArticleFormData,
  StockDocument,
  StockMovement,
  StockMovementType,
  SupplyRequest,
  SupplyRequestStatus,
} from "../types/stock";

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
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds,
      );
    },
  );

export const stockService = {
  async getArticles(): Promise<
    StockArticle[]
  > {
    await delay();

    return articles.map(
      (article) => ({
        ...article,
      }),
    );
  },

  async getArticleById(
    id: number,
  ): Promise<StockArticle> {
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
    };
  },

  async createArticle(
    data: StockArticleFormData,
  ): Promise<StockArticle> {
    await delay();

    const referenceExists =
      articles.some(
        (article) =>
          article.reference
            .toLowerCase() ===
          data.reference
            .trim()
            .toLowerCase(),
      );

    if (referenceExists) {
      throw new Error(
        "Cette référence existe déjà.",
      );
    }

    const newArticle: StockArticle = {
      id:
        Math.max(
          0,
          ...articles.map(
            (article) =>
              article.id,
          ),
        ) + 1,

      reference:
        data.reference
          .trim()
          .toUpperCase(),

      designation:
        data.designation.trim(),

      designationAr:
        data.designationAr.trim(),

      category:
        data.category.trim(),

      categoryAr:
        data.categoryAr.trim(),

      quantity:
        data.quantity,

      minimumQuantity:
        data.minimumQuantity,

      unit:
        data.unit,

      location:
        data.location.trim(),

      locationAr:
        data.locationAr.trim(),

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
    };
  },

  async updateArticle(
    id: number,
    data: StockArticleFormData,
  ): Promise<StockArticle> {
    await delay();

    const articleIndex =
      articles.findIndex(
        (article) =>
          article.id === id,
      );

    if (
      articleIndex === -1
    ) {
      throw new Error(
        "Article introuvable.",
      );
    }

    const referenceExists =
      articles.some(
        (article) =>
          article.id !== id &&
          article.reference
            .toLowerCase() ===
            data.reference
              .trim()
              .toLowerCase(),
      );

    if (referenceExists) {
      throw new Error(
        "Cette référence existe déjà.",
      );
    }

    const updatedArticle: StockArticle = {
      id,

      reference:
        data.reference
          .trim()
          .toUpperCase(),

      designation:
        data.designation.trim(),

      designationAr:
        data.designationAr.trim(),

      category:
        data.category.trim(),

      categoryAr:
        data.categoryAr.trim(),

      quantity:
        data.quantity,

      minimumQuantity:
        data.minimumQuantity,

      unit:
        data.unit,

      location:
        data.location.trim(),

      locationAr:
        data.locationAr.trim(),

      updatedAt:
        new Date()
          .toISOString()
          .slice(0, 10),
    };

    articles[
      articleIndex
    ] = updatedArticle;

    return {
      ...updatedArticle,
    };
  },

  async removeArticle(
    id: number,
  ): Promise<void> {
    await delay();

    articles =
      articles.filter(
        (article) =>
          article.id !== id,
      );
  },

  async getMovements(): Promise<
    StockMovement[]
  > {
    await delay();

    return movements.map(
      (movement) => ({
        ...movement,

        documents: [
          ...movement.documents,
        ],
      }),
    );
  },

  async getMovementsByArticleId(
    articleId: number,
  ): Promise<StockMovement[]> {
    await delay();

    return movements
      .filter(
        (movement) =>
          movement.articleId ===
          articleId,
      )
      .map((movement) => ({
        ...movement,

        documents: [
          ...movement.documents,
        ],
      }));
  },

  async createMovement(
    data: {
      articleId: number;

      type:
        StockMovementType;

      quantity: number;

      reason: string;

      supplierOrBeneficiary?: string;

      reference?: string;

      performedBy: string;

      date?: string;

      documents?: Omit<
        StockDocument,
        "id"
      >[];
    },
  ): Promise<StockMovement> {
    await delay();

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
      data.quantity <= 0
    ) {
      throw new Error(
        "La quantité doit être supérieure à zéro.",
      );
    }

    if (
      data.type === "EXIT" &&
      data.quantity >
        article.quantity
    ) {
      throw new Error(
        "La quantité demandée dépasse le stock disponible.",
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

    const allDocuments =
      movements.flatMap(
        (movement) =>
          movement.documents,
      );

    let nextDocumentId =
      Math.max(
        0,
        ...allDocuments.map(
          (document) =>
            document.id,
        ),
      ) + 1;

    const documents =
      (
        data.documents ?? []
      ).map(
        (
          document,
        ): StockDocument => ({
          ...document,

          id:
            nextDocumentId++,
        }),
      );

    const newMovement: StockMovement = {
      id:
        Math.max(
          0,
          ...movements.map(
            (movement) =>
              movement.id,
          ),
        ) + 1,

      articleId:
        article.id,

      articleDesignation:
        article.designation,

      articleDesignationAr:
        article.designationAr,

      type:
        data.type,

      quantity:
        data.quantity,

      reason:
        data.reason.trim(),

      supplierOrBeneficiary:
        data.supplierOrBeneficiary
          ?.trim() ||
        undefined,

      reference:
        data.reference
          ?.trim() ||
        undefined,

      performedBy:
        data.performedBy.trim(),

      date:
        data.date ||
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          ),

      documents,
    };

    movements = [
      newMovement,
      ...movements,
    ];

    return {
      ...newMovement,

      documents: [
        ...newMovement.documents,
      ],
    };
  },

  async getRequests(): Promise<
    SupplyRequest[]
  > {
    await delay();

    return requests.map(
      (request) => ({
        ...request,
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
    },
  ): Promise<SupplyRequest> {
    await delay();

    if (
      data.requestedQuantity <=
      0
    ) {
      throw new Error(
        "La quantité demandée doit être supérieure à zéro.",
      );
    }

    const newRequest: SupplyRequest = {
      id:
        Math.max(
          0,
          ...requests.map(
            (request) =>
              request.id,
          ),
        ) + 1,

      articleDesignation:
        data.articleDesignation.trim(),

      articleDesignationAr:
        data.articleDesignationAr
          ?.trim() ||
        undefined,

      requestedQuantity:
        data.requestedQuantity,

      requester:
        data.requester.trim(),

      reason:
        data.reason.trim(),

      requestDate:
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          ),

      status:
        "PENDING",
    };

    requests = [
      newRequest,
      ...requests,
    ];

    return {
      ...newRequest,
    };
  },

  async updateRequestStatus(
    id: number,
    status:
      SupplyRequestStatus,
  ): Promise<SupplyRequest> {
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

    request.status =
      status;

    return {
      ...request,
    };
  },
};
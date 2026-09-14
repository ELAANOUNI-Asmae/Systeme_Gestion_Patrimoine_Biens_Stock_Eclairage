import api from "./api";

export const documentApiService = {
  async openBlob(
    documentId: number,
  ): Promise<Blob> {
    const response =
      await api.get<Blob>(
        `/sgpbse/document/${documentId}/content`,
        {
          responseType: "blob",
        },
      );

    return response.data;
  },
};

import api from "./api";

const BASE_URL =
  "/sgpbse/dashboard";

export const dashboardService = {
  async getUsernameFr(): Promise<string> {
    const response =
      await api.get<string>(
        `${BASE_URL}/username_fr`,
      );

    return response.data;
  },

  async getUsernameAr(): Promise<string> {
    const response =
      await api.get<string>(
        `${BASE_URL}/username_ar`,
      );

    return response.data;
  },

  async getRoleName(): Promise<string> {
    const response =
      await api.get<string>(
        `${BASE_URL}/role_name`,
      );

    return response.data;
  },

  async countUsers(): Promise<number> {
    const response =
      await api.get<number>(
        `${BASE_URL}/count_users`,
      );

    return response.data;
  },

  async countAssets(): Promise<number> {
    const response =
      await api.get<number>(
        `${BASE_URL}/count_assets`,
      );

    return response.data;
  },

  async countItems(): Promise<number> {
    const response =
      await api.get<number>(
        `${BASE_URL}/count_items`,
      );

    return response.data;
  },

  async countLightPoints(): Promise<number> {
    const response =
      await api.get<number>(
        `${BASE_URL}/count_light_points`,
      );

    return response.data;
  },

  async countAssetsByStatus(
    status: string,
  ): Promise<number> {
    const response =
      await api.get<number>(
        `${BASE_URL}/count_assets_by_status`,
        {
          data: status,
        },
      );

    return response.data;
  },

  async countFailures(): Promise<number> {
    const response =
      await api.get<number>(
        `${BASE_URL}/count_failures`,
      );

    return response.data;
  },

  async countStockMovementByPeriod(
    days: number,
  ): Promise<number> {
    const response =
      await api.get<number>(
        `${BASE_URL}/count_stock_movement_by_period`,
        {
          data: days,
        },
      );

    return response.data;
  },

  async countLowStockAlerts(): Promise<number> {
    const response =
      await api.get<number>(
        `${BASE_URL}/count_low_stock_alerts`,
      );

    return response.data;
  },

  async getLowStockAlertsByPeriod(
    days: number,
  ): Promise<unknown[]> {
    const response =
      await api.get<unknown[]>(
        `${BASE_URL}/get_low_stock_alerts_by_period`,
        {
          data: days,
        },
      );

    return response.data;
  },
};
import { http } from "@/lib/http";

export class AnalyticsService {
  public static async getDashboardStats(days: number) {
    const response = await http.get(`/analytics/dashboard?days=${days}`);
    return response.data.data;
  }

  public static async getCostAnalysis(days: number) {
    const response = await http.get(`/analytics/cost-analysis?days=${days}`);
    return response.data.data;
  }

  public static async getGlobalStats() {
    const response = await http.get('/analytics/global-stats');
    return response.data.data;
  }
}

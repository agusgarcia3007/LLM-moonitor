import { http } from "@/lib/http";

export class AnalyticsService {
  public static async getDashboardStats(days: number, projectId: string) {
    const response = await http.get(
      `/analytics/dashboard?days=${days}&projectId=${projectId}`
    );
    return response.data.data;
  }

  public static async getCostAnalysis(days: number, projectId: string) {
    const response = await http.get(
      `/analytics/cost-analysis?days=${days}&projectId=${projectId}`
    );
    return response.data.data;
  }

  public static async getGlobalStats() {
    const response = await http.get("/analytics/global-stats");
    return response.data.data;
  }
}

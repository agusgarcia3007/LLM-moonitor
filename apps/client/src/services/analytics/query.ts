import { queryOptions, useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "./service";

export const dashboardStatsQueryOptions = (days: number, projectId: string) =>
  queryOptions({
    queryKey: ["dashboard-stats", days, projectId],
    queryFn: () => AnalyticsService.getDashboardStats(days, projectId),
    enabled: !!projectId,
  });

export const costAnalysisQueryOptions = (days: number, projectId: string) =>
  queryOptions({
    queryKey: ["cost-analysis", days, projectId],
    queryFn: () => AnalyticsService.getCostAnalysis(days, projectId),
    enabled: !!projectId,
  });

export const useDashboardStatsQuery = (days = 30, projectId?: string) => {
  return useQuery(dashboardStatsQueryOptions(days, projectId || ""));
};

export const useCostAnalysisQuery = (days = 30, projectId?: string) => {
  return useQuery(costAnalysisQueryOptions(days, projectId || ""));
};

export const globalStatsQueryOptions = () =>
  queryOptions({
    queryKey: ["global-stats"],
    queryFn: () => AnalyticsService.getGlobalStats(),
  });

export const useGlobalStatsQuery = () => {
  return useQuery(globalStatsQueryOptions());
};

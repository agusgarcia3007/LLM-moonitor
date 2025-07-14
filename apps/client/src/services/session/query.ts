import { useQuery } from "@tanstack/react-query";
import { SessionService } from "./service";

export const useGetSession = () => {
  return useQuery({
    queryKey: ["session"],
    queryFn: SessionService.getSession,
  });
};

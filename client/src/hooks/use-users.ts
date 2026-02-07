import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useUsers() {
  return useQuery({
    queryKey: [api.users.all.path],
    queryFn: async () => {
      const res = await fetch(api.users.all.path, { 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.users.all.responses[200].parse(await res.json());
    },
  });
}

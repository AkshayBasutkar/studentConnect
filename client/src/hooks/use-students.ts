import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useStudents() {
  return useQuery({
    queryKey: [api.users.students.path],
    queryFn: async () => {
      const res = await fetch(api.users.students.path, { 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      return api.users.students.responses[200].parse(await res.json());
    },
  });
}

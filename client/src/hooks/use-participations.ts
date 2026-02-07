import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type CreateParticipationInput = z.infer<typeof api.participations.create.input>;
type ReviewParticipationInput = z.infer<typeof api.participations.review.input>;

export function useParticipations(filters?: { studentId?: number; status?: 'pending' | 'approved' | 'rejected' }) {
  const queryKey = [api.participations.list.path, filters];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL(api.participations.list.path, window.location.origin);
      if (filters?.studentId) url.searchParams.append("studentId", filters.studentId.toString());
      if (filters?.status) url.searchParams.append("status", filters.status);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch participations");
      return api.participations.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateParticipation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateParticipationInput) => {
      const res = await fetch(api.participations.create.path, {
        method: api.participations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit participation");
      return api.participations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.participations.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.dashboard.path] });
      toast({
        title: "Submission successful",
        description: "Your participation proof has been submitted for review.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message,
      });
    },
  });
}

export function useReviewParticipation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & ReviewParticipationInput) => {
      const url = buildUrl(api.participations.review.path, { id });
      const res = await fetch(url, {
        method: api.participations.review.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.participations.review.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.participations.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.dashboard.path] });
      toast({
        title: `Submission ${variables.status}`,
        description: `Successfully ${variables.status} the participation request.`,
      });
    },
  });
}

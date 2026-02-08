import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertEventInput } from "@shared/schema";

export function useEvents(filters?: { category?: string; query?: string }) {
  const queryKey = [api.events.list.path, filters];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Construct URL with query params
      const url = new URL(api.events.list.path, window.location.origin);
      if (filters?.category && filters.category !== "all") {
        url.searchParams.append("category", filters.category);
      }
      if (filters?.query) {
        url.searchParams.append("query", filters.query);
      }
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch events");
      return api.events.list.responses[200].parse(await res.json());
    },
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: [api.events.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.events.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch event");
      return api.events.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (eventData: InsertEventInput) => {
      const res = await fetch(api.events.create.path, {
        method: api.events.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
        credentials: "include",
      });
      if (!res.ok) {
        let message = "Failed to create event";
        const text = await res.text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed?.message) message = parsed.message;
          } catch {
            message = text;
          }
        }
        throw new Error(message);
      }
      return api.events.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      toast({
        title: "Event created",
        description: "The event has been successfully posted.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create event",
        description: error.message,
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.events.delete.path, { id });
      const res = await fetch(url, {
        method: api.events.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      toast({
        title: "Event deleted",
        description: "The event has been removed.",
      });
    },
  });
}

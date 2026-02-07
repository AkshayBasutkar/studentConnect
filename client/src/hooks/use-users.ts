import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertUser, InsertStudent, InsertProctor } from "@shared/schema";

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

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await fetch(api.users.create.path, {
        method: api.users.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create user");
      }
      return api.users.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.all.path] });
      toast({
        title: "User created",
        description: "The user has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create user",
        description: error.message,
      });
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (studentData: InsertStudent) => {
      const res = await fetch(api.users.createStudent.path, {
        method: api.users.createStudent.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create student profile");
      }
      return api.users.createStudent.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.all.path] });
      toast({
        title: "Student profile created",
        description: "The student profile has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create student profile",
        description: error.message,
      });
    },
  });
}

export function useCreateProctor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (proctorData: InsertProctor) => {
      const res = await fetch(api.users.createProctor.path, {
        method: api.users.createProctor.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proctorData),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create proctor profile");
      }
      return api.users.createProctor.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.all.path] });
      toast({
        title: "Proctor profile created",
        description: "The proctor profile has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create proctor profile",
        description: error.message,
      });
    },
  });
}

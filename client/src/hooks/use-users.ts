import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertUser, InsertStudent, InsertProctor, InsertStudentSelfInput } from "@shared/schema";

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

export function useCreateMyStudentProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (studentData: InsertStudentSelfInput) => {
      const res = await fetch(api.students.me.create.path, {
        method: api.students.me.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create student profile");
      }
      return api.students.me.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      toast({
        title: "Profile saved",
        description: "Your student profile is ready. You can submit participations now.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to save profile",
        description: error.message,
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<InsertUser> & { password?: string | undefined | null } }) => {
      const url = api.users.update.path.replace(":id", String(id));
      const res = await fetch(url, {
        method: api.users.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update user");
      }
      return api.users.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.all.path] });
      toast({
        title: "User updated",
        description: "User details have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update user",
        description: error.message,
      });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = api.users.delete.path.replace(":id", String(id));
      const res = await fetch(url, {
        method: api.users.delete.method,
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to deactivate user");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.all.path] });
      toast({
        title: "User deactivated",
        description: "The user has been set to inactive.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to deactivate user",
        description: error.message,
      });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ConversionStatus, Lead } from "../backend";
import { useActor } from "./useActor";

export function useLeads() {
  const { actor, isFetching } = useActor();
  return useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLeadStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leadStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLeadStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitLead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lead: Lead) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitLead(lead);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["leadStats"] });
    },
  });
}

export function useUpdateLeadStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: ConversionStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateLeadStatus(id, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLeadNotes() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: bigint; notes: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateLeadNotes(id, notes);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteLead(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["leadStats"] });
    },
  });
}

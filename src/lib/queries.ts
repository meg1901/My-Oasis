import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAffirmations, listQuotes } from "./api";
import { useApi } from "./api-context";

export function useData() {
  const api = useApi();
  const k = (s: string) => [api.mode, s];
  return {
    api,
    profile: useQuery({ queryKey: k("profile"), queryFn: () => api.getProfile() }),
    moods: useQuery({ queryKey: k("moods"), queryFn: () => api.listMoods() }),
    journal: useQuery({ queryKey: k("journal"), queryFn: () => api.listJournal() }),
    saved: useQuery({ queryKey: k("saved"), queryFn: () => api.listSaved() }),
  };
}

export const useQuotes = () => useQuery({ queryKey: ["quotes"], queryFn: listQuotes, staleTime: Infinity });
export const useAffirmations = () => useQuery({ queryKey: ["affirmations"], queryFn: listAffirmations, staleTime: Infinity });

/** Mutation that refreshes the listed cache keys afterwards. */
export function useAct<T>(fn: (v: T) => Promise<unknown>, keys: string[]) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSettled: () => Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: [api.mode, k] }))),
  });
}

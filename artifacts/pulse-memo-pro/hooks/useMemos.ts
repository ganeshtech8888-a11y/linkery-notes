import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = `${process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : ""}/api`;

export interface Memo {
  id: string;
  url: string;
  title: string;
  context: string;
  favicon: string;
  createdAt: string;
}

async function fetchMemos(): Promise<Memo[]> {
  const res = await fetch(`${BASE}/memos`);
  if (!res.ok) throw new Error("Failed to fetch memos");
  return res.json();
}

async function createMemo(data: { url: string; context: string }): Promise<Memo> {
  const res = await fetch(`${BASE}/memos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to save memo" }));
    throw new Error(err.error || "Failed to save memo");
  }
  return res.json();
}

async function deleteMemo(id: string): Promise<void> {
  const res = await fetch(`${BASE}/memos/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to delete" }));
    throw new Error(err.error || "Failed to delete memo");
  }
}

export function useMemos() {
  return useQuery<Memo[]>({
    queryKey: ["memos"],
    queryFn: fetchMemos,
    staleTime: 30000,
  });
}

export function useCreateMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMemo,
    onSuccess: (newMemo) => {
      queryClient.setQueryData<Memo[]>(["memos"], (old) =>
        old ? [newMemo, ...old] : [newMemo]
      );
    },
  });
}

export function useDeleteMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMemo,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["memos"] });
      const previous = queryClient.getQueryData<Memo[]>(["memos"]);
      queryClient.setQueryData<Memo[]>(["memos"], (old) =>
        old ? old.filter((m) => m.id !== id) : []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["memos"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["memos"] });
    },
  });
}

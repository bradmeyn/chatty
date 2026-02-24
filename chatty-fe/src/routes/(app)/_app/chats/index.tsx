import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Sparkles } from "lucide-react";
import { createChat, getChats } from "@/lib/features/chats/service";
import type { Chat } from "@/lib/features/chats/types";

export const Route = createFileRoute("/(app)/_app/chats/")({
  component: ChatListPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.fetchQuery({
      queryKey: ["chats"],
      queryFn: () => getChats(),
    });
    return null;
  },
});

function ChatListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const { data: chats, isLoading } = useQuery<Chat[], Error>({
    queryKey: ["chats"],
    queryFn: () => getChats(),
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (value: string) => createChat(value),
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      navigate({ to: `/chats/${chat.id}` });
    },
  });

  const sortedChats = useMemo(() => {
    if (!chats) return [];
    return [...chats].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [chats]);

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) {
      createMutation.mutate("New chat");
      return;
    }
    createMutation.mutate(prompt.trim());
    setPrompt("");
  };

  return (
    <div className="space-y-8">
      <Card className="border-black/10 bg-white/80 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0f766e]/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#0f766e]">
              <Sparkles size={14} />
              Start a new chat
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold">
              Ask a question, capture the answer.
            </h1>
            <p className="text-muted-foreground">
              Drop your prompt below. We will spin up a new chat and keep the
              conversation organized.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="mt-6 grid gap-3">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="What should we plan today?"
            className="min-h-[120px] bg-white"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Press Enter to start or use the button.
            </span>
            <Button
              type="submit"
              className="bg-[#0f766e] hover:bg-[#115e59]"
              disabled={createMutation.isPending}
            >
              Create chat
            </Button>
          </div>
        </form>
      </Card>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading chats...</div>
      ) : null}
    </div>
  );
}

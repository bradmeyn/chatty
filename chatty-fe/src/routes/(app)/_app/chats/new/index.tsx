import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ChatComposer from "@/lib/components/chat-composer";
import { createChat, sendChatMessage } from "@/lib/features/chats/service";
import type { ChatMessage } from "@/lib/features/chats/types";

export const Route = createFileRoute("/(app)/_app/chats/new/")({
  component: NewChatPage,
});

function NewChatPage() {
  const [prompt, setPrompt] = useState("");
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const trimmedPrompt = prompt.trim();

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const title = content.slice(0, 80).trim();
      const chat = await createChat(title || "New chat");
      const { userMessage, assistantMessage } = await sendChatMessage(
        chat.id,
        content
      );
      return { chat, userMessage, assistantMessage };
    },
    onSuccess: ({ chat, userMessage, assistantMessage }) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.setQueryData(["chat", chat.id], chat);
      queryClient.setQueryData<ChatMessage[]>(
        ["chatMessages", chat.id],
        [userMessage, assistantMessage]
      );
      navigate({ to: `/chats/${chat.id}` });
    },
    onError: (error) => {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to start chat. Please try again."
      );
    },
  });

  const handleCreate = () => {
    if (!trimmedPrompt || createMutation.isPending) {
      return;
    }
    setSubmitError("");
    createMutation.mutate(trimmedPrompt);
  };

  return (
    <div className="grid min-h-[calc(100vh-12rem)] place-items-center">
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-center text-4xl font-semibold sm:text-5xl">
          Ask Me Anything
        </h1>
        <ChatComposer
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleCreate}
          disabled={createMutation.isPending}
          isSubmitting={createMutation.isPending}
          error={submitError}
        />
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import ChatComposer from "@/lib/components/chat-composer";
import {
  getChatMessages,
  streamChatMessage,
} from "@/lib/features/chats/service";
import type { ChatMessage } from "@/lib/features/chats/types";

export const Route = createFileRoute("/(app)/_app/chats/$chatId/")({
  component: ChatDetailPage,
});

function ChatDetailPage() {
  const { chatId } = Route.useParams();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [pendingUser, setPendingUser] = useState<ChatMessage | null>(null);
  const [streamingAssistant, setStreamingAssistant] = useState<ChatMessage | null>(
    null
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const pendingUserRef = useRef<ChatMessage | null>(null);
  const streamingAssistantRef = useRef<ChatMessage | null>(null);

  const { data: messages } = useQuery<ChatMessage[], Error>({
    queryKey: ["chatMessages", chatId],
    queryFn: () => getChatMessages(chatId),
  });

  const orderedMessages = useMemo(() => {
    const base = messages ? [...messages] : [];
    if (pendingUser) base.push(pendingUser);
    if (streamingAssistant) base.push(streamingAssistant);
    return base;
  }, [messages, pendingUser, streamingAssistant]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [orderedMessages.length]);

  const isAwaitingFirstToken =
    isStreaming && (!streamingAssistant || !streamingAssistant.content.trim());

  const handleSubmit = () => {
    const content = draft.trim();
    if (!content || isStreaming) return;
    setSubmitError("");
    setIsStreaming(true);
    const now = new Date();
    const tempUser: ChatMessage = {
      id: `temp-user-${now.getTime()}`,
      chatId,
      role: "USER",
      content,
      createdAt: now.toISOString(),
      createdById: null,
    };
    const tempAssistant: ChatMessage = {
      id: `temp-assistant-${now.getTime()}`,
      chatId,
      role: "ASSISTANT",
      content: "",
      createdAt: now.toISOString(),
      createdById: null,
    };

    pendingUserRef.current = tempUser;
    setPendingUser(tempUser);
    streamingAssistantRef.current = tempAssistant;
    setStreamingAssistant(tempAssistant);
    setDraft("");

    streamChatMessage(chatId, content, {
      onStart: ({ userMessage }) => {
        pendingUserRef.current = userMessage;
        setPendingUser(userMessage);
      },
      onToken: ({ delta }) => {
        if (!delta) return;
        setStreamingAssistant((prev) => {
          if (!prev) return prev;
          const next = { ...prev, content: prev.content + delta };
          streamingAssistantRef.current = next;
          return next;
        });
      },
      onDone: ({ assistantMessage }) => {
        const userMessage = pendingUserRef.current;
        queryClient.setQueryData<ChatMessage[]>(
          ["chatMessages", chatId],
          (old) => {
            const base = old ? [...old] : [];
            if (userMessage) base.push(userMessage);
            base.push(assistantMessage);
            return base;
          }
        );
        setPendingUser(null);
        streamingAssistantRef.current = null;
        setStreamingAssistant(null);
        setIsStreaming(false);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      },
      onError: ({ message }) => {
        setSubmitError(message);
        const userMessage = pendingUserRef.current;
        const currentAssistant = streamingAssistantRef.current;
        const finalAssistant =
          currentAssistant && currentAssistant.content
            ? currentAssistant
            : currentAssistant
              ? { ...currentAssistant, content: message }
              : null;
        if (finalAssistant) {
          queryClient.setQueryData<ChatMessage[]>(
            ["chatMessages", chatId],
            (old) => {
              const base = old ? [...old] : [];
              if (userMessage) base.push(userMessage);
              base.push(finalAssistant);
              return base;
            }
          );
        }
        setPendingUser(null);
        streamingAssistantRef.current = null;
        setStreamingAssistant(null);
        setIsStreaming(false);
      },
    });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-16rem)]">
      <div className="flex-1 overflow-auto space-y-4 pr-2">
          {orderedMessages.length ? (
            orderedMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    message.role === "USER"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {message.role === "ASSISTANT" &&
                  isAwaitingFirstToken &&
                  message.id === streamingAssistant?.id ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:120ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:240ms]" />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className="mt-2 text-[0.7rem] text-muted-foreground">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">
              Send a message to start the conversation.
            </div>
          )}
          <div ref={endRef} />
      </div>

      <ChatComposer
        className="mt-auto pt-4"
        value={draft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        placeholder="Type your message..."
        disabled={isStreaming}
        isSubmitting={isStreaming && isAwaitingFirstToken}
        error={submitError}
      />
    </div>
  );
}

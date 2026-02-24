import { api, type ApiError } from "@services/api";
import axios from "axios";
import type { Chat, ChatMessage } from "./types";

export async function getChats() {
  try {
    const response = await api.get<Chat[]>("/chats");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ApiError;
      throw new Error(
        errorData?.error ||
          errorData?.message ||
          errorData?.errors?.join(", ") ||
          "Failed to fetch chats",
      );
    }
    throw error;
  }
}

export async function createChat(title?: string) {
  try {
    const response = await api.post<Chat>("/chats", {
      title: title?.trim() || null,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ApiError;
      throw new Error(
        errorData?.error ||
          errorData?.message ||
          errorData?.errors?.join(", ") ||
          "Failed to create chat",
      );
    }
    throw error;
  }
}

export async function getChat(chatId: string) {
  try {
    const response = await api.get<Chat>(`/chats/${chatId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ApiError;
      throw new Error(
        errorData?.error ||
          errorData?.message ||
          errorData?.errors?.join(", ") ||
          "Failed to fetch chat",
      );
    }
    throw error;
  }
}

export async function getChatMessages(chatId: string) {
  try {
    const response = await api.get<ChatMessage[]>(`/chats/${chatId}/messages`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ApiError;
      throw new Error(
        errorData?.error ||
          errorData?.message ||
          errorData?.errors?.join(", ") ||
          "Failed to fetch messages",
      );
    }
    throw error;
  }
}

export async function sendChatMessage(chatId: string, content: string) {
  try {
    const response = await api.post<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>(
      `/chats/${chatId}/messages`,
      { content },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ApiError;
      throw new Error(
        errorData?.error ||
          errorData?.message ||
          errorData?.errors?.join(", ") ||
          "Failed to send message",
      );
    }
    throw error;
  }
}

type StreamHandlers = {
  onStart?: (data: { userMessage: ChatMessage }) => void;
  onToken?: (data: { delta: string }) => void;
  onDone?: (data: { assistantMessage: ChatMessage }) => void;
  onError?: (data: { message: string }) => void;
};

export function streamChatMessage(
  chatId: string,
  content: string,
  handlers: StreamHandlers
) {
  const controller = new AbortController();
  const baseUrl = (api.defaults.baseURL ?? "/api").replace(/\/$/, "");

  fetch(`${baseUrl}/chats/${chatId}/messages/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok || !response.body) {
        throw new Error("Streaming response failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          handleSseChunk(part, handlers);
        }
      }

      if (buffer.trim()) {
        handleSseChunk(buffer, handlers);
      }
    })
    .catch((error) => {
      handlers.onError?.({ message: error instanceof Error ? error.message : "Stream failed" });
    });

  return controller;
}

function handleSseChunk(chunk: string, handlers: StreamHandlers) {
  let event = "message";
  let data = "";

  for (const rawLine of chunk.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
      continue;
    }
    if (line.startsWith("data:")) {
      data += line.slice(5).trim();
    }
  }

  if (!data) return;
  let payload: any;
  try {
    payload = JSON.parse(data);
  } catch {
    return;
  }

  if (event === "start") {
    handlers.onStart?.(payload);
  } else if (event === "token") {
    handlers.onToken?.(payload);
  } else if (event === "done") {
    handlers.onDone?.(payload);
  } else if (event === "error") {
    handlers.onError?.(payload);
  }
}

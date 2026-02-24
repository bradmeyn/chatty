export const CHAT_ROLE_VALUES = ["USER", "ASSISTANT", "SYSTEM"] as const;

export type ChatRole = (typeof CHAT_ROLE_VALUES)[number];

export interface Chat {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  createdById: string | null;
}

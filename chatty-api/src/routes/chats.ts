import { Hono } from "hono";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import { and, desc, eq } from "drizzle-orm";
import { requireAuthContext, type AppEnv } from "../middleware/auth-context.js";
import { chatMessages, chats } from "../models/chat.js";
import { db } from "../db/index.js";

type ChatRecord = typeof chats.$inferSelect;
type MessageRecord = typeof chatMessages.$inferSelect;
const openai = new OpenAI();
const openaiModel = process.env.OPENAI_MODEL ?? "gpt-5";

const chatCreateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional().nullable(),
});

const messageCreateSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});
const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);

export const chatsRouter = new Hono<AppEnv>();
chatsRouter.use("*", requireAuthContext);

chatsRouter.get("/", async (c) => {
  const context = c.get("authContext");
  const rows = await db
    .select({
      id: chats.id,
      title: chats.title,
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt,
      createdById: chats.createdById,
    })
    .from(chats)
    .where(eq(chats.createdById, context.userId))
    .orderBy(desc(chats.updatedAt));

  return c.json(
    rows.map((chat) => ({
      ...chat,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    }))
  );
});

chatsRouter.post("/", async (c) => {
  const context = c.get("authContext");
  const payload = await c.req.json();
  const data = chatCreateSchema.parse(payload);
  const [chat] = await db
    .insert(chats)
    .values({
      id: randomUUID(),
      title: data.title ?? null,
      createdById: context.userId,
    })
    .returning({
      id: chats.id,
      title: chats.title,
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt,
      createdById: chats.createdById,
    });

  return c.json(
    {
      ...chat,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    },
    201
  );
});

chatsRouter.get("/:id", async (c) => {
  const context = c.get("authContext");
  const id = c.req.param("id");
  const [chat] = await db
    .select({
      id: chats.id,
      title: chats.title,
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt,
      createdById: chats.createdById,
    })
    .from(chats)
    .where(and(eq(chats.id, id), eq(chats.createdById, context.userId)));

  if (!chat) {
    return c.json({ error: "Chat not found" }, 404);
  }

  return c.json({
    ...chat,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  });
});

chatsRouter.get("/:id/messages", async (c) => {
  const context = c.get("authContext");
  const chatId = c.req.param("id");
  const [chat] = await db
    .select({ id: chats.id })
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.createdById, context.userId)));
  if (!chat) {
    return c.json({ error: "Chat not found" }, 404);
  }

  const rows = await db
    .select({
      id: chatMessages.id,
      chatId: chatMessages.chatId,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
      createdById: chatMessages.createdById,
    })
    .from(chatMessages)
    .where(eq(chatMessages.chatId, chatId))
    .orderBy(chatMessages.createdAt);

  return c.json(
    rows.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    }))
  );
});

chatsRouter.post("/:id/messages", async (c) => {
  const context = c.get("authContext");
  const chatId = c.req.param("id");
  const [chat] = await db
    .select({ id: chats.id })
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.createdById, context.userId)));
  if (!chat) {
    return c.json({ error: "Chat not found" }, 404);
  }

  const payload = await c.req.json();
  const { content } = messageCreateSchema.parse(payload);
  const [userMessage] = await db
    .insert(chatMessages)
    .values({
      id: randomUUID(),
      chatId,
      role: "USER",
      content,
      createdById: context.userId,
    })
    .returning({
      id: chatMessages.id,
      chatId: chatMessages.chatId,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
      createdById: chatMessages.createdById,
    });

  const recentHistory = await db
    .select({
      id: chatMessages.id,
      chatId: chatMessages.chatId,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
      createdById: chatMessages.createdById,
    })
    .from(chatMessages)
    .where(eq(chatMessages.chatId, chatId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(12);

  const assistantContent = await generateAssistantReply(
    recentHistory.slice().reverse()
  );

  const [assistantMessage] = await db
    .insert(chatMessages)
    .values({
      id: randomUUID(),
      chatId,
      role: "ASSISTANT",
      content: assistantContent,
      createdById: null,
    })
    .returning({
      id: chatMessages.id,
      chatId: chatMessages.chatId,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
      createdById: chatMessages.createdById,
    });

  await db
    .update(chats)
    .set({ updatedAt: new Date() })
    .where(eq(chats.id, chatId));

  return c.json(
    {
      userMessage: {
        ...userMessage,
        createdAt: userMessage.createdAt.toISOString(),
      },
      assistantMessage: {
        ...assistantMessage,
        createdAt: assistantMessage.createdAt.toISOString(),
      },
    },
    201
  );
});

chatsRouter.post("/:id/messages/stream", async (c) => {
  const context = c.get("authContext");
  const chatId = c.req.param("id");
  const [chat] = await db
    .select({ id: chats.id })
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.createdById, context.userId)));
  if (!chat) {
    return c.json({ error: "Chat not found" }, 404);
  }

  const payload = await c.req.json();
  const { content } = messageCreateSchema.parse(payload);

  const [userMessage] = await db
    .insert(chatMessages)
    .values({
      id: randomUUID(),
      chatId,
      role: "USER",
      content,
      createdById: context.userId,
    })
    .returning({
      id: chatMessages.id,
      chatId: chatMessages.chatId,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
      createdById: chatMessages.createdById,
    });

  const recentHistory = await db
    .select({
      id: chatMessages.id,
      chatId: chatMessages.chatId,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
      createdById: chatMessages.createdById,
    })
    .from(chatMessages)
    .where(eq(chatMessages.chatId, chatId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(12);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start: (controller) => {
      const send = (event: string, data: unknown) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      (async () => {
        send("start", {
          userMessage: {
            ...userMessage,
            createdAt: userMessage.createdAt.toISOString(),
          },
        });

        let assistantText = "";
        try {
          if (!hasOpenAiKey) {
            assistantText = generateFallbackAssistantReply(
              recentHistory.slice().reverse()
            );
            emitTokenChunks(send, assistantText);
          } else {
            const stream = await openai.chat.completions.create({
              model: openaiModel,
              messages: buildOpenAiMessages(recentHistory.slice().reverse()),
              stream: true,
            });

            for await (const chunk of stream) {
              const delta = chunk.choices[0]?.delta?.content ?? "";
              if (!delta) continue;
              assistantText += delta;
              send("token", { delta });
            }
          }
        } catch (error) {
          console.error("OpenAI stream error:", error);
          assistantText = generateFallbackAssistantReply(
            recentHistory.slice().reverse()
          );
          emitTokenChunks(send, assistantText);
        }

        const finalText = assistantText.trim()
          ? assistantText.trim()
          : "I couldn't generate a reply.";

        const [assistantMessage] = await db
          .insert(chatMessages)
          .values({
            id: randomUUID(),
            chatId,
            role: "ASSISTANT",
            content: finalText,
            createdById: null,
          })
          .returning({
            id: chatMessages.id,
            chatId: chatMessages.chatId,
            role: chatMessages.role,
            content: chatMessages.content,
            createdAt: chatMessages.createdAt,
            createdById: chatMessages.createdById,
          });

        await db
          .update(chats)
          .set({ updatedAt: new Date() })
          .where(eq(chats.id, chatId));

        send("done", {
          assistantMessage: {
            ...assistantMessage,
            createdAt: assistantMessage.createdAt.toISOString(),
          },
        });
        controller.close();
      })();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
});

async function generateAssistantReply(history: MessageRecord[]) {
  const lastUserMessage = [...history].reverse().find((msg) => msg.role === "USER");
  const trimmed = lastUserMessage?.content.trim();
  if (!trimmed) {
    return "Ask me anything.";
  }

  if (!hasOpenAiKey) {
    return generateFallbackAssistantReply(history);
  }

  const messages = buildOpenAiMessages(history);

  try {
    const response = await openai.chat.completions.create({
      model: openaiModel,
      messages,
    });

    return response.choices[0]?.message?.content?.trim() || "I couldn't generate a reply.";
  } catch (error) {
    console.error("OpenAI response error:", error);
    return generateFallbackAssistantReply(history);
  }
}

function generateFallbackAssistantReply(history: MessageRecord[]) {
  const lastUserMessage = [...history].reverse().find((msg) => msg.role === "USER");
  const prompt = lastUserMessage?.content.trim();
  if (!prompt) {
    return "Ask me anything and I'll help with a quick plan.";
  }

  const compactPrompt = prompt.replace(/\s+/g, " ");
  const lower = compactPrompt.toLowerCase();

  if (lower.includes("checklist") || lower.includes("plan") || lower.includes("roadmap")) {
    return [
      "Here is a practical starting plan:",
      "1. Define the outcome in one sentence.",
      "2. List 3-5 tasks in priority order.",
      "3. Pick the first task you can finish today.",
      "4. Note blockers and who owns each blocker.",
      "5. Set a quick review point for tomorrow.",
      "",
      `If helpful, I can turn "${compactPrompt.slice(0, 80)}" into a detailed checklist.`,
    ].join("\n");
  }

  if (lower.includes("email") || lower.includes("message") || lower.includes("reply")) {
    return [
      "Draft:",
      "",
      "Hi team,",
      "",
      `${compactPrompt.charAt(0).toUpperCase()}${compactPrompt.slice(1)}.`,
      "",
      "Please share feedback and any blockers by end of day.",
      "",
      "Thanks,",
    ].join("\n");
  }

  if (lower.includes("bug") || lower.includes("error") || lower.includes("fix") || lower.includes("debug")) {
    return [
      "Quick debug flow:",
      "1. Reproduce the issue with exact steps.",
      "2. Capture logs and the failing input.",
      "3. Isolate the smallest failing component.",
      "4. Add a test that fails first.",
      "5. Apply fix, rerun tests, and document root cause.",
    ].join("\n");
  }

  return [
    "I can help with that. Here is a concise first pass:",
    `- Goal: ${compactPrompt.slice(0, 160)}${compactPrompt.length > 160 ? "..." : ""}`,
    "- Suggested next step: define the exact outcome and constraints.",
    "- Then: break it into 3 concrete actions and do action #1 now.",
    "",
    "If you share more detail, I can make this specific.",
  ].join("\n");
}

function emitTokenChunks(
  send: (event: string, data: unknown) => void,
  text: string
) {
  for (const delta of text.split(/(\s+)/).filter(Boolean)) {
    send("token", { delta });
  }
}

function buildOpenAiMessages(
  history: MessageRecord[]
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const base: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are Chatty, a concise, helpful assistant. Keep replies short and useful.",
    },
  ];

  const mapped = history.slice(-12).map((message) => {
    const role =
      message.role === "USER"
        ? "user"
        : message.role === "SYSTEM"
          ? "system"
          : "assistant";
    return {
      role,
      content: message.content,
    } satisfies OpenAI.Chat.Completions.ChatCompletionMessageParam;
  });

  return base.concat(mapped);
}

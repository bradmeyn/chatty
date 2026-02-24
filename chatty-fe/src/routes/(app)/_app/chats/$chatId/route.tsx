import { createFileRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import { getChat } from "@/lib/features/chats/service";
import type { Chat } from "@/lib/features/chats/types";

export const Route = createFileRoute("/(app)/_app/chats/$chatId")({
  component: ChatLayout,
  loader: async ({ params: { chatId }, context: { queryClient } }) => {
    const chat = await queryClient.fetchQuery({
      queryKey: ["chat", chatId],
      queryFn: () => getChat(chatId),
    });
    return chat;
  },
});

function ChatLayout() {
  const chat = useLoaderData({ from: Route.id }) as Chat;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-[#1a1a1a]">
        <span>{chat.title || "Untitled chat"}</span>
      </div>
      <Outlet />
    </div>
  );
}

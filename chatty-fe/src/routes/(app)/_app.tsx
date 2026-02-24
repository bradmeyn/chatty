import { Outlet, createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@components/ui/button";
import { MessageSquareText, Plus, LogOut } from "lucide-react";
import { redirect } from "@tanstack/react-router";
import { useAuth } from "@auth/context";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getChats } from "@/lib/features/chats/service";
import type { Chat } from "@/lib/features/chats/types";

export const Route = createFileRoute("/(app)/_app")({
  component: ProtectedLayout,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  // Optional: Show loading state while auth is being determined
  pendingComponent: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  ),
});

export default function ProtectedLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login", search: { redirect: undefined }, replace: true });
  };
  const { data: chats } = useQuery<Chat[], Error>({
    queryKey: ["chats"],
    queryFn: () => getChats(),
    staleTime: 60 * 1000,
  });
  // Show loading state while auth is being determined

  return (
    <div className="flex h-screen bg-[#f7f3ec] text-[#1a1a1a]">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-[#f7f3ec] border-r border-black/5">
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f766e] text-white">
              <MessageSquareText size={18} />
            </div>
            <span className="text-lg">Chatty</span>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-auto py-4 px-2">
          <div className="px-2">
            <Button
              className="w-full bg-[#0f766e] hover:bg-[#115e59]"
              onClick={() => navigate({ to: "/chats/new" })}>
              <Plus size={16} className="mr-2" />
              New chat
            </Button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between px-3 mb-3 text-xs text-muted-foreground">
              <span className="font-medium">Recent chats</span>
              <button
                type="button"
                className="hover:text-foreground"
                onClick={() => navigate({ to: "/chats" })}>
                View all
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {(chats ?? []).slice(0, 6).map((chat) => (
                <SidebarLink
                  key={chat.id}
                  to={`/chats/${chat.id}`}
                  label={chat.title || "Untitled chat"}
                />
              ))}
              {!chats?.length ? (
                <span className="px-3 text-xs text-muted-foreground">
                  No chats yet.
                </span>
              ) : null}
            </nav>
          </div>
        </div>
        <div className="px-4 py-4 border-t border-black/5">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-[#f3f1ed] transition">
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto max-w-[72rem] mx-auto w-full px-10 lg:px-24 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 py-2 px-3 rounded-md transition-colors "
      activeProps={{
        className: "bg-[#f3f1ed] text-[#0f766e] font-semibold",
      }}
      inactiveProps={{
        className: "text-muted-foreground hover:text-foreground",
      }}>
      <span className="text-sm">{label}</span>
    </Link>
  );
}

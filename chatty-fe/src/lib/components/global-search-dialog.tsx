import { Button } from "@components/ui/button";
import { MessageSquare, Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";

export default function SearchDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const chats = [
    { id: "1", name: "Onboarding ideas" },
    { id: "2", name: "Feature brainstorming" },
    { id: "3", name: "Release checklist" },
    { id: "4", name: "Customer support" },
  ];

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search chats..." />
        <CommandList>
          <CommandEmpty>No chats found.</CommandEmpty>
          <CommandGroup heading="Chats">
            {chats.map((chat) => (
              <CommandItem
                key={chat.id}
                onSelect={() => {
                  // Handle chat selection
                  setOpen(false);
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>{chat.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

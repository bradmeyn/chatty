import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { cn } from "@/lib/utils/shadcn";
import { ArrowUp, Loader2 } from "lucide-react";

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  error?: string;
  className?: string;
};

export default function ChatComposer({
  value,
  onChange,
  onSubmit,
  placeholder = "Message Chatty...",
  disabled = false,
  isSubmitting = false,
  error,
  className,
}: ChatComposerProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className={cn("space-y-2", className)}
    >
      <div className="flex items-center rounded-3xl border border-black/10 bg-[#ecebea] px-3 py-3 shadow-sm">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-14 border-0 bg-[#ecebea] px-5 text-xl shadow-none focus-visible:ring-0"
        />
        <Button
          type="submit"
          size="icon"
          className="h-14 w-14 rounded-2xl bg-[#0f766e] text-white hover:bg-[#115e59]"
          disabled={disabled || !value.trim()}
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ArrowUp size={18} />
          )}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}

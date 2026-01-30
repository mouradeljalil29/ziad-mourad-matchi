import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatchMessages, useSendMatchMessage } from "@/hooks/useMatchMessages";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchConversationSheetProps {
  matchId: string | undefined;
  partnerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchConversationSheet({
  matchId,
  partnerName,
  open,
  onOpenChange,
}: MatchConversationSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: messages, isLoading, isError } = useMatchMessages(
    open ? matchId : undefined
  );
  const sendMessage = useSendMatchMessage(matchId);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current && messages && messages.length > 0) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length]);

  // Auto-focus input when sheet opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;

    setDraft("");

    try {
      await sendMessage.mutateAsync(text);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Impossible d'envoyer le message";
      toast({
        title: "Erreur",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-md p-0">
        <SheetHeader className="px-6 pt-6 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            {partnerName}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {isError ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <p className="text-sm">
                La messagerie n'est pas encore disponible.
              </p>
              <p className="text-xs mt-1">
                La table de messages doit etre creee dans Supabase.
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn("h-10 rounded-2xl", i % 2 === 0 ? "w-3/4" : "w-2/3 ml-auto")}
                />
              ))}
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => {
              const isMe = msg.from_user_id === user?.id;
              const isOptimistic = msg.id.startsWith("temp-");
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md",
                      isOptimistic && "opacity-70"
                    )}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {isOptimistic ? "Envoi..." : formatTime(msg.created_at)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <MessageCircle className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Aucun message pour le moment.</p>
              <p className="text-xs mt-1">Envoyez le premier message !</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t p-4 flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Votre message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={2000}
            disabled={isError}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!draft.trim() || isError}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

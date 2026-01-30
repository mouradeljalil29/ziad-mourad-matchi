import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMatchMessages, useSendMatchMessage } from "@/hooks/useMatchMessages";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MatchConversationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string | null;
  partnerName: string;
}

export function MatchConversationSheet({
  open,
  onOpenChange,
  matchId,
  partnerName,
}: MatchConversationSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useMatchMessages(
    open && matchId ? matchId : undefined
  );
  const sendMessage = useSendMatchMessage(matchId ?? undefined);

  useEffect(() => {
    if (open && messages && messages.length > 0) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages?.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !matchId) return;
    try {
      await sendMessage.mutateAsync(text);
      setDraft("");
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      toast({
        title: "Erreur",
        description:
          err instanceof Error ? err.message : "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-md p-0"
      >
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="text-left">
            Messagerie — {partnerName}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea
          ref={scrollRef}
          className="flex-1 px-4 py-3"
          style={{ maxHeight: "calc(100vh - 180px)" }}
        >
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-2/3 ml-auto" />
              <Skeleton className="h-12 w-4/5" />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="text-sm">Aucun message pour l’instant.</p>
              <p className="text-xs mt-1">Envoyez le premier message.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {messages.map((msg) => {
                const isMe = msg.from_user_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      isMe ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-3 py-2 text-sm break-words",
                        isMe
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {msg.text}
                    </div>
                    <span
                      className={cn(
                        "text-xs text-muted-foreground mt-0.5",
                        isMe ? "text-right" : "text-left"
                      )}
                    >
                      {msg.created_at
                        ? format(
                            new Date(msg.created_at),
                            "dd MMM à HH:mm",
                            { locale: fr }
                          )
                        : ""}
                    </span>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-3 flex gap-2">
          <Input
            placeholder="Écrire un message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            maxLength={2000}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!draft.trim() || sendMessage.isPending}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

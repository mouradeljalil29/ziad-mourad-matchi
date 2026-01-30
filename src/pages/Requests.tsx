import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillBadge } from "@/components/ui/skill-badge";
import { 
  useIncomingRequests, 
  useOutgoingRequests, 
  useUpdateRequestStatus 
} from "@/hooks/useMatchRequests";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { 
  Check, 
  X, 
  Clock, 
  Inbox, 
  Send,
  MessageCircle
} from "lucide-react";

export default function Requests() {
  const { toast } = useToast();
  const { data: incoming, isLoading: incomingLoading } = useIncomingRequests();
  const { data: outgoing, isLoading: outgoingLoading } = useOutgoingRequests();
  const updateStatus = useUpdateRequestStatus();

  const handleAccept = async (requestId: string, name: string) => {
    try {
      await updateStatus.mutateAsync({ requestId, status: "accepted" });
      toast({
        title: "Request accepted!",
        description: `You're now matched with ${name}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await updateStatus.mutateAsync({ requestId, status: "declined" });
      toast({
        title: "Request declined",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to decline request",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await updateStatus.mutateAsync({ requestId, status: "canceled" });
      toast({
        title: "Request canceled",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel request",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Requests</h1>
          <p className="text-muted-foreground">
            Manage your incoming and outgoing match requests
          </p>
        </div>

        <Tabs defaultValue="incoming" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming" className="gap-2">
              <Inbox className="h-4 w-4" />
              Incoming
              {incoming && incoming.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {incoming.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="gap-2">
              <Send className="h-4 w-4" />
              Outgoing
              {outgoing && outgoing.length > 0 && (
                <span className="ml-1 rounded-full bg-muted-foreground px-2 py-0.5 text-xs text-primary-foreground">
                  {outgoing.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-4">
            {incomingLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)
            ) : incoming && incoming.length > 0 ? (
              incoming.map((request) => (
                <Card key={request.id} className="animate-fade-in">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-lg shrink-0">
                          {request.from_profile?.display_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="space-y-1">
                          <Link
                            to={`/profile/${request.from_profile?.id}`}
                            className="font-semibold text-lg hover:text-primary transition-colors"
                          >
                            {request.from_profile?.display_name || "Unknown"}
                          </Link>
                          <div className="flex flex-wrap gap-1">
                            {request.from_profile?.skills?.slice(0, 4).map((skill) => (
                              <SkillBadge key={skill} skill={skill} />
                            ))}
                          </div>
                          {request.message && (
                            <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground bg-muted p-2 rounded-lg">
                              <MessageCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              <p>{request.message}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-col">
                        <Button
                          onClick={() =>
                            handleAccept(request.id, request.from_profile?.display_name || "")
                          }
                          disabled={updateStatus.isPending}
                          className="gap-2 bg-success hover:bg-success/90"
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleDecline(request.id)}
                          disabled={updateStatus.isPending}
                          variant="outline"
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No incoming requests</h3>
                <p className="text-muted-foreground">
                  When someone wants to match with you, their request will appear here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="space-y-4">
            {outgoingLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)
            ) : outgoing && outgoing.length > 0 ? (
              outgoing.map((request) => (
                <Card key={request.id} className="animate-fade-in">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent text-accent-foreground font-bold text-lg shrink-0">
                          {request.to_profile?.display_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="space-y-1">
                          <Link
                            to={`/profile/${request.to_profile?.id}`}
                            className="font-semibold text-lg hover:text-primary transition-colors"
                          >
                            {request.to_profile?.display_name || "Unknown"}
                          </Link>
                          <div className="flex flex-wrap gap-1">
                            {request.to_profile?.skills?.slice(0, 4).map((skill) => (
                              <SkillBadge key={skill} skill={skill} />
                            ))}
                          </div>
                          {request.message && (
                            <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground bg-muted p-2 rounded-lg">
                              <MessageCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              <p>{request.message}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Sent {new Date(request.created_at).toLocaleDateString()}
                            <span className="rounded-full bg-warning/20 text-warning px-2 py-0.5 font-medium">
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCancel(request.id)}
                        disabled={updateStatus.isPending}
                        variant="outline"
                        className="gap-2 shrink-0"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No outgoing requests</h3>
                <p className="text-muted-foreground">
                  Requests you send to other students will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

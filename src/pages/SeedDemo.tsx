import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, ArrowLeft } from "lucide-react";

export default function SeedDemo() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSeed = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-demo", {
        body: {},
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: "Demo data created",
        description: data?.message ?? "8–12 demo profiles have been added.",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create demo data";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Create demo data
            </CardTitle>
            <CardDescription>
              Creates 8–12 demo profiles with realistic skills and
              availabilities. Only available in development/demo mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSeed}
              disabled={loading}
              className="gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create demo data
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Requires the <code className="rounded bg-muted px-1">seed-demo</code> Edge
              Function to be deployed with a service role key.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

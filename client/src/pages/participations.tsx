import { useMemo } from "react";
import { useParticipations } from "@/hooks/use-participations";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Calendar, Clock, Award } from "lucide-react";

export default function ParticipationsPage() {
  const [, setLocation] = useLocation();
  const { data: participations, isLoading } = useParticipations();

  const items = useMemo(() => participations || [], [participations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">My Submissions</h1>
          <p className="text-muted-foreground">
            A list of all events you have participated in.
          </p>
        </div>
        <Button onClick={() => setLocation("/participations/new")}>
          <Plus className="w-4 h-4 mr-2" />
          New Submission
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participation History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading submissions...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No submissions yet. Click "New Submission" to add your first one.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((p) => (
                <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{p.eventName}</h3>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Submitted {format(new Date(p.submittedAt), "PPP")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {p.durationDays || 1} day(s)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {p.role}
                      </span>
                    </div>
                    {p.achievement && (
                      <p className="text-sm text-muted-foreground">Achievement: {p.achievement}</p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Proofs: {p.proofs?.length || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-500 hover:bg-green-600",
    rejected: "bg-red-500 hover:bg-red-600",
    pending: "bg-amber-500 hover:bg-amber-600",
  };
  return (
    <Badge className={`${map[status] || "bg-slate-500"} text-white`}>
      {status.toUpperCase()}
    </Badge>
  );
}

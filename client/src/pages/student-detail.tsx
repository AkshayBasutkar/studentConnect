import { useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { useStudents } from "@/hooks/use-students";
import { useParticipations } from "@/hooks/use-participations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Calendar, Clock, Award } from "lucide-react";

export default function StudentDetailPage() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const studentId = Number(id);

  const { data: students, isLoading: isStudentsLoading } = useStudents();
  const { data: participations, isLoading: isPartsLoading } = useParticipations({
    studentId: Number.isNaN(studentId) ? undefined : studentId,
  });

  const student = useMemo(
    () => students?.find((s) => s.id === studentId),
    [students, studentId]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/students")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">Student Profile</h1>
          <p className="text-muted-foreground">View submissions by this student.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isStudentsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading student...
            </div>
          ) : !student ? (
            <div className="text-muted-foreground">Student not found.</div>
          ) : (
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/10">
                <AvatarImage src={student.profilePhotoUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {student.user.firstName[0]}
                  {student.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">
                  {student.user.firstName} {student.user.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {student.usn} • {student.department}
                </div>
                <div className="mt-1 flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Year {student.year}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Sem {student.semester}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {student.batch}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isPartsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading submissions...
            </div>
          ) : !participations || participations.length === 0 ? (
            <div className="text-muted-foreground">No submissions found.</div>
          ) : (
            <div className="space-y-4">
              {participations.map((p) => (
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

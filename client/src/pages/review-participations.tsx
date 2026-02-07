import { useState } from "react";
import { useParticipations, useReviewParticipation } from "@/hooks/use-participations";
import { format } from "date-fns";
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  FileText, 
  ExternalLink, 
  Clock,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ReviewParticipationsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const { data: participations, isLoading } = useParticipations({ 
    status: activeTab as any 
  });
  
  const selectedParticipation = participations?.find(p => p.id === selectedId);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Submission Reviews</h1>
        <p className="text-muted-foreground">Validate student participation proofs and provide feedback.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden">
        {/* Left List */}
        <div className="md:col-span-4 lg:col-span-5 flex flex-col bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="flex flex-col p-2 gap-2">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : participations?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No {activeTab} submissions found.
                </div>
              ) : (
                participations?.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`
                      text-left p-4 rounded-lg transition-all border
                      ${selectedId === p.id 
                        ? "bg-primary/5 border-primary/20 shadow-sm" 
                        : "hover:bg-muted/50 border-transparent hover:border-border"
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm line-clamp-1">{p.eventName}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(p.submittedAt), "MMM d")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">ST</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">Student ID: {p.studentId}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px] py-0 h-5 font-normal">
                        {p.role}
                      </Badge>
                      {p.proofs.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] py-0 h-5 font-normal">
                          {p.proofs.length} Proofs
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Details Panel */}
        <div className="md:col-span-8 lg:col-span-7 flex flex-col h-full overflow-hidden">
          {selectedParticipation ? (
            <ReviewDetails participation={selectedParticipation} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-muted/10 rounded-xl border border-dashed border-border p-8 text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Select a submission</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Click on a submission from the list to view details and take action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewDetails({ participation }: { participation: any }) {
  const reviewMutation = useReviewParticipation();
  const [feedback, setFeedback] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const handleApprove = () => {
    reviewMutation.mutate({ id: participation.id, status: "approved" });
  };

  const handleReject = () => {
    reviewMutation.mutate({ 
      id: participation.id, 
      status: "rejected",
      feedback 
    });
    setIsRejectDialogOpen(false);
  };

  return (
    <Card className="h-full flex flex-col border border-border/60 shadow-md overflow-hidden">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold font-display">{participation.eventName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <User className="w-3.5 h-3.5" /> Student ID: {participation.studentId}
              <span>•</span>
              <Clock className="w-3.5 h-3.5" /> Submitted {format(new Date(participation.submittedAt), "PPP p")}
            </CardDescription>
          </div>
          <Badge className={`
            ${participation.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}
            ${participation.status === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''}
            ${participation.status === 'pending' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          `}>
            {participation.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
              <p className="font-medium">{participation.role}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Achievement</label>
              <p className="font-medium">{participation.achievement || "None listed"}</p>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
              <p className="text-sm mt-1 leading-relaxed bg-muted/30 p-3 rounded-lg border">
                {participation.description || "No description provided."}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Attached Proofs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {participation.proofs.map((proof: any) => (
                <a 
                  key={proof.id} 
                  href={proof.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{proof.fileName}</p>
                    <p className="text-xs text-muted-foreground">{proof.fileType}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {participation.status === 'pending' && (
        <CardFooter className="border-t p-4 bg-muted/10 gap-3 justify-end">
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <XCircle className="w-4 h-4" /> Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Submission</DialogTitle>
                <DialogDescription>
                  Please provide a reason for rejecting this submission. The student will be notified.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <label className="text-sm font-medium mb-2 block">Reason for Rejection</label>
                <Textarea 
                  placeholder="e.g. Proof document is blurry or invalid..." 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleReject} disabled={!feedback}>Confirm Rejection</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            className="gap-2 bg-green-600 hover:bg-green-700 text-white" 
            onClick={handleApprove}
            disabled={reviewMutation.isPending}
          >
            <CheckCircle className="w-4 h-4" /> Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

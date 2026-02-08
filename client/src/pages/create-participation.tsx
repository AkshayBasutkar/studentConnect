import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useEvents } from "@/hooks/use-events";
import { useCreateParticipation } from "@/hooks/use-participations";
import { useCreateMyStudentProfile } from "@/hooks/use-users";
import { useLocation } from "wouter";
import { useUpload } from "@/hooks/use-upload";
import { ObjectUploader } from "@/components/ObjectUploader";
import { 
  Loader2, 
  Upload, 
  FileCheck, 
  ArrowLeft,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CreateParticipationPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: events } = useEvents();
  const createParticipation = useCreateParticipation();
  const createMyStudentProfile = useCreateMyStudentProfile();
  const { getUploadParameters } = useUpload();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    eventId: "",
    eventName: "",
    role: "Participant",
    achievement: "",
    description: "",
    durationDays: 1,
  });

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [profileData, setProfileData] = useState({
    usn: "",
    department: "",
    year: 1,
    semester: 1,
    batch: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.eventId && !formData.eventName) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select an event or enter an event name.",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "Proof Required",
        description: "Please upload at least one proof of participation.",
      });
      return;
    }

    createParticipation.mutate({
      eventId: formData.eventId ? parseInt(formData.eventId) : undefined,
      eventName: formData.eventName || events?.find(e => e.id === parseInt(formData.eventId))?.title || "",
      role: formData.role,
      achievement: formData.achievement,
      description: formData.description,
      durationDays: Number(formData.durationDays),
      proofs: uploadedFiles.map(file => ({
        fileName: file.name,
        fileUrl: file.url,
        fileType: file.type,
        fileSize: file.size,
      })),
    }, {
      onSuccess: () => setLocation("/participations")
    });
  };

  const handleUploadComplete = (result: any) => {
    // Transform Uppy result to our format
    const newFiles = result.successful.map((file: any) => ({
      name: file.name,
      url: file.uploadURL,
      type: file.type,
      size: file.size,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMyStudentProfile.mutate({
      usn: profileData.usn,
      department: profileData.department,
      year: Number(profileData.year),
      semester: Number(profileData.semester),
      batch: profileData.batch,
    });
  };

  if (user?.role === "student" && !user?.student) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/participations")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">Complete Your Profile</h1>
            <p className="text-muted-foreground">Please complete your student profile before submitting participation.</p>
          </div>
        </div>

        <Card className="border border-border/50 shadow-md">
          <form onSubmit={handleProfileSubmit}>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>USN *</Label>
                <Input
                  placeholder="1CR18CS001"
                  value={profileData.usn}
                  onChange={(e) => setProfileData({ ...profileData, usn: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Department *</Label>
                <Input
                  placeholder="Computer Science"
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="4"
                    value={profileData.year}
                    onChange={(e) => setProfileData({ ...profileData, year: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Semester *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={profileData.semester}
                    onChange={(e) => setProfileData({ ...profileData, semester: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Batch *</Label>
                <Input
                  placeholder="2022-2026"
                  value={profileData.batch}
                  onChange={(e) => setProfileData({ ...profileData, batch: e.target.value })}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4 p-6 bg-muted/20 border-t">
              <Button type="button" variant="outline" onClick={() => setLocation("/participations")}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMyStudentProfile.isPending}>
                {createMyStudentProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/participations")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">Submit Participation</h1>
          <p className="text-muted-foreground">Upload proofs and details for your activity.</p>
        </div>
      </div>

      <Card className="border border-border/50 shadow-md">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Activity Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Event (Optional)</Label>
                  <Select 
                    value={formData.eventId} 
                    onValueChange={(val) => setFormData({...formData, eventId: val, eventName: ""})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose from campus events" />
                    </SelectTrigger>
                    <SelectContent>
                      {events?.map(event => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Event Name (If manual entry)</Label>
                  <Input 
                    placeholder="e.g. Hackathon 2024" 
                    value={formData.eventName}
                    onChange={(e) => setFormData({...formData, eventName: e.target.value, eventId: ""})}
                    disabled={!!formData.eventId}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Your Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(val) => setFormData({...formData, role: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Participant">Participant</SelectItem>
                      <SelectItem value="Organizer">Organizer</SelectItem>
                      <SelectItem value="Volunteer">Volunteer</SelectItem>
                      <SelectItem value="Speaker">Speaker</SelectItem>
                      <SelectItem value="Winner">Winner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Duration (Days)</Label>
                  <Input 
                    type="number" 
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({...formData, durationDays: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Achievement / Outcome (Optional)</Label>
                <Input 
                  placeholder="e.g. Won 1st Prize, Completed Certification" 
                  value={formData.achievement}
                  onChange={(e) => setFormData({...formData, achievement: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Description & Reflection</Label>
                <Textarea 
                  placeholder="Describe your contribution and what you learned..." 
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold border-b pb-2">Evidence & Proofs</h3>
              
              <div className="bg-muted/30 p-6 rounded-xl border border-dashed border-border text-center">
                <ObjectUploader 
                  onGetUploadParameters={getUploadParameters}
                  onComplete={handleUploadComplete}
                  maxNumberOfFiles={5}
                >
                  <div className="flex flex-col items-center gap-2 cursor-pointer">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-primary font-medium hover:underline">Click to upload</span>
                      <span className="text-muted-foreground"> certificates or photos</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Max 10MB per file (JPG, PNG, PDF)</p>
                  </div>
                </ObjectUploader>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                          <FileCheck className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-4 p-6 bg-muted/20 border-t">
            <Button type="button" variant="outline" onClick={() => setLocation("/participations")}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="px-8 shadow-lg shadow-primary/20"
              disabled={createParticipation.isPending}
            >
              {createParticipation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Participation"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

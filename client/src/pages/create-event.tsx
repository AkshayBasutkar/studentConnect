import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateEvent } from "@/hooks/use-events";
import { useLocation } from "wouter";
import { useUpload } from "@/hooks/use-upload";
import { ObjectUploader } from "@/components/ObjectUploader";
import { 
  Calendar, 
  MapPin, 
  ArrowLeft,
  Loader2
} from "lucide-react";

interface UploadResult {
  successful: Array<{
    name: string;
    uploadURL: string;
    type: string;
    size: number;
  }>;
}

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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CreateEventPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const createEvent = useCreateEvent();
  const { getUploadParameters } = useUpload();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    venue: "",
    bannerUrl: "",
  });

  const [uploadedBanner, setUploadedBanner] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || 
        !formData.startDate || !formData.endDate || !formData.venue) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    createEvent.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      venue: formData.venue,
      bannerUrl: uploadedBanner || undefined,
    }, {
      onSuccess: () => {
        toast({
          title: "Event Created",
          description: "Your event has been posted successfully.",
        });
        setLocation("/events");
      }
    });
  };

  const handleUploadComplete = (result: UploadResult) => {
    if (result.successful.length > 0) {
      const file = result.successful[0];
      setUploadedBanner(file.uploadURL);
      toast({
        title: "Banner Uploaded",
        description: "Event banner has been uploaded successfully.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation("/events")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">Post New Event</h1>
          <p className="text-muted-foreground">Create and publish a new campus event.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Fill in the information about the event you want to post.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Annual Tech Fest 2024"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the event, its objectives, and what students can expect..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="venue"
                    placeholder="e.g., Main Auditorium"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date & Time *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Event Banner (Optional)</Label>
              <ObjectUploader
                onUploadComplete={handleUploadComplete}
                maxFiles={1}
                allowedFileTypes={['image/*']}
                note="Upload a banner image for the event (recommended size: 1200x600px)"
              />
              {uploadedBanner && (
                <div className="mt-2">
                  <img 
                    src={uploadedBanner} 
                    alt="Event banner preview" 
                    className="rounded-lg border max-h-48 object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation("/events")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createEvent.isPending}
              >
                {createEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

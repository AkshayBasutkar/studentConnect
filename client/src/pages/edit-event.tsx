import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEvent } from "@/hooks/use-events";
import { useUpload } from "@/hooks/use-upload";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { 
  Calendar, 
  MapPin, 
  ArrowLeft,
  Loader2
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: event, isLoading } = useEvent(Number(params.id));
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getUploadParameters } = useUpload();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    venue: "",
    bannerUrl: "",
    isPinned: false,
    isActive: true,
  });

  const [uploadedBanner, setUploadedBanner] = useState<string>("");

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        category: event.category,
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        venue: event.venue,
        bannerUrl: event.bannerUrl || "",
        isPinned: event.isPinned,
        isActive: event.isActive,
      });
      setUploadedBanner(event.bannerUrl || "");
    }
  }, [event]);

  const updateEvent = useMutation({
    mutationFn: async (eventData: any) => {
      const res = await fetch(`/api/events/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
        credentials: "include",
      });
      if (!res.ok) {
        let message = "Failed to update event";
        const text = await res.text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed?.message) message = parsed.message;
          } catch {
            message = text;
          }
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.events.get.path, Number(params.id)] });
      toast({
        title: "Event updated",
        description: "The event has been successfully updated.",
      });
      setLocation(`/events/${params.id}`);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update event",
        description: error.message,
      });
    },
  });

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

    // Validate date range
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end <= start) {
      toast({
        variant: "destructive",
        title: "Invalid Date Range",
        description: "End date must be after start date.",
      });
      return;
    }

    updateEvent.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      startDate: formData.startDate,
      endDate: formData.endDate,
      venue: formData.venue,
      bannerUrl: uploadedBanner || undefined,
      isPinned: formData.isPinned,
      isActive: formData.isActive,
    });
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      setUploadedBanner(file.uploadURL);
      toast({
        title: "Banner Uploaded",
        description: "Event banner has been uploaded successfully.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The event you're trying to edit doesn't exist.
          </p>
          <Button onClick={() => setLocation("/events")}>Back to Events</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation(`/events/${params.id}`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">Edit Event</h1>
          <p className="text-muted-foreground">Update event information.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Update the information about the event.</CardDescription>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
                />
                <Label htmlFor="isPinned" className="cursor-pointer">Pin this event</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive" className="cursor-pointer">Event is active</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Event Banner (Optional)</Label>
              <ObjectUploader
                onGetUploadParameters={getUploadParameters}
                onComplete={handleUploadComplete}
                maxNumberOfFiles={1}
                buttonClassName="w-full"
              >
                Upload Event Banner
              </ObjectUploader>
              {uploadedBanner && (
                <div className="mt-2">
                  <img 
                    src={uploadedBanner} 
                    alt="Event banner preview" 
                    className="rounded-lg border max-h-48 object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a banner image for the event (recommended size: 1200x600px)
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation(`/events/${params.id}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateEvent.isPending}
              >
                {updateEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

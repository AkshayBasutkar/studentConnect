import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEvent, useDeleteEvent } from "@/hooks/use-events";
import { format } from "date-fns";
import { 
  Calendar, 
  MapPin, 
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "wouter";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: event, isLoading } = useEvent(Number(params.id));
  const deleteEvent = useDeleteEvent();

  const isProctor = user?.role === "proctor" || user?.role === "admin";

  const handleDelete = () => {
    if (event) {
      deleteEvent.mutate(event.id, {
        onSuccess: () => {
          setLocation("/events");
        },
      });
    }
  };

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation("/events")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        {isProctor && (
          <div className="flex gap-2">
            <Link href={`/events/${event.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the event
                    and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Event
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Event Banner */}
      {event.bannerUrl ? (
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img 
            src={event.bannerUrl} 
            alt={event.title}
            className="w-full h-[400px] object-cover"
          />
        </div>
      ) : (
        <div className="h-[300px] rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/20" />
      )}

      {/* Event Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{event.category}</Badge>
                {event.isPinned && <Badge variant="secondary">Pinned</Badge>}
                {!event.isActive && <Badge variant="destructive">Inactive</Badge>}
              </div>
              <CardTitle className="text-3xl font-display mb-2">
                {event.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Start Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.startDate), "h:mm a")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">End Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.endDate), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.endDate), "h:mm a")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Venue</p>
                <p className="text-sm text-muted-foreground">{event.venue}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Posted By</p>
                <p className="text-sm text-muted-foreground">Event Organizer</p>
              </div>
            </div>
          </div>

          {user?.role === "student" && (
            <div className="pt-4 border-t">
              <Link href="/participations/new">
                <Button className="w-full sm:w-auto">
                  Submit Participation
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EventDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-[400px] w-full rounded-xl" />
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

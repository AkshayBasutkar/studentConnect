import { useState } from "react";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { format } from "date-fns";
import { 
  Calendar, 
  MapPin, 
  Search, 
  Plus, 
  Filter,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { data: events, isLoading } = useEvents({ 
    query: search, 
    category: category 
  });

  const isProctor = user?.role === "proctor" || user?.role === "admin";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Campus Events</h1>
          <p className="text-muted-foreground mt-1">Discover opportunities to participate and grow.</p>
        </div>
        
        {isProctor && (
          <Link href="/events/create">
            <Button className="shadow-md shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Post New Event
            </Button>
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            className="pl-9 border-border/60" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No events found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  return (
    <Card className="group overflow-hidden border border-border/60 hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden bg-muted">
        {/* Abstract pattern background based on category if no banner */}
        {event.bannerUrl ? (
          <img 
            src={event.bannerUrl} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getCategoryGradient(event.category)} group-hover:scale-105 transition-transform duration-500`} />
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-foreground backdrop-blur-sm shadow-sm hover:bg-white">
            {event.category}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
          {event.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(event.startDate), "MMM d, yyyy")} • {format(new Date(event.startDate), "h:mm a")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {event.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>{event.venue}</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link href={`/events/${event.id}`} className="w-full">
          <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
            View Details
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function getCategoryGradient(category: string) {
  switch (category.toLowerCase()) {
    case 'academic': return 'from-blue-500/20 to-indigo-500/20';
    case 'sports': return 'from-emerald-500/20 to-green-500/20';
    case 'cultural': return 'from-purple-500/20 to-pink-500/20';
    default: return 'from-gray-500/20 to-slate-500/20';
  }
}

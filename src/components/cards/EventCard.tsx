import { forwardRef } from "react";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  price: number;
  capacity: number;
  ticketsSold: number;
  imageUrl?: string | null;
  category: string;
  isFree: boolean;
}

const EventCard = forwardRef<HTMLDivElement, EventCardProps>(
  ({ id, title, description, eventDate, location, price, capacity, ticketsSold, imageUrl, category, isFree }, ref) => {
    const remainingTickets = capacity - ticketsSold;
    const isSoldOut = remainingTickets <= 0;

    return (
      <Card ref={ref} className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <Calendar className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute top-3 left-3" variant="secondary">
            {category}
          </Badge>
          {isFree && (
            <Badge className="absolute top-3 right-3 bg-green-500 text-white">
              Free
            </Badge>
          )}
          {isSoldOut && (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
              Sold Out
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {description}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(eventDate), "PPp")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{remainingTickets} spots left</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Ticket className="h-4 w-4 text-primary" />
            <span className="font-bold text-lg">
              {isFree ? "Free" : `KSh ${price.toLocaleString()}`}
            </span>
          </div>
          <Button asChild size="sm" disabled={isSoldOut}>
            <Link to={`/events/${id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
);

EventCard.displayName = "EventCard";

export default EventCard;

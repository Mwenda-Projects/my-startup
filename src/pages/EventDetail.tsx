import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  User,
} from "lucide-react";
import { format } from "date-fns";
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

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [ticketCount, setTicketCount] = useState(1);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: organizer } = useQuery({
    queryKey: ["organizer", event?.organizer_id],
    queryFn: async () => {
      if (!event?.organizer_id) return null;
      const { data, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("id", event.organizer_id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!event?.organizer_id,
  });

  const { data: existingRsvp } = useQuery({
    queryKey: ["rsvp", id, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id || !id) return null;
      const { data } = await supabase
        .from("event_rsvps")
        .select("*")
        .eq("event_id", id)
        .eq("user_id", session.user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!session?.user?.id && !!id,
  });

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !event) throw new Error("Not authenticated");
      
      const totalAmount = event.is_free ? 0 : Number(event.price) * ticketCount;
      
      const { error } = await supabase.from("event_rsvps").insert({
        event_id: event.id,
        user_id: session.user.id,
        ticket_count: ticketCount,
        total_amount: totalAmount,
        status: event.is_free ? "confirmed" : "pending",
        payment_status: event.is_free ? "completed" : "pending",
      });
      if (error) throw error;

      // Update tickets sold
      await supabase
        .from("events")
        .update({ tickets_sold: event.tickets_sold + ticketCount })
        .eq("id", event.id);
    },
    onSuccess: () => {
      toast.success(
        event?.is_free
          ? "RSVP confirmed!"
          : "Ticket reserved! Complete payment to confirm."
      );
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["rsvp", id] });
    },
    onError: (error) => {
      toast.error("Failed to RSVP: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No event ID");
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/events");
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-3/4" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <Button asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isOrganizer = session?.user?.id === event.organizer_id;
  const remainingTickets = event.capacity - event.tickets_sold;
  const isSoldOut = remainingTickets <= 0;
  const isPastEvent = new Date(event.event_date) < new Date();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/events")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-xl overflow-hidden h-64 md:h-96 bg-muted">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <Calendar className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              <Badge className="absolute top-4 left-4" variant="secondary">
                {event.category}
              </Badge>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{format(new Date(event.event_date), "PPPp")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              </div>
              <p className="text-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {organizer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Organized by</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    to={`/seller/${event.organizer_id}`}
                    className="flex items-center gap-3 hover:opacity-80"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {organizer.avatar_url ? (
                        <img
                          src={organizer.avatar_url}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <span className="font-medium">
                      {organizer.full_name || "Anonymous"}
                    </span>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {event.is_free
                        ? "Free"
                        : `KSh ${Number(event.price).toLocaleString()}`}
                    </span>
                  </div>
                  {event.is_free && (
                    <Badge className="bg-green-500 text-white">Free</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span>
                    {remainingTickets} of {event.capacity} spots available
                  </span>
                </div>

                {isPastEvent ? (
                  <Badge variant="outline" className="w-full justify-center py-2">
                    Event has ended
                  </Badge>
                ) : existingRsvp ? (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="font-medium text-green-600">You're attending!</p>
                    <p className="text-sm text-muted-foreground">
                      {existingRsvp.ticket_count} ticket(s) reserved
                    </p>
                  </div>
                ) : isOrganizer ? (
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to={`/events/${id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Event
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Event
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. All RSVPs will be
                            cancelled.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate()}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : session ? (
                  <div className="space-y-4">
                    {!event.is_free && (
                      <div className="space-y-2">
                        <Label htmlFor="tickets">Number of Tickets</Label>
                        <Input
                          id="tickets"
                          type="number"
                          min="1"
                          max={remainingTickets}
                          value={ticketCount}
                          onChange={(e) =>
                            setTicketCount(
                              Math.min(
                                parseInt(e.target.value) || 1,
                                remainingTickets
                              )
                            )
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          Total: KSh{" "}
                          {(Number(event.price) * ticketCount).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <Button
                      className="w-full"
                      disabled={isSoldOut || rsvpMutation.isPending}
                      onClick={() => rsvpMutation.mutate()}
                    >
                      {rsvpMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      {isSoldOut
                        ? "Sold Out"
                        : event.is_free
                        ? "RSVP Now"
                        : "Get Tickets"}
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/auth">Sign in to RSVP</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetail;

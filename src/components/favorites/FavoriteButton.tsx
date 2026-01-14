import { useState, useEffect, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  listingId: string;
  listingType: "item" | "service";
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "ghost" | "outline";
  className?: string;
}

const FavoriteButton = forwardRef<HTMLButtonElement, FavoriteButtonProps>(
  ({ listingId, listingType, size = "icon", variant = "ghost", className }, ref) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isToggling, setIsToggling] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
      checkFavoriteStatus();
    }, [listingId]);

    const checkFavoriteStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("listing_id", listingId)
          .eq("listing_type", listingType)
          .maybeSingle();

        if (error) throw error;
        setIsFavorited(!!data);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to save favorites",
          variant: "destructive"
        });
        return;
      }

      setIsToggling(true);
      try {
        if (isFavorited) {
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("listing_id", listingId)
            .eq("listing_type", listingType);

          if (error) throw error;
          setIsFavorited(false);
          toast({ title: "Removed from favorites" });
        } else {
          const { error } = await supabase
            .from("favorites")
            .insert({
              user_id: user.id,
              listing_id: listingId,
              listing_type: listingType
            });

          if (error) throw error;
          setIsFavorited(true);
          toast({ title: "Added to favorites" });
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast({
          title: "Error",
          description: "Failed to update favorites",
          variant: "destructive"
        });
      } finally {
        setIsToggling(false);
      }
    };

    if (isLoading) {
      return (
        <Button ref={ref} variant={variant} size={size} disabled className={cn("bg-background/80 backdrop-blur-sm", className)}>
          <Loader2 className="w-4 h-4 animate-spin" />
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        onClick={toggleFavorite}
        disabled={isToggling}
        className={cn(
          "bg-background/80 backdrop-blur-sm hover:bg-background",
          isFavorited ? "text-red-500 hover:text-red-600" : "",
          className
        )}
      >
        <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
      </Button>
    );
  }
);

FavoriteButton.displayName = "FavoriteButton";

export default FavoriteButton;

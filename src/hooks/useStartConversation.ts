import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StartConversationOptions {
  sellerId: string;
  listingId?: string;
  listingType?: "item" | "service" | "event";
}

export const useStartConversation = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const startConversation = async ({ sellerId, listingId, listingType }: StartConversationOptions) => {
    setIsLoading(true);
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to message sellers");
        navigate("/auth");
        return;
      }

      // Don't allow messaging yourself
      if (user.id === sellerId) {
        toast.error("You cannot message yourself");
        return;
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(participant_one.eq.${user.id},participant_two.eq.${sellerId}),and(participant_one.eq.${sellerId},participant_two.eq.${user.id})`)
        .maybeSingle();

      if (existingConversation) {
        // Navigate to existing conversation
        navigate(`/messages?conversation=${existingConversation.id}`);
        return;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from("conversations")
        .insert({
          participant_one: user.id,
          participant_two: sellerId,
          listing_id: listingId || null,
          listing_type: listingType || null,
        })
        .select("id")
        .single();

      if (error) throw error;

      navigate(`/messages?conversation=${newConversation.id}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return { startConversation, isLoading };
};

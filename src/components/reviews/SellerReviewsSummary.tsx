import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Star, User, Loader2, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface SellerReviewsSummaryProps {
  sellerId: string;
  sellerName?: string | null;
  maxReviews?: number;
}

const SellerReviewsSummary = ({ sellerId, sellerName, maxReviews = 3 }: SellerReviewsSummaryProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ average: 0, total: 0 });

  useEffect(() => {
    fetchReviews();
  }, [sellerId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer:reviewer_id (
            full_name,
            avatar_url
          )
        `)
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false })
        .limit(maxReviews);

      if (error) throw error;

      const typedData = (data || []) as unknown as Review[];
      setReviews(typedData);

      // Fetch total count and average
      const { data: statsData } = await supabase
        .from("seller_profiles")
        .select("average_rating, total_ratings")
        .eq("user_id", sellerId)
        .maybeSingle();

      if (statsData) {
        setStats({ 
          average: statsData.average_rating || 0, 
          total: statsData.total_ratings || 0 
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Seller Reviews
          </span>
          {stats.total > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              {stats.average.toFixed(1)} ({stats.total} reviews)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            No reviews yet
          </p>
        ) : (
          <>
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {review.reviewer?.avatar_url ? (
                    <img
                      src={review.reviewer.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {review.reviewer?.full_name || "Anonymous"}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground line-clamp-2 mt-0.5">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {stats.total > maxReviews && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                asChild
              >
                <Link to={`/seller/${sellerId}`}>
                  View all {stats.total} reviews
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerReviewsSummary;

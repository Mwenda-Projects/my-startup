import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Star, User, Loader2 } from "lucide-react";
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

interface SellerReviewsProps {
  sellerId: string;
}

const SellerReviews = ({ sellerId }: SellerReviewsProps) => {
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
        .limit(10);

      if (error) throw error;

      // Type assertion since Supabase returns unknown structure
      const typedData = (data || []) as unknown as Review[];
      setReviews(typedData);

      // Calculate stats
      if (typedData.length > 0) {
        const avg = typedData.reduce((sum, r) => sum + r.rating, 0) / typedData.length;
        setStats({ average: avg, total: typedData.length });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No reviews yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold">{stats.average.toFixed(1)}</p>
              <div className="flex gap-0.5 justify-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(stats.average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-muted-foreground">
              <p>{stats.total} reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {review.reviewer?.avatar_url ? (
                    <img
                      src={review.reviewer.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">
                      {review.reviewer?.full_name || "Anonymous"}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mt-1">
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
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SellerReviews;
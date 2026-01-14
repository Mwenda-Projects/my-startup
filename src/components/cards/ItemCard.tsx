import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import FavoriteButton from "@/components/favorites/FavoriteButton";

interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  imageUrl?: string;
  isSold?: boolean;
}

const conditionColors: Record<string, string> = {
  new: "bg-green-500/10 text-green-600 border-green-500/20",
  "like-new": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  good: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  fair: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  poor: "bg-red-500/10 text-red-600 border-red-500/20",
};

const ItemCard = forwardRef<HTMLDivElement, ItemCardProps>(
  ({ id, title, description, category, price, condition, imageUrl, isSold }, ref) => {
    return (
      <Card ref={ref} className={`group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full relative ${isSold ? "opacity-60" : ""}`}>
        <Link to={`/marketplace/${id}`}>
          {/* Image */}
          <div className="aspect-square relative overflow-hidden bg-muted">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center gradient-accent opacity-20">
                <span className="text-6xl font-bold text-accent-foreground/50">
                  {title.charAt(0)}
                </span>
              </div>
            )}
            
            {isSold && (
              <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                <span className="text-background font-bold text-xl rotate-[-15deg] px-6 py-2 border-2 border-background">
                  SOLD
                </span>
              </div>
            )}

            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-background/90 text-foreground backdrop-blur-sm">
                {category}
              </Badge>
            </div>
          </div>
        </Link>

        <FavoriteButton listingId={id} listingType="item" className="absolute top-3 right-3 z-10" />

        <Link to={`/marketplace/${id}`}>
          <CardContent className="p-5">
            {/* Title & Condition */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                {title}
              </h3>
              <Badge variant="outline" className={conditionColors[condition] || conditionColors.good}>
                {condition}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {description}
            </p>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="font-bold text-accent text-xl">
                KSh {price.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Campus
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }
);

ItemCard.displayName = "ItemCard";

export default ItemCard;

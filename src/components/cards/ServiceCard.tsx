import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import FavoriteButton from "@/components/favorites/FavoriteButton";

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceType: string;
  imageUrl?: string;
  sellerName?: string;
  sellerAvatar?: string;
}

const ServiceCard = forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ id, title, description, category, price, priceType, imageUrl, sellerName, sellerAvatar }, ref) => {
    return (
      <Card ref={ref} className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full relative">
        <Link to={`/services/${id}`}>
          {/* Image */}
          <div className="aspect-video relative overflow-hidden bg-muted">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center gradient-primary opacity-20">
                <span className="text-6xl font-bold text-primary-foreground/50">
                  {title.charAt(0)}
                </span>
              </div>
            )}
            <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-sm">
              {category}
            </Badge>
          </div>
        </Link>

        <FavoriteButton listingId={id} listingType="service" className="absolute top-3 right-3 z-10" />

        <Link to={`/services/${id}`}>
          <CardContent className="p-5">
            {/* Title & Description */}
            <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              {/* Seller */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {sellerAvatar ? (
                    <img src={sellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                  {sellerName || "Student"}
                </span>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="font-bold text-primary text-lg">
                  KSh {price.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {priceType === "hourly" ? "/hour" : priceType === "project" ? "/project" : "fixed"}
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }
);

ServiceCard.displayName = "ServiceCard";

export default ServiceCard;

import { forwardRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Award, 
  Star, 
  Shield, 
  Crown, 
  Zap, 
  TrendingUp,
  Target,
  Flame
} from "lucide-react";

interface SellerStats {
  completed_orders: number;
  average_rating: number;
  total_ratings: number;
  tier: string;
  in_app_completion_rate: number;
}

interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const getBadgesForSeller = (stats: SellerStats): BadgeInfo[] => {
  const badges: BadgeInfo[] = [];

  // First Sale
  if (stats.completed_orders >= 1) {
    badges.push({
      id: "first-sale",
      name: "First Sale",
      description: "Completed your first transaction",
      icon: <Zap className="w-3 h-3" />,
      color: "bg-green-500/20 text-green-600 border-green-500/30"
    });
  }

  // Rising Star (5+ orders)
  if (stats.completed_orders >= 5) {
    badges.push({
      id: "rising-star",
      name: "Rising Star",
      description: "Completed 5+ orders",
      icon: <TrendingUp className="w-3 h-3" />,
      color: "bg-blue-500/20 text-blue-600 border-blue-500/30"
    });
  }

  // Top Rated (4.5+ rating with 5+ reviews)
  if (stats.average_rating >= 4.5 && stats.total_ratings >= 5) {
    badges.push({
      id: "top-rated",
      name: "Top Rated",
      description: "Maintained 4.5+ rating with 5+ reviews",
      icon: <Star className="w-3 h-3" />,
      color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
    });
  }

  // Super Seller (50+ orders)
  if (stats.completed_orders >= 50) {
    badges.push({
      id: "super-seller",
      name: "Super Seller",
      description: "Completed 50+ orders",
      icon: <Flame className="w-3 h-3" />,
      color: "bg-orange-500/20 text-orange-600 border-orange-500/30"
    });
  }

  // High Completion Rate (80%+)
  if (stats.in_app_completion_rate >= 80) {
    badges.push({
      id: "reliable",
      name: "Reliable",
      description: "80%+ in-app completion rate",
      icon: <Target className="w-3 h-3" />,
      color: "bg-purple-500/20 text-purple-600 border-purple-500/30"
    });
  }

  // Premium tier
  if (stats.tier === "premium") {
    badges.push({
      id: "premium",
      name: "Premium",
      description: "Premium seller with priority search",
      icon: <Award className="w-3 h-3" />,
      color: "bg-indigo-500/20 text-indigo-600 border-indigo-500/30"
    });
  }

  // Trusted tier
  if (stats.tier === "trusted") {
    badges.push({
      id: "trusted",
      name: "Trusted",
      description: "Verified trusted seller status",
      icon: <Shield className="w-3 h-3" />,
      color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
    });
  }

  // Elite (100+ orders with 4.8+ rating)
  if (stats.completed_orders >= 100 && stats.average_rating >= 4.8) {
    badges.push({
      id: "elite",
      name: "Elite",
      description: "100+ orders with 4.8+ rating",
      icon: <Crown className="w-3 h-3" />,
      color: "bg-amber-500/20 text-amber-600 border-amber-500/30"
    });
  }

  return badges;
};

// Wrapper component for tooltip trigger to properly forward refs
const BadgeItem = forwardRef<
  HTMLDivElement,
  { badge: BadgeInfo }
>(({ badge, ...props }, ref) => (
  <div ref={ref} {...props}>
    <Badge 
      variant="outline" 
      className={`${badge.color} flex items-center gap-1 text-xs font-medium`}
    >
      {badge.icon}
      {badge.name}
    </Badge>
  </div>
));
BadgeItem.displayName = "BadgeItem";

interface BadgeDisplayProps {
  stats: SellerStats;
  showAll?: boolean;
  maxDisplay?: number;
}

const BadgeDisplay = forwardRef<HTMLDivElement, BadgeDisplayProps>(
  ({ stats, showAll = false, maxDisplay = 3 }, ref) => {
    const badges = getBadgesForSeller(stats);
    
    if (badges.length === 0) return null;

    const displayBadges = showAll ? badges : badges.slice(0, maxDisplay);
    const remainingCount = badges.length - displayBadges.length;

    return (
      <div ref={ref} className="flex flex-wrap gap-1.5">
        {displayBadges.map((badge) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <BadgeItem badge={badge} />
            </TooltipTrigger>
            <TooltipContent>
              <p>{badge.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs">
            +{remainingCount} more
          </Badge>
        )}
      </div>
    );
  }
);
BadgeDisplay.displayName = "BadgeDisplay";

export default BadgeDisplay;

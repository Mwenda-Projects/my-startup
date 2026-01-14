import { Button } from "@/components/ui/button";
import { MapPin, Loader2, X } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationFilterProps {
  onLocationChange: (lat: number | null, lng: number | null, radius: number) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  className?: string;
}

const RADIUS_OPTIONS = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "50 km" },
  { value: 100, label: "100 km" },
];

const LocationFilter = ({
  onLocationChange,
  radiusKm,
  onRadiusChange,
  className,
}: LocationFilterProps) => {
  const { latitude, longitude, loading, error, getCurrentPosition, clearLocation, hasLocation } =
    useGeolocation();

  const handleEnableLocation = () => {
    getCurrentPosition();
  };

  const handleClearLocation = () => {
    clearLocation();
    onLocationChange(null, null, radiusKm);
  };

  // Update parent when location changes
  const handleLocationUpdate = () => {
    if (latitude && longitude) {
      onLocationChange(latitude, longitude, radiusKm);
    }
  };

  // Effect to notify parent when location is acquired
  if (latitude && longitude) {
    onLocationChange(latitude, longitude, radiusKm);
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {hasLocation ? (
        <>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-primary border-primary/30 bg-primary/5"
            onClick={handleClearLocation}
          >
            <MapPin className="w-4 h-4" />
            Near me
            <X className="w-3 h-3 ml-1" />
          </Button>
          <Select
            value={radiusKm.toString()}
            onValueChange={(val) => {
              onRadiusChange(Number(val));
              if (latitude && longitude) {
                onLocationChange(latitude, longitude, Number(val));
              }
            }}
          >
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RADIUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEnableLocation}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          {loading ? "Getting location..." : "Near me"}
        </Button>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};

export default LocationFilter;

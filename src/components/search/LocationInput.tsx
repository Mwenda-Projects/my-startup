import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

interface LocationInputProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
}

const LocationInput = ({ latitude, longitude, onChange }: LocationInputProps) => {
  const { getCurrentPosition, loading, error } = useGeolocation();
  const [manualMode, setManualMode] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        console.error("Error getting location:", err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasLocation = latitude !== null && longitude !== null;

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        Location (optional)
      </Label>
      
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="w-full justify-start"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 mr-2" />
          )}
          {hasLocation ? "Update to Current Location" : "Use Current Location"}
        </Button>

        {hasLocation && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">
              Location set: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto h-7 text-xs"
              onClick={() => onChange(null, null)}
            >
              Clear
            </Button>
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit text-xs text-muted-foreground"
          onClick={() => setManualMode(!manualMode)}
        >
          {manualMode ? "Hide manual entry" : "Enter coordinates manually"}
        </Button>

        {manualMode && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="latitude" className="text-xs">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="-1.2921"
                value={latitude ?? ""}
                onChange={(e) => {
                  const val = e.target.value ? parseFloat(e.target.value) : null;
                  onChange(val, longitude);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="longitude" className="text-xs">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="36.8219"
                value={longitude ?? ""}
                onChange={(e) => {
                  const val = e.target.value ? parseFloat(e.target.value) : null;
                  onChange(latitude, val);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

export default LocationInput;

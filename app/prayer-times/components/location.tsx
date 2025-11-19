"use client";

import { usePrayerTimes } from "@/lib/store/hooks/usePrayerTimes";
import { Button } from "@/components/ui/button";

interface LocationProps {
  onOpenSettings: () => void;
}

export function Location({ onOpenSettings }: LocationProps) {
  const { settings, getCurrentLocation, loading } = usePrayerTimes();

  const handleUseCurrentLocation = async () => {
    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  return (
    <div className="space-y-4">
      {settings.city ? (
        <div className="text-center space-y-3">
          <div className="text-2xl">📍</div>
          <div>
            <div className="text-lg font-semibold text-foreground">
              {settings.city.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {settings.country?.name}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <div className="text-4xl">🌍</div>
          <div className="text-muted-foreground">
            لم يتم تحديد الموقع بعد
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Button
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/90 text-white font-semibold py-2 rounded-xl shadow-lg transition-all duration-300"
        >
          {loading ? "جاري التحديد..." : "📍 موقعي الحالي"}
        </Button>
        
        <Button
          onClick={onOpenSettings}
          variant="outline"
          className="w-full border-2 border-border text-foreground hover:bg-accent/50 font-semibold py-2 rounded-xl transition-all duration-300"
        >
          ⚙️ تغيير الموقع
        </Button>
      </div>
    </div>
  );
}

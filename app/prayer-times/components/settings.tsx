"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrayerTimes } from "@/lib/store/hooks/usePrayerTimes";
import { prayerNamesArabic, TimeNames } from "../types";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const {
    settings,
    countries,
    cities,
    loadCountries,
    loadCities,
    loadPrayerTimes,
    updateSettings,
    getCurrentLocation,
  } = usePrayerTimes();

  const [selectedCountry, setSelectedCountry] = useState(settings.country?.code || "");
  const [selectedCity, setSelectedCity] = useState(settings.city?.name || "");
  const [adjustments, setAdjustments] = useState(settings.adjustments);

  // Load countries when settings open
  useEffect(() => {
    if (isOpen && countries.length === 0) {
      loadCountries();
    }
  }, [isOpen, countries.length, loadCountries]);

  // Update local state when settings change
  useEffect(() => {
    setSelectedCountry(settings.country?.code || "");
    setSelectedCity(settings.city?.name || "");
    setAdjustments(settings.adjustments);
  }, [settings]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedCity("");
    
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      updateSettings({ country, city: null });
      loadCities(countryCode);
    }
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    
    const city = cities.find(c => c.name === cityName);
    if (city) {
      updateSettings({ city });
      loadPrayerTimes(city.latitude, city.longitude);
    }
  };

  const handleAdjustmentChange = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newAdjustments = [...adjustments];
    newAdjustments[index] = numValue;
    setAdjustments(newAdjustments);
    updateSettings({ adjustments: newAdjustments });
  };

  const handleUseCurrentLocation = async () => {
    try {
      await getCurrentLocation();
      onClose();
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-sm border border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            إعدادات مواقيت الصلاة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Current Location Button */}
          <div className="text-center">
            <Button
              onClick={handleUseCurrentLocation}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/90 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300"
            >
              📍 استخدام الموقع الحالي
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">أو اختر يدوياً</span>
            </div>
          </div>

          {/* Country Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">الدولة</Label>
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger className="w-full border-2 border-input rounded-xl focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <SelectValue placeholder="اختر الدولة" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Selection */}
          {selectedCountry && (
            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">المدينة</Label>
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger className="w-full border-2 border-input rounded-xl focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Time Adjustments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">تعديل التوقيت</h3>
            <div className="space-y-3">
              {Object.values(TimeNames).filter(v => !isNaN(Number(v))).map((prayer) => (
                <div key={prayer} className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground w-24">
                    {prayerNamesArabic[prayer as TimeNames]}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => handleAdjustmentChange(prayer as number, (adjustments[prayer as number] - 1).toString())}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={adjustments[prayer as number]}
                      onChange={(e) => handleAdjustmentChange(prayer as number, e.target.value)}
                      className="w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => handleAdjustmentChange(prayer as number, (adjustments[prayer as number] + 1).toString())}
                    >
                      +
                    </Button>
                    <span className="text-sm text-muted-foreground w-8 text-center">
                      دقيقة
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button 
              onClick={onClose} 
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-xl transition-all duration-300"
            >
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

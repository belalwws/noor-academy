"use client";

import { useEffect, useState } from "react";
import { usePrayerTimes } from "@/lib/store/hooks/usePrayerTimes";
import { prayerNamesArabic } from "../types";
import { Times } from "../models/times";

export function Summary() {
  const { prayerTimes, settings } = usePrayerTimes();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!prayerTimes) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">
          <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-primary/20 rounded w-32 mx-auto mb-2"></div>
          <div className="h-4 bg-primary/20 rounded w-24 mx-auto"></div>
        </div>
      </div>
    );
  }

  const times = new Times(prayerTimes, settings.adjustments);
  const nextPrayerIndex = times.getNextPrayerIndex();
  const timeUntilNext = times.getTimeUntilNextPrayer();;
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatHijriDate = () => {
    return prayerTimes.hijri;
  };

  const formatGregorianDate = () => {
    return currentTime.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="text-center space-y-6">
      {/* Current Time */}
      <div className="space-y-2">
        <div className="text-4xl font-bold text-primary">
          {formatTime(currentTime)}
        </div>
        <div className="text-sm text-muted-foreground">
          الوقت الحالي
        </div>
      </div>

      {/* Next Prayer Countdown */}
      <div className="bg-card rounded-2xl p-4 space-y-3 border border-border">
        <div className="text-lg font-semibold text-foreground">
          الصلاة القادمة
        </div>
        <div className="text-2xl font-bold text-primary">
          {prayerNamesArabic[nextPrayerIndex]}
        </div>
        <div className="text-xl text-foreground font-mono">
          {timeUntilNext}
        </div>
        <div className="text-sm text-muted-foreground">
          متبقي
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-3">
        <div className="bg-card rounded-xl p-3 border border-border">
          <div className="text-sm text-muted-foreground mb-1">التاريخ الهجري</div>
          <div className="text-foreground font-semibold">
            {formatHijriDate()}
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-3 border border-border">
          <div className="text-sm text-muted-foreground mb-1">التاريخ الميلادي</div>
          <div className="text-foreground font-semibold">
            {formatGregorianDate()}
          </div>
        </div>
      </div>

      {/* Prayer Progress */}
      <div className="bg-card rounded-xl p-3 border border-border">
        <div className="text-sm text-muted-foreground mb-2">تقدم اليوم</div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(nextPrayerIndex / 6) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {nextPrayerIndex} من 6 صلوات
        </div>
      </div>
    </div>
  );
}

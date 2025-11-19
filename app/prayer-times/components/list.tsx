"use client";

import { usePrayerTimes } from "@/lib/store/hooks/usePrayerTimes";
import { prayerNamesArabic, TimeNames } from "../types";
import { Times } from "../models/times";

export function List() {
  const { prayerTimes, settings } = usePrayerTimes();

  if (!prayerTimes) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white/10 rounded-2xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                <div className="h-6 bg-white/20 rounded w-20"></div>
              </div>
              <div className="h-8 bg-white/20 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const times = new Times(prayerTimes, settings.adjustments);
  const currentPrayerIndex = times.getCurrentPrayerIndex();
  const nextPrayerIndex = times.getNextPrayerIndex();

  const getPrayerIcon = (index: number) => {
    const icons = ["🌅", "☀️", "🌞", "🌇", "🌆", "🌙"];
    return icons[index] || "🕐";
  };

  const getPrayerStatus = (index: number) => {
    if (index === currentPrayerIndex) {
      return { 
        status: "current", 
        color: "from-[#1e3a8a] to-[#3b82f6]", 
        textColor: "text-white" 
      };
    }
    if (index === nextPrayerIndex) {
      return { 
        status: "next", 
        color: "from-[#2d7d32] to-[#1b5e20]", 
        textColor: "text-white" 
      };
    }
    if (times.isPrayerTimePassed(index)) {
      return { 
        status: "passed", 
        color: "from-gray-500 to-gray-600", 
        textColor: "text-gray-300" 
      };
    }
    return { 
      status: "upcoming", 
      color: "from-[#3b82f6] to-[#1e3a8a]", 
      textColor: "text-white" 
    };
  };

  return (
    <div className="space-y-3">
      {prayerTimes.times.map((prayer, index) => {
        const status = getPrayerStatus(index);
        const adjustedTime = times.getAdjustedTime(index);
        
        return (
          <div
            key={prayer.name}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${status.color} p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  {getPrayerIcon(index)}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${status.textColor}`}>
                    {prayerNamesArabic[prayer.name]}
                  </h3>
                  {status.status === "current" && (
                    <p className="text-sm text-white/80">الصلاة الحالية</p>
                  )}
                  {status.status === "next" && (
                    <p className="text-sm text-white/80">الصلاة القادمة</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-bold ${status.textColor}`}>
                  {adjustedTime}
                </div>
                {settings.adjustments[index] !== 0 && (
                  <div className="text-xs text-white/70">
                    ({settings.adjustments[index] > 0 ? '+' : ''}{settings.adjustments[index]} دقيقة)
                  </div>
                )}
              </div>
            </div>

            {/* Status indicator */}
            <div className="absolute top-2 right-2">
              {status.status === "current" && (
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              )}
              {status.status === "next" && (
                <div className="w-3 h-3 bg-white/70 rounded-full"></div>
              )}
              {status.status === "passed" && (
                <div className="w-3 h-3 bg-white/40 rounded-full"></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

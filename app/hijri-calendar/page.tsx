'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, ArrowRight, RefreshCw, Globe, Moon, Star } from 'lucide-react';

interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

interface GregorianDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

interface IslamicEvent {
  hijriDay: number;
  hijriMonth: number;
  name: string;
  description: string;
  type: 'religious' | 'historical' | 'celebration';
}

const hijriMonths = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const gregorianMonths = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const islamicEvents: IslamicEvent[] = [
  { hijriDay: 1, hijriMonth: 1, name: 'رأس السنة الهجرية', description: 'بداية العام الهجري الجديد', type: 'historical' },
  { hijriDay: 10, hijriMonth: 1, name: 'يوم عاشوراء', description: 'يوم صيام مستحب، ذكرى نجاة موسى عليه السلام', type: 'religious' },
  { hijriDay: 12, hijriMonth: 3, name: 'المولد النبوي الشريف', description: 'ذكرى مولد النبي محمد صلى الله عليه وسلم', type: 'celebration' },
  { hijriDay: 27, hijriMonth: 7, name: 'ليلة الإسراء والمعراج', description: 'ذكرى رحلة الإسراء والمعراج', type: 'religious' },
  { hijriDay: 15, hijriMonth: 8, name: 'ليلة البراءة', description: 'ليلة النصف من شعبان المباركة', type: 'religious' },
  { hijriDay: 1, hijriMonth: 9, name: 'بداية شهر رمضان', description: 'بداية شهر الصيام المبارك', type: 'religious' },
  { hijriDay: 27, hijriMonth: 9, name: 'ليلة القدر (تقديرية)', description: 'ليلة القدر خير من ألف شهر', type: 'religious' },
  { hijriDay: 1, hijriMonth: 10, name: 'عيد الفطر المبارك', description: 'عيد الفطر السعيد', type: 'celebration' },
  { hijriDay: 8, hijriMonth: 12, name: 'يوم التروية', description: 'بداية أيام الحج', type: 'religious' },
  { hijriDay: 9, hijriMonth: 12, name: 'يوم عرفة', description: 'يوم الحج الأكبر ويوم صيام لغير الحاج', type: 'religious' },
  { hijriDay: 10, hijriMonth: 12, name: 'عيد الأضحى المبارك', description: 'عيد الأضحى السعيد', type: 'celebration' },
  { hijriDay: 11, hijriMonth: 12, name: 'أيام التشريق', description: 'أيام أكل وشرب وذكر لله', type: 'religious' },
  { hijriDay: 12, hijriMonth: 12, name: 'أيام التشريق', description: 'أيام أكل وشرب وذكر لله', type: 'religious' },
  { hijriDay: 13, hijriMonth: 12, name: 'أيام التشريق', description: 'أيام أكل وشرب وذكر لله', type: 'religious' }
];

export default function HijriCalendarPage() {
  const [currentHijriDate, setCurrentHijriDate] = useState<HijriDate>({
    day: 1, month: 1, year: 1446, monthName: 'محرم'
  });
  const [currentGregorianDate, setCurrentGregorianDate] = useState<GregorianDate>({
    day: 1, month: 1, year: 2024, monthName: 'يناير'
  });
  const [viewMode, setViewMode] = useState<'hijri' | 'gregorian'>('hijri');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showConverter, setShowConverter] = useState(false);

  // Initialize with current date
  useEffect(() => {
    const today = new Date();
    const hijriToday = gregorianToHijri(today);
    setCurrentHijriDate(hijriToday);
    setCurrentGregorianDate({
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      monthName: gregorianMonths[today.getMonth()]
    });
  }, []);

  // Simple Hijri conversion (approximation)
  const gregorianToHijri = (gregorianDate: Date): HijriDate => {
    // This is a simplified conversion. In a real app, you'd use a proper library like moment-hijri
    const hijriEpoch = new Date('622-07-16'); // Approximate Hijri epoch
    const daysDiff = Math.floor((gregorianDate.getTime() - hijriEpoch.getTime()) / (1000 * 60 * 60 * 24));
    const hijriYear = Math.floor(daysDiff / 354) + 1; // Approximate Hijri year (354 days)
    const remainingDays = daysDiff % 354;
    const hijriMonth = Math.floor(remainingDays / 29.5) + 1; // Approximate month
    const hijriDay = Math.floor(remainingDays % 29.5) + 1;

    return {
      day: Math.min(hijriDay, 30),
      month: Math.min(hijriMonth, 12),
      year: hijriYear,
      monthName: hijriMonths[Math.min(hijriMonth - 1, 11)]
    };
  };

  const hijriToGregorian = (hijriDate: HijriDate): GregorianDate => {
    // Simplified reverse conversion
    const totalHijriDays = (hijriDate.year - 1) * 354 + (hijriDate.month - 1) * 29.5 + hijriDate.day;
    const hijriEpoch = new Date('622-07-16');
    const gregorianDate = new Date(hijriEpoch.getTime() + totalHijriDays * 24 * 60 * 60 * 1000);

    return {
      day: gregorianDate.getDate(),
      month: gregorianDate.getMonth() + 1,
      year: gregorianDate.getFullYear(),
      monthName: gregorianMonths[gregorianDate.getMonth()]
    };
  };

  const getDaysInHijriMonth = (month: number, year: number): number => {
    // Simplified: alternating 30 and 29 days, with adjustments
    return month % 2 === 1 ? 30 : 29;
  };

  const getDaysInGregorianMonth = (month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
  };

  const generateCalendarDays = () => {
    if (viewMode === 'hijri') {
      const daysInMonth = getDaysInHijriMonth(currentHijriDate.month, currentHijriDate.year);
      return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    } else {
      const daysInMonth = getDaysInGregorianMonth(currentGregorianDate.month, currentGregorianDate.year);
      return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (viewMode === 'hijri') {
      setCurrentHijriDate(prev => {
        let newMonth = prev.month;
        let newYear = prev.year;
        
        if (direction === 'next') {
          newMonth = prev.month === 12 ? 1 : prev.month + 1;
          newYear = prev.month === 12 ? prev.year + 1 : prev.year;
        } else {
          newMonth = prev.month === 1 ? 12 : prev.month - 1;
          newYear = prev.month === 1 ? prev.year - 1 : prev.year;
        }
        
        return {
          ...prev,
          month: newMonth,
          year: newYear,
          monthName: hijriMonths[newMonth - 1]
        };
      });
    } else {
      setCurrentGregorianDate(prev => {
        let newMonth = prev.month;
        let newYear = prev.year;
        
        if (direction === 'next') {
          newMonth = prev.month === 12 ? 1 : prev.month + 1;
          newYear = prev.month === 12 ? prev.year + 1 : prev.year;
        } else {
          newMonth = prev.month === 1 ? 12 : prev.month - 1;
          newYear = prev.month === 1 ? prev.year - 1 : prev.year;
        }
        
        return {
          ...prev,
          month: newMonth,
          year: newYear,
          monthName: gregorianMonths[newMonth - 1]
        };
      });
    }
  };

  const getEventsForDay = (day: number) => {
    if (viewMode === 'hijri') {
      return islamicEvents.filter(event => 
        event.hijriDay === day && event.hijriMonth === currentHijriDate.month
      );
    }
    return [];
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'religious': return 'bg-blue-100 text-blue-800';
      case 'historical': return 'bg-blue-100 text-blue-800';
      case 'celebration': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'religious': return <Moon className="w-4 h-4" />;
      case 'historical': return <Star className="w-4 h-4" />;
      case 'celebration': return <Calendar className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-blue-800">
                التقويم الهجري
              </h1>
            </div>
            <p className="text-blue-600 text-lg">
              تقويم إسلامي شامل مع المناسبات الدينية وتحويل التواريخ
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-xl p-1 border border-blue-200">
              <button
                onClick={() => setViewMode('hijri')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'hijri'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                هجري
              </button>
              <button
                onClick={() => setViewMode('gregorian')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'gregorian'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                ميلادي
              </button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 transition-all"
              >
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </button>
              
              <div className="text-center min-w-[200px]">
                <h2 className="text-xl font-bold text-blue-800">
                  {viewMode === 'hijri' 
                    ? `${currentHijriDate.monthName} ${currentHijriDate.year}`
                    : `${currentGregorianDate.monthName} ${currentGregorianDate.year}`
                  }
                </h2>
                <p className="text-blue-600 text-sm">
                  {viewMode === 'hijri' ? 'هجرية' : 'ميلادية'}
                </p>
              </div>

              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-blue-600" />
              </button>
            </div>

            {/* Converter Button */}
            <button
              onClick={() => setShowConverter(!showConverter)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              محول التاريخ
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Date Converter */}
          {showConverter && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6" />
                محول التاريخ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">التاريخ الهجري</h4>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-700">
                      {currentHijriDate.day} {currentHijriDate.monthName} {currentHijriDate.year} هـ
                    </div>
                  </div>
                </div>
                <div className="bg-teal-50 rounded-xl p-4">
                  <h4 className="font-semibold text-teal-800 mb-3">التاريخ الميلادي</h4>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-teal-700">
                      {currentGregorianDate.day} {currentGregorianDate.monthName} {currentGregorianDate.year} م
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Grid */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4">
              <div className="grid grid-cols-7 gap-2 text-center">
                {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(day => (
                  <div key={day} className="font-semibold py-2">
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Body */}
            <div className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map(day => {
                  const events = getEventsForDay(day);
                  const hasEvents = events.length > 0;
                  
                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(selectedDate === day ? null : day)}
                      className={`aspect-square p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedDate === day
                          ? 'bg-blue-100 border-blue-300'
                          : hasEvents
                          ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="h-full flex flex-col">
                        <div className={`text-center font-semibold ${
                          hasEvents ? 'text-amber-800' : 'text-gray-700'
                        }`}>
                          {day}
                        </div>
                        {hasEvents && (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Event Details */}
          {selectedDate && (
            <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4">
                أحداث يوم {selectedDate} {viewMode === 'hijri' ? currentHijriDate.monthName : currentGregorianDate.monthName}
              </h3>
              
              {getEventsForDay(selectedDate).length > 0 ? (
                <div className="space-y-4">
                  {getEventsForDay(selectedDate).map((event, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-800 mb-1">{event.name}</h4>
                          <p className="text-blue-700 text-sm">{event.description}</p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                            {event.type === 'religious' ? 'ديني' : event.type === 'historical' ? 'تاريخي' : 'احتفالي'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-blue-600">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>لا توجد مناسبات في هذا اليوم</p>
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events */}
          <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
            <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
              <Star className="w-6 h-6" />
              المناسبات القادمة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {islamicEvents.slice(0, 6).map((event, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    {getEventTypeIcon(event.type)}
                    <span className="font-semibold text-blue-800">{event.name}</span>
                  </div>
                  <p className="text-blue-700 text-sm mb-2">{event.description}</p>
                  <div className="text-xs text-blue-600">
                    {event.hijriDay} {hijriMonths[event.hijriMonth - 1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

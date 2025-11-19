'use client';

import { useState } from 'react';
import { useTasbihStore } from '@/lib/store/hooks/useTasbih';

export function TasbihHistory() {
  const { sessions } = useTasbihStore();
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filteredSessions = sessions.filter(session => {
    switch (filter) {
      case 'today':
        return session.date === today;
      case 'week':
        return session.date >= weekAgo;
      case 'month':
        return session.date >= monthAgo;
      default:
        return true;
    }
  });

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const date = session.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, typeof sessions>);

  return (
    <div className="space-y-6" style={{ fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
      {/* Filter Buttons */}
      <div
        className="backdrop-blur-md rounded-2xl p-4"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'الكل', count: sessions.length },
            { id: 'today', label: 'اليوم', count: sessions.filter(s => s.date === today).length },
            { id: 'week', label: 'هذا الأسبوع', count: sessions.filter(s => s.date >= weekAgo).length },
            { id: 'month', label: 'هذا الشهر', count: sessions.filter(s => s.date >= monthAgo).length }
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id as any)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap"
              style={{
                background: filter === filterOption.id
                  ? 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: filter === filterOption.id ? '#1b5e20' : 'rgba(255, 255, 255, 0.8)',
                fontWeight: filter === filterOption.id ? 'bold' : 'normal'
              }}
              onMouseEnter={(e) => {
                if (filter !== filterOption.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== filterOption.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
            >
              <span>{filterOption.label}</span>
              <span
                className="px-2 py-1 rounded-full text-xs"
                style={{
                  background: filter === filterOption.id ? 'rgba(27, 94, 32, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                }}
              >
                {filterOption.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedSessions)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, dateSessions]) => (
              <div
                key={date}
                className="backdrop-blur-md rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                }}
              >
                {/* Date Header */}
                <div
                  className="px-6 py-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 193, 7, 0.2) 100%)',
                    borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
                  }}
                >
                  <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Amiri', serif" }}>
                    {formatDate(date)}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {dateSessions.length} جلسة • {dateSessions.reduce((sum, s) => sum + s.count, 0)} تسبيحة
                  </p>
                </div>

                {/* Sessions */}
                <div className="p-4 space-y-3">
                  {dateSessions
                    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                    .map((session) => (
                      <div
                        key={session.id}
                        className="rounded-xl p-4 transition-all duration-300"
                        style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)',
                                color: '#1b5e20'
                              }}
                            >
                              <span className="text-sm font-bold">{session.count}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium" style={{ fontFamily: "'Amiri', serif" }}>
                                {session.dhikrType}
                              </p>
                              <p className="text-white/70 text-sm">
                                {formatTime(session.completedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg" style={{ color: '#ffd700' }}>
                              {session.count}
                            </p>
                            <p className="text-white/70 text-sm">{session.duration} دقيقة</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div
                          className="w-full rounded-full h-2 overflow-hidden"
                          style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                        >
                          <div
                            className="h-full"
                            style={{
                              width: `${Math.min((session.count / 100) * 100, 100)}%`,
                              background: 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div
          className="backdrop-blur-md rounded-2xl p-12 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="text-6xl mb-4">📿</div>
          <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Amiri', serif" }}>
            لا توجد جلسات
          </h3>
          <p className="text-white/80 mb-6">
            {filter === 'all'
              ? 'لم تقم بأي جلسات تسبيح بعد'
              : `لا توجد جلسات في ${filter === 'today' ? 'اليوم' : filter === 'week' ? 'هذا الأسبوع' : 'هذا الشهر'}`
            }
          </p>
          <button
            onClick={() => setFilter('all')}
            className="px-6 py-3 bg-emerald-500/20 text-emerald-300 rounded-xl hover:bg-emerald-500/30 transition-all duration-300"
          >
            عرض جميع الجلسات
          </button>
        </div>
      )}

      {/* Summary Stats */}
      {filteredSessions.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">ملخص الفترة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {filteredSessions.length}
              </p>
              <p className="text-white/70 text-sm">جلسة</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {filteredSessions.reduce((sum, s) => sum + s.count, 0)}
              </p>
              <p className="text-white/70 text-sm">تسبيحة</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {Math.round(filteredSessions.reduce((sum, s) => sum + s.duration, 0))}
              </p>
              <p className="text-white/70 text-sm">دقيقة</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {filteredSessions.length > 0 
                  ? Math.round(filteredSessions.reduce((sum, s) => sum + s.count, 0) / filteredSessions.length)
                  : 0
                }
              </p>
              <p className="text-white/70 text-sm">متوسط الجلسة</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

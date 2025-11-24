'use client';

import { useTasbihStore } from '@/lib/store/hooks/useTasbih';

export function TasbihStats() {
  const { stats, dailyGoal, sessions } = useTasbihStore();

  const todayProgress = Math.min((stats.todayCount / dailyGoal) * 100, 100);

  // Calculate weekly progress
  const weeklyGoal = dailyGoal * 7;
  const weeklyProgress = Math.min((stats.weeklyCount / weeklyGoal) * 100, 100);

  // Get recent sessions for chart
  const recentSessions = sessions.slice(0, 7).reverse();
  const maxCount = Math.max(...recentSessions.map(s => s.count), 1);

  return (
    <div className="space-y-6" style={{ fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="backdrop-blur-md rounded-2xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="text-2xl mb-2">📊</div>
          <p className="text-white/70 text-sm">اليوم</p>
          <p className="text-2xl font-bold" style={{ color: '#ffd700' }}>{stats.todayCount}</p>
        </div>

        <div
          className="backdrop-blur-md rounded-2xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="text-2xl mb-2">📈</div>
          <p className="text-white/70 text-sm">هذا الأسبوع</p>
          <p className="text-2xl font-bold" style={{ color: '#ffc107' }}>{stats.weeklyCount}</p>
        </div>

        <div
          className="backdrop-blur-md rounded-2xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="text-2xl mb-2">🔥</div>
          <p className="text-white/70 text-sm">أطول سلسلة</p>
          <p className="text-2xl font-bold" style={{ color: '#ffb347' }}>{stats.longestStreak}</p>
        </div>

        <div
          className="backdrop-blur-md rounded-2xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="text-2xl mb-2">💯</div>
          <p className="text-white/70 text-sm">الإجمالي</p>
          <p className="text-2xl font-bold" style={{ color: '#ffd700' }}>{stats.totalCount}</p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {/* Daily Progress */}
        <div
          className="backdrop-blur-md rounded-2xl p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Amiri', serif" }}>
              التقدم اليومي
            </h3>
            <span className="font-bold" style={{ color: '#ffd700' }}>
              {stats.todayCount} / {dailyGoal}
            </span>
          </div>
          <div
            className="w-full rounded-full h-4 overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.2)' }}
          >
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${todayProgress}%`,
                background: 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)',
                boxShadow: '0 2px 10px rgba(255, 215, 0, 0.4)'
              }}
            />
          </div>
          <p className="text-white/80 text-sm mt-2">
            {todayProgress >= 100 ? '🎉 تم إنجاز الهدف اليومي!' : `${Math.round(todayProgress)}% من الهدف`}
          </p>
        </div>

        {/* Weekly Progress */}
        <div
          className="backdrop-blur-md rounded-2xl p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Amiri', serif" }}>
              التقدم الأسبوعي
            </h3>
            <span className="font-bold" style={{ color: '#ffc107' }}>
              {stats.weeklyCount} / {weeklyGoal}
            </span>
          </div>
          <div
            className="w-full rounded-full h-4 overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.2)' }}
          >
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${weeklyProgress}%`,
                background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                boxShadow: '0 2px 10px rgba(255, 193, 7, 0.4)'
              }}
            />
          </div>
          <p className="text-white/70 text-sm mt-2">
            {weeklyProgress >= 100 ? '🎉 تم إنجاز الهدف الأسبوعي!' : `${Math.round(weeklyProgress)}% من الهدف`}
          </p>
        </div>
      </div>

      {/* Streak Information */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">سلسلة الإنجاز</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#C5A15A] mb-2">{stats.currentStreak}</div>
            <p className="text-white/70 text-sm">السلسلة الحالية</p>
            <p className="text-white/60 text-xs">أيام متتالية</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">{stats.longestStreak}</div>
            <p className="text-white/70 text-sm">أطول سلسلة</p>
            <p className="text-white/60 text-xs">الرقم القياسي</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Chart */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">النشاط الأخير</h3>
        {recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session, index) => (
              <div key={session.id} className="flex items-center gap-4">
                <div className="w-16 text-white/70 text-sm">
                  {new Date(session.completedAt).toLocaleDateString('ar-SA', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm">{session.dhikrType}</span>
                    <span className="text-blue-400 font-bold">{session.count}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-teal-500"
                      style={{ width: `${(session.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📿</div>
            <p className="text-white/70">لا توجد جلسات مسجلة بعد</p>
            <p className="text-white/50 text-sm">ابدأ التسبيح لرؤية الإحصاءات</p>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-2xl mb-2">📅</div>
          <p className="text-white/70 text-sm">المتوسط اليومي</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.averageDaily}</p>
          <p className="text-white/60 text-xs">تسبيحة في اليوم</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-white/70 text-sm">إجمالي الجلسات</p>
          <p className="text-2xl font-bold text-cyan-400">{stats.totalSessions}</p>
          <p className="text-white/60 text-xs">جلسة مكتملة</p>
        </div>
      </div>
    </div>
  );
}

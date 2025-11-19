'use client';

import { useState, useEffect } from 'react';
import { useTasbihStore } from '@/lib/store/hooks/useTasbih';

const defaultDhikrTypes = [
  'سبحان الله',
  'الحمد لله', 
  'الله أكبر',
  'لا إله إلا الله',
  'استغفر الله',
  'لا حول ولا قوة إلا بالله',
  'سبحان الله وبحمده',
  'سبحان الله العظيم'
];

export function TasbihCounter() {
  const {
    currentCount,
    selectedDhikr,
    dailyGoal,
    stats,
    increment,
    reset,
    setDhikr,
    saveSession,
    setDailyGoal
  } = useTasbihStore();

  const [showDhikrSelector, setShowDhikrSelector] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const progress = Math.min((stats.todayCount / dailyGoal) * 100, 100);

  const handleCounterClick = () => {
    increment();
  };

  const handleReset = () => {
    if (currentCount > 0) {
      saveSession();
    }
    reset();
    setShowResetConfirm(false);
  };

  const handleDhikrSelect = (dhikr: string) => {
    setDhikr(dhikr);
    setShowDhikrSelector(false);
  };

  return (
    <div className="space-y-6">
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
            الهدف اليومي
          </h3>
          <span
            className="font-bold text-lg"
            style={{ color: '#ffd700' }}
          >
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
              width: `${progress}%`,
              background: 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)',
              boxShadow: '0 2px 10px rgba(255, 215, 0, 0.4)'
            }}
          />
        </div>
        <p className="text-white/80 text-sm mt-3" style={{ fontFamily: "'Cairo', sans-serif" }}>
          {progress >= 100 ? '🎉 تم إنجاز الهدف اليومي!' : `${Math.round(progress)}% من الهدف`}
        </p>
      </div>

      {/* Current Dhikr Selector */}
      <div
        className="backdrop-blur-md rounded-2xl p-4"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 215, 0, 0.3)'
        }}
      >
        <button
          onClick={() => setShowDhikrSelector(true)}
          className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300"
          style={{
            background: 'rgba(255, 255, 255, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <div className="text-right">
            <p className="text-white/70 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
              الذكر المحدد
            </p>
            <p className="text-white font-semibold text-lg" style={{ fontFamily: "'Amiri', serif" }}>
              {selectedDhikr}
            </p>
          </div>
          <span style={{ color: '#ffd700' }} className="text-xl">📿</span>
        </button>
      </div>

      {/* Main Counter */}
      <div
        className="backdrop-blur-md rounded-3xl p-8"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="text-center space-y-6">
          {/* Counter Display */}
          <div className="relative">
            <div
              className="w-48 h-48 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 193, 7, 0.2) 100%)',
                border: '4px solid rgba(255, 215, 0, 0.5)',
                boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)'
              }}
            >
              <span className="text-6xl font-bold text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {currentCount}
              </span>
            </div>
            <div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-white px-4 py-1 rounded-full text-sm font-medium"
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)',
                color: '#1b5e20',
                fontWeight: 'bold'
              }}
            >
              الجلسة الحالية
            </div>
          </div>

          {/* Quick Goals */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[33, 99, 300, 500, 1000, 2000].map((goal) => (
              <button
                key={goal}
                onClick={() => setDailyGoal(goal)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: dailyGoal === goal
                    ? 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)'
                    : 'rgba(255, 255, 255, 0.9)',
                  color: dailyGoal === goal ? '#1b5e20' : '#2d7d32',
                  boxShadow: dailyGoal === goal ? '0 4px 15px rgba(255, 215, 0, 0.3)' : 'none',
                  fontWeight: dailyGoal === goal ? 'bold' : 'normal'
                }}
                onMouseEnter={(e) => {
                  if (dailyGoal !== goal) {
                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (dailyGoal !== goal) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  }
                }}
              >
                {goal.toLocaleString('ar-EG')}
              </button>
            ))}
          </div>

          {/* Counter Button */}
          <button
            onClick={handleCounterClick}
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)',
              boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
              color: '#1b5e20'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 215, 0, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.4)';
            }}
          >
            <span className="text-3xl font-bold">+</span>
          </button>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowResetConfirm(true)}
              disabled={currentCount === 0}
              className="px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: currentCount === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(220, 53, 69, 0.2)',
                color: currentCount === 0 ? 'rgba(255, 255, 255, 0.5)' : '#ff6b6b',
                border: '1px solid rgba(220, 53, 69, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (currentCount > 0) {
                  e.currentTarget.style.background = 'rgba(220, 53, 69, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentCount > 0) {
                  e.currentTarget.style.background = 'rgba(220, 53, 69, 0.2)';
                }
              }}
            >
              إعادة تعيين
            </button>
            <button
              onClick={() => {
                if (currentCount > 0) {
                  saveSession();
                  reset();
                }
              }}
              disabled={currentCount === 0}
              className="px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: currentCount === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 215, 0, 0.2)',
                color: currentCount === 0 ? 'rgba(255, 255, 255, 0.5)' : '#ffd700',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (currentCount > 0) {
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentCount > 0) {
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
                }
              }}
            >
              حفظ الجلسة
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="backdrop-blur-md rounded-2xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}
        >
          <p className="text-white/70 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
            اليوم
          </p>
          <p className="text-2xl font-bold" style={{ color: '#ffd700', fontFamily: "'Cairo', sans-serif" }}>
            {stats.todayCount}
          </p>
        </div>
        <div
          className="backdrop-blur-md rounded-2xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}
        >
          <p className="text-white/70 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
            الإجمالي
          </p>
          <p className="text-2xl font-bold" style={{ color: '#ffd700', fontFamily: "'Cairo', sans-serif" }}>
            {stats.totalCount}
          </p>
        </div>
      </div>

      {/* Dhikr Selector Modal */}
      {showDhikrSelector && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div
            className="backdrop-blur-md rounded-2xl p-6 w-full max-w-md"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)'
            }}
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center" style={{ fontFamily: "'Amiri', serif" }}>
              اختر الذكر
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {defaultDhikrTypes.map((dhikr) => (
                <button
                  key={dhikr}
                  onClick={() => handleDhikrSelect(dhikr)}
                  className="w-full p-4 text-right rounded-xl transition-all duration-300"
                  style={{
                    background: selectedDhikr === dhikr
                      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 193, 7, 0.3) 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: selectedDhikr === dhikr ? '#ffd700' : 'white',
                    border: selectedDhikr === dhikr ? '1px solid rgba(255, 215, 0, 0.5)' : '1px solid transparent',
                    fontFamily: "'Amiri', serif"
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDhikr !== dhikr) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDhikr !== dhikr) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  {dhikr}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDhikrSelector(false)}
              className="w-full mt-4 py-3 rounded-xl transition-all duration-300"
              style={{
                background: 'rgba(220, 53, 69, 0.2)',
                color: '#ff6b6b',
                border: '1px solid rgba(220, 53, 69, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(220, 53, 69, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(220, 53, 69, 0.2)';
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div
            className="backdrop-blur-md rounded-2xl p-6 w-full max-w-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)'
            }}
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center" style={{ fontFamily: "'Amiri', serif" }}>
              تأكيد الإعادة
            </h3>
            <p className="text-white/80 text-center mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
              هل تريد إعادة تعيين العداد؟ سيتم حفظ الجلسة الحالية تلقائياً.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl transition-all duration-300"
                style={{
                  background: 'rgba(220, 53, 69, 0.2)',
                  color: '#ff6b6b',
                  border: '1px solid rgba(220, 53, 69, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 53, 69, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 53, 69, 0.2)';
                }}
              >
                نعم، إعادة تعيين
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

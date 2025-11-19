'use client';

import { useState } from 'react';
import { useTasbihStore } from '@/lib/store/hooks/useTasbih';

export function TasbihSettings() {
  const {
    dailyGoal,
    soundEnabled,
    vibrationEnabled,
    autoReset,
    resetThreshold,
    setDailyGoal,
    toggleSound,
    toggleVibration,
    toggleAutoReset,
    setResetThreshold
  } = useTasbihStore();

  const [tempDailyGoal, setTempDailyGoal] = useState(dailyGoal.toString());
  const [tempResetThreshold, setTempResetThreshold] = useState(resetThreshold.toString());

  const handleDailyGoalSave = () => {
    const goal = parseInt(tempDailyGoal);
    if (goal > 0 && goal <= 10000) {
      setDailyGoal(goal);
    } else {
      setTempDailyGoal(dailyGoal.toString());
    }
  };

  const handleResetThresholdSave = () => {
    const threshold = parseInt(tempResetThreshold);
    if (threshold > 0 && threshold <= 1000) {
      setResetThreshold(threshold);
    } else {
      setTempResetThreshold(resetThreshold.toString());
    }
  };

  const testSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const testVibration = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const quickGoals = [33, 99, 300, 500, 1000, 2000, 3000, 5000];

  return (
    <div className="space-y-6" style={{ fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
      {/* Daily Goal Setting */}
      <div
        className="backdrop-blur-md rounded-2xl p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
        }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Amiri', serif" }}>
          <span>🎯</span>
          الهدف اليومي
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={tempDailyGoal}
              onChange={(e) => setTempDailyGoal(e.target.value)}
              onBlur={handleDailyGoalSave}
              min="1"
              max="10000"
              className="flex-1 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                focusBorderColor: '#ffd700'
              }}
              placeholder="أدخل الهدف اليومي"
              onFocus={(e) => {
                e.target.style.borderColor = '#ffd700';
                e.target.style.boxShadow = '0 0 0 2px rgba(255, 215, 0, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                e.target.style.boxShadow = 'none';
                handleDailyGoalSave();
              }}
            />
            <button
              onClick={handleDailyGoalSave}
              className="px-6 py-3 bg-emerald-500/20 text-emerald-300 rounded-xl hover:bg-emerald-500/30 transition-all duration-300"
            >
              حفظ
            </button>
          </div>
          <p className="text-white/70 text-sm">
            الهدف الحالي: {dailyGoal} تسبيحة يومياً
          </p>
        </div>
      </div>

      {/* Sound Settings */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>🔊</span>
          إعدادات الصوت
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">تفعيل الصوت</p>
              <p className="text-white/70 text-sm">صوت عند كل تسبيحة</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={testSound}
                disabled={!soundEnabled}
                className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                تجربة
              </button>
              <button
                onClick={toggleSound}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  soundEnabled ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vibration Settings */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>📳</span>
          إعدادات الاهتزاز
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">تفعيل الاهتزاز</p>
              <p className="text-white/70 text-sm">اهتزاز عند كل تسبيحة</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={testVibration}
                disabled={!vibrationEnabled || !('vibrate' in navigator)}
                className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                تجربة
              </button>
              <button
                onClick={toggleVibration}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  vibrationEnabled ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                  vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
          {!('vibrate' in navigator) && (
            <p className="text-yellow-400 text-sm">
              ⚠️ الاهتزاز غير مدعوم في هذا المتصفح
            </p>
          )}
        </div>
      </div>

      {/* Auto Reset Settings */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>🔄</span>
          الإعادة التلقائية
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">تفعيل الإعادة التلقائية</p>
              <p className="text-white/70 text-sm">إعادة تعيين العداد تلقائياً عند الوصول للحد</p>
            </div>
            <button
              onClick={toggleAutoReset}
              className={`w-12 h-6 rounded-full transition-all duration-300 ${
                autoReset ? 'bg-emerald-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                autoReset ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {autoReset && (
            <div className="space-y-2">
              <label className="text-white/70 text-sm">حد الإعادة التلقائية</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={tempResetThreshold}
                  onChange={(e) => setTempResetThreshold(e.target.value)}
                  onBlur={handleResetThresholdSave}
                  min="1"
                  max="1000"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="أدخل حد الإعادة"
                />
                <button
                  onClick={handleResetThresholdSave}
                  className="px-6 py-3 bg-emerald-500/20 text-emerald-300 rounded-xl hover:bg-emerald-500/30 transition-all duration-300"
                >
                  حفظ
                </button>
              </div>
              <p className="text-white/70 text-sm">
                سيتم إعادة تعيين العداد تلقائياً عند الوصول إلى {resetThreshold} تسبيحة
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Goal Presets */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>⚡</span>
          أهداف سريعة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickGoals.map((goal) => (
            <button
              key={goal}
              onClick={() => {
                setDailyGoal(goal);
                setTempDailyGoal(goal.toString());
              }}
              className={`p-3 rounded-xl transition-all duration-300 ${
                dailyGoal === goal
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <div className="text-lg font-bold">{goal}</div>
              <div className="text-xs text-white/70">تسبيحة</div>
            </button>
          ))}
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>💾</span>
          معلومات التخزين
        </h3>
        <div className="space-y-2 text-white/70 text-sm">
          <p>• جميع البيانات محفوظة محلياً في جهازك</p>
          <p>• لا يتم إرسال أي بيانات للخادم</p>
          <p>• البيانات آمنة ومحمية</p>
          <p>• يمكن استخدام التطبيق بدون إنترنت</p>
        </div>
      </div>
    </div>
  );
}

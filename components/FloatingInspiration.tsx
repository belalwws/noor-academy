'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type InspirationItem =
  | {
      type: 'hadith'
      arabic: string
      translation?: string
      source?: string
    }
  | {
      type: 'ayah'
      arabic: string
      translation?: string
      reference?: string
    }

const defaultItems: InspirationItem[] = [
  {
    type: 'hadith',
    arabic:
      'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    translation:
      'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى',
    source: 'متفق عليه',
  },
  {
    type: 'ayah',
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translation: 'ألا بذكر الله تطمئن القلوب',
    reference: 'الرعد: 28',
  },
  {
    type: 'ayah',
    arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    translation: 'وقل رب زدني علما',
    reference: 'طه: 114',
  },
]

function getDailyIndex(mod: number): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = Number(now) - Number(start)
  const oneDay = 1000 * 60 * 60 * 24
  const day = Math.floor(diff / oneDay)
  return day % Math.max(1, mod)
}

export default function FloatingInspiration({
  items = defaultItems,
}: {
  items?: InspirationItem[]
}) {
  const [hidden, setHidden] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [index, setIndex] = useState(0)
  const [mode, setMode] = useState<'mixed' | 'hadith' | 'ayah'>('mixed')
  const [autoRotate, setAutoRotate] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const hoverRef = useRef<HTMLDivElement | null>(null)
  const intervalRef = useRef<number | null>(null)
  const reduceMotionRef = useRef(false)

  const validItems = useMemo(() => (items.length > 0 ? items : defaultItems), [items])
  const filteredItems = useMemo(() => {
    if (mode === 'mixed') return validItems
    return validItems.filter((i) => i.type === mode)
  }, [validItems, mode])
  const current = filteredItems[index] ?? filteredItems[0] ?? validItems[0]

  useEffect(() => {
    try {
      const savedHidden = localStorage.getItem('floating-inspiration:hidden')
      const savedMin = localStorage.getItem('floating-inspiration:minimized')
      const savedMode = localStorage.getItem('floating-inspiration:mode') as
        | 'mixed'
        | 'hadith'
        | 'ayah'
        | null
      const savedAuto = localStorage.getItem('floating-inspiration:auto')
      if (savedHidden === '1') setHidden(true)
      if (savedMin === '1') setMinimized(true)
      if (savedMode) setMode(savedMode)
      if (savedAuto === '0') setAutoRotate(false)

      // Reduced motion preference
      try {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        reduceMotionRef.current = mq.matches
        const onChange = () => (reduceMotionRef.current = mq.matches)
        mq.addEventListener?.('change', onChange)
      } catch {}

      // Dark mode detection
      try {
        const mqd = window.matchMedia('(prefers-color-scheme: dark)')
        setIsDark(mqd.matches)
        const onChangeDark = (e: MediaQueryListEvent) => setIsDark(e.matches)
        mqd.addEventListener?.('change', onChangeDark)
      } catch {}

      setIndex(getDailyIndex(filteredItems.length || validItems.length))
    } catch {}
  }, [filteredItems.length, validItems.length])

  // Always visible on all routes

  // Auto-rotate logic with pause on hover
  useEffect(() => {
    if (!autoRotate || minimized || reduceMotionRef.current) return
    if (filteredItems.length <= 1) return
    const start = () => {
      stop()
      intervalRef.current = window.setInterval(() => {
        setIndex((prev) => (prev + 1) % filteredItems.length)
      }, 25000)
    }
    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    start()
    const el = hoverRef.current
    const onEnter = () => stop()
    const onLeave = () => start()
    el?.addEventListener('mouseenter', onEnter)
    el?.addEventListener('mouseleave', onLeave)
    return () => {
      stop()
      el?.removeEventListener('mouseenter', onEnter)
      el?.removeEventListener('mouseleave', onLeave)
    }
  }, [autoRotate, minimized, filteredItems.length])

  if (hidden) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1100,
        maxWidth: 'min(360px, 92vw)',
        transform: reduceMotionRef.current ? 'none' : 'translateY(4px)',
        opacity: 0.98,
        transition: reduceMotionRef.current
          ? 'none'
          : 'transform 300ms ease, opacity 300ms ease',
      }}
      aria-live="polite"
      ref={hoverRef}
    >
      <div
        style={{
          background: isDark ? 'rgba(17, 24, 39, 0.96)' : 'rgba(255, 255, 255, 0.96)',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12,
          boxShadow:
            isDark
              ? '0 6px 20px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)'
              : '0 6px 20px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          backdropFilter: 'saturate(180%) blur(8px)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            background: isDark
              ? 'linear-gradient(90deg, #14532d 0%, #166534 100%)'
              : 'linear-gradient(90deg, #2d7d32 0%, #3aa041 100%)',
            color: 'white',
            fontWeight: 600,
          }}
        >
          <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            <span
              aria-hidden
              style={{ width: 8, height: 8, background: 'white', borderRadius: 9999 }}
            />
            {current.type === 'hadith' ? 'حديث اليوم' : 'آية اليوم'}
          </span>
          <span style={{ display: 'inline-flex', gap: 8 }}>
            <button
              aria-label="إعدادات"
              title="إعدادات"
              onClick={() => {
                const next = mode === 'mixed' ? 'hadith' : mode === 'hadith' ? 'ayah' : 'mixed'
                setMode(next)
                try {
                  localStorage.setItem('floating-inspiration:mode', next)
                } catch {}
              }}
              style={{
                background: 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              ⚙
            </button>
            <button
              aria-label={autoRotate ? 'إيقاف التبديل التلقائي' : 'تشغيل التبديل التلقائي'}
              title={autoRotate ? 'إيقاف التبديل التلقائي' : 'تشغيل التبديل التلقائي'}
              onClick={() => {
                const next = !autoRotate
                setAutoRotate(next)
                try {
                  localStorage.setItem('floating-inspiration:auto', next ? '1' : '0')
                } catch {}
              }}
              style={{
                background: 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              {autoRotate ? '⏸' : '▶'}
            </button>
            <button
              aria-label={minimized ? 'تكبير' : 'تصغير'}
              onClick={() => {
                const next = !minimized
                setMinimized(next)
                try {
                  localStorage.setItem('floating-inspiration:minimized', next ? '1' : '0')
                } catch {}
              }}
              style={{
                background: 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              {minimized ? '▢' : '—'}
            </button>
            <button
              aria-label="إغلاق"
              onClick={() => {
                setHidden(true)
                try {
                  localStorage.setItem('floating-inspiration:hidden', '1')
                } catch {}
              }}
              style={{
                background: 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              ×
            </button>
          </span>
        </div>

        {!minimized && (
          <div style={{ padding: 12 }}>
            <div
              style={{
                fontFamily: 'var(--font-amiri-quran)',
                lineHeight: 1.8,
                fontSize: 16,
                color: isDark ? '#e5e7eb' : '#111827',
              }}
            >
              {current.arabic}
            </div>
            {current.translation && (
              <div style={{ marginTop: 8, color: isDark ? '#9ca3af' : '#374151', fontSize: 14 }}>
                {current.translation}
              </div>
            )}
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                gap: 8,
                color: isDark ? '#9ca3af' : '#6b7280',
                fontSize: 12,
              }}
            >
              {current.type === 'hadith' && current.source ? <span>المصدر: {current.source}</span> : null}
              {current.type === 'ayah' && current.reference ? <span>{current.reference}</span> : null}
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
              <button
                onClick={() => setIndex((prev) => (prev + 1) % (filteredItems.length || 1))}
                style={{
                  background: isDark ? '#111827' : '#f3f4f6',
                  border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: isDark ? '#e5e7eb' : '#111827',
                }}
              >
                عشوائي
              </button>
              <button
                onClick={() => {
                  try {
                    const text = `${current.arabic}\n\n${current.translation ?? ''}`.trim()
                    if (navigator.share) {
                      navigator.share({ title: 'إلهام اليوم', text })
                    } else if (navigator.clipboard) {
                      navigator.clipboard.writeText(text)
                      alert('تم نسخ النص')
                    }
                  } catch {}
                }}
                style={{
                  background: '#2d7d32',
                  color: 'white',
                  border: '1px solid #256629',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                مشاركة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



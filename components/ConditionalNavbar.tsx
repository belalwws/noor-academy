'use client'

import { usePathname } from 'next/navigation'
import { Header } from './landingpage/sections/Header'

const ConditionalNavbar = () => {
  const pathname = usePathname()

  // صفحات لا تحتاج إلى أي هيدر
  const noHeaderPages = [
    '/meet',
    '/custom',
    '/api'
  ]

  // تحقق من المسارات المستثناة
  const shouldShowNoHeader = noHeaderPages.some(path =>
    pathname?.startsWith(path)
  )

  // تحقق من المسارات الفرعية للـ meet
  if (pathname?.includes('/meet/') || pathname?.includes('/custom/')) {
    return null
  }

  if (shouldShowNoHeader) {
    return null
  }

  // استخدام Header الجديد في كل الصفحات
  return <Header />
}

export default ConditionalNavbar

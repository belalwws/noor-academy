import type { Metadata } from 'next'
import Providers from './providers'
import AuthInitializer from '../components/AuthInitializer'
import ConditionalNavbar from '../components/ConditionalNavbar'
import FloatingInspiration from '../components/FloatingInspiration'
// LiveSessionsProvider removed - using Redux now
import { ReminderProviderWrapper } from '../components/reminders/ReminderProviderWrapper'
import './globals.css'
import {
  Cairo,
  Tajawal,
  Poppins,
  Amiri_Quran,
  Amiri,
  Baloo_Bhaijaan_2,
  Noto_Naskh_Arabic,
  Scheherazade_New,
  Noto_Kufi_Arabic
} from 'next/font/google'

// Main fonts for landing page
const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  preload: true, // Preload main font for better performance
  fallback: ['system-ui', 'arial'],
})

const tajawal = Tajawal({
  subsets: ['arabic'],
  variable: '--font-tajawal',
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: false, // Don't preload secondary fonts
  fallback: ['system-ui', 'arial'],
})

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'arial'],
})

// Arabic fonts for Quran reader - only load when needed
const amiriQuran = Amiri_Quran({
  subsets: ['arabic'],
  variable: '--font-amiri-quran',
  weight: ['400'],
  display: 'swap',
  preload: false, // Lazy load - only used in Quran pages
  fallback: ['system-ui', 'arial'],
})

const amiri = Amiri({
  subsets: ['arabic'],
  variable: '--font-amiri',
  weight: ['400', '700'],
  display: 'swap',
  preload: false, // Lazy load - only used in specific pages
  fallback: ['system-ui', 'arial'],
})

const balooBhaijaan2 = Baloo_Bhaijaan_2({
  subsets: ['arabic'],
  variable: '--font-baloo-bhaijaan-2',
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'arial'],
})

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-naskh-arabic',
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'arial'],
})

const scheherazadeNew = Scheherazade_New({
  subsets: ['arabic'],
  variable: '--font-scheherazade-new',
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'arial'],
})

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-kufi-arabic',
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'arial'],
})

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'أكاديمية نور',
  description:
    'أكاديمية نور منصة تعليمية قرآنية متكاملة تجمع بين الإتقان والعصرية بإشراف نخبة من المعلمين والمعلمات. نقدم تحفيظ القرآن الكريم بروايات متعددة وتجويد وتلقين بأساليب مبسطة.',
  url: 'https://nour.academy',
  logo: 'https://nour.academy/logo.png',
  sameAs: [],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'JO',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+962776642079',
    contactType: 'customer service',
    availableLanguage: ['ar'],
  },
}

export const metadata: Metadata = {
  metadataBase: new URL('https://nour.academy'),
  title: {
    default: 'أكاديمية نور | منصة تعليمية قرآنية متكاملة',
    template: '%s | أكاديمية نور',
  },
  description:
    'أكاديمية نور منصة تعليمية قرآنية متكاملة تجمع بين الإتقان والعصرية بإشراف نخبة من المعلمين والمعلمات. نقدم تحفيظ القرآن الكريم بروايات متعددة وتجويد وتلقين بأساليب مبسطة.',
  keywords: ['أكاديمية نور', 'تعليم القرآن', 'تحفيظ القرآن', 'تعليم إلكتروني', 'منصة تعليمية', 'تعليم الأطفال', 'دورات قرآنية'],
  authors: [{ name: 'أكاديمية نور' }],
  creator: 'أكاديمية نور',
  publisher: 'أكاديمية نور',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'أكاديمية نور | منصة تعليمية قرآنية متكاملة',
    description:
      'أكاديمية نور منصة تعليمية قرآنية متكاملة تجمع بين الإتقان والعصرية بإشراف نخبة من المعلمين والمعلمات. نقدم تحفيظ القرآن الكريم بروايات متعددة وتجويد وتلقين بأساليب مبسطة.',
    url: 'https://nour.academy',
    siteName: 'أكاديمية نور',
    locale: 'ar_JO',
    type: 'website',
    images: [
      {
        url: 'https://nour.academy/logo.png',
        width: 512,
        height: 512,
        alt: 'شعار أكاديمية نور',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'أكاديمية نور | منصة تعليمية قرآنية متكاملة',
    description:
      'أكاديمية نور منصة تعليمية قرآنية متكاملة تجمع بين الإتقان والعصرية بإشراف نخبة من المعلمين والمعلمات.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ rel: 'apple-touch-icon', url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Preconnect to API domains (production/staging) */}
        <link rel="dns-prefetch" href="https://staging-backend.render.com" />
        <link rel="dns-prefetch" href="https://backend.render.com" />
        <link rel="dns-prefetch" href="https://lisan-alhekma.onrender.com" />
        <link rel="preconnect" href="https://staging-backend.render.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://backend.render.com" crossOrigin="anonymous" />
        
        {/* Preconnect to Wasabi for images */}
        <link rel="dns-prefetch" href="https://s3.wasabisys.com" />
        <link rel="dns-prefetch" href="https://s3.eu-central-1.wasabisys.com" />
        <link rel="preconnect" href="https://s3.wasabisys.com" crossOrigin="anonymous" />

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* Additional meta tags for better SEO and performance */}
        <meta name="theme-color" content="#2d7d32" />
        <meta name="msapplication-TileColor" content="#2d7d32" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="أكاديمية نور" />

        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" sizes="512x512" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${cairo.variable} ${tajawal.variable} ${poppins.variable} ${amiriQuran.variable} ${amiri.variable} ${balooBhaijaan2.variable} ${notoNaskhArabic.variable} ${scheherazadeNew.variable} ${notoKufiArabic.variable}`}
        suppressHydrationWarning
      >
        <Providers>
          <ReminderProviderWrapper>
            <AuthInitializer />
            <ConditionalNavbar />
            {children}
          </ReminderProviderWrapper>
        </Providers>
        {false && <FloatingInspiration />}

        {/* Additional error handling script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Additional client-side error handling
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(event) {
                  // Suppress React hydration errors
                  if (event.message && (
                    event.message.includes('removeChild') ||
                    event.message.includes('NotFoundError') ||
                    event.message.includes('hydration')
                  )) {
                    event.preventDefault();
                    return false;
                  }
                });

                // Suppress unhandled promise rejections that are hydration-related
                window.addEventListener('unhandledrejection', function(event) {
                  if (event.reason && event.reason.message && (
                    event.reason.message.includes('removeChild') ||
                    event.reason.message.includes('NotFoundError') ||
                    event.reason.message.includes('hydration')
                  )) {
                    event.preventDefault();
                    return false;
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

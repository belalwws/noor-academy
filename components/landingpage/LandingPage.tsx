'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/landingpage/sections/Header';
import { HeroSection } from '@/components/landingpage/sections/HeroSection';
import { FeaturesSection } from '@/components/landingpage/sections/FeaturesSection';

// Lazy load sections below the fold for better performance
const KidsLearningSection = dynamic(
  () => import('@/components/landingpage/sections/KidsLearningSection').then(mod => ({ default: mod.KidsLearningSection })),
  { 
    loading: () => <div className="h-64 bg-white animate-pulse" />,
    ssr: false 
  }
);

const WomenAdultsSection = dynamic(
  () => import('@/components/landingpage/sections/WomenAdultsSection').then(mod => ({ default: mod.WomenAdultsSection })),
  { 
    loading: () => <div className="h-64 bg-white animate-pulse" />,
    ssr: false 
  }
);

const BusyAdultsSection = dynamic(
  () => import('@/components/landingpage/sections/BusyAdultsSection').then(mod => ({ default: mod.BusyAdultsSection })),
  { 
    loading: () => <div className="h-64 bg-white animate-pulse" />,
    ssr: false 
  }
);

const CoursesSection = dynamic(
  () => import('@/components/landingpage/sections/CoursesSection').then(mod => ({ default: mod.CoursesSection })),
  { 
    loading: () => <div className="h-64 bg-white animate-pulse" />,
    ssr: false 
  }
);

const InteractionSection = dynamic(
  () => import('@/components/landingpage/sections/InteractionSection').then(mod => ({ default: mod.InteractionSection })),
  { 
    loading: () => <div className="h-64 bg-white animate-pulse" />,
    ssr: false 
  }
);

const IslamicFeaturesSection = dynamic(
  () => import('@/components/landingpage/sections/IslamicFeaturesSection').then(mod => ({ default: mod.IslamicFeaturesSection })),
  { 
    loading: () => <div className="h-64 bg-white animate-pulse" />,
    ssr: false 
  }
);

const ContactSection = dynamic(
  () => import('@/components/landingpage/sections/ContactSection').then(mod => ({ default: mod.ContactSection })),
  { 
    loading: () => <div className="h-64 bg-white animate-pulse" />,
    ssr: false 
  }
);

const Footer = dynamic(
  () => import('@/components/landingpage/sections/Footer').then(mod => ({ default: mod.Footer })),
  { 
    loading: () => <div className="h-48 bg-white animate-pulse" />,
    ssr: false 
  }
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white transition-colors duration-300">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <Suspense fallback={<div className="h-64 bg-white animate-pulse" />}>
          <KidsLearningSection />
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-white animate-pulse" />}>
          <WomenAdultsSection />
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-white animate-pulse" />}>
          <BusyAdultsSection />
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-white animate-pulse" />}>
          <CoursesSection />
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-white animate-pulse" />}>
          <InteractionSection />
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-white animate-pulse" />}>
          <IslamicFeaturesSection />
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-white animate-pulse" />}>
          <ContactSection />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default LandingPage;

'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/landingpage/sections/Header';
import { HeroSection } from '@/components/landingpage/sections/HeroSection';
import { FeaturesSection } from '@/components/landingpage/sections/FeaturesSection';
import { CoursesSection } from '@/components/landingpage/sections/CoursesSection';
import { InteractionSection } from '@/components/landingpage/sections/InteractionSection';
import { KidsLearningSection } from '@/components/landingpage/sections/KidsLearningSection';
import { WomenAdultsSection } from '@/components/landingpage/sections/WomenAdultsSection';
import { BusyAdultsSection } from '@/components/landingpage/sections/BusyAdultsSection';
import { IslamicFeaturesSection } from '@/components/landingpage/sections/IslamicFeaturesSection';
import { ContactSection } from '@/components/landingpage/sections/ContactSection';

const Footer = dynamic(
  () => import('@/components/landingpage/sections/Footer').then(mod => ({ default: mod.Footer })),
  { loading: () => <div className="h-96 bg-white animate-pulse" /> }
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white transition-colors duration-300">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <KidsLearningSection />
        <WomenAdultsSection />
        <BusyAdultsSection />
        <CoursesSection />
        <InteractionSection />
        <IslamicFeaturesSection />
        <ContactSection />
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default LandingPage;

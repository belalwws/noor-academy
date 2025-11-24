'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ElementType } from 'react';
import {
  Award,
  BookOpen,
  Compass,
  Heart,
  Layers,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import aboutData from '@/data/about.json';

type Feature = {
  icon: ElementType;
  title: string;
  description: string;
};

const iconMap: Record<string, ElementType> = {
  BookOpen,
  Layers,
  Users,
  Heart,
  Compass,
  Award,
};

const features: Feature[] = aboutData.features.items.map((item, index) => {
  const icons = [BookOpen, Layers, Users, Heart, Compass, Award];
  return {
    icon: icons[index] || BookOpen,
    title: item.title,
    description: item.description,
  };
});

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('ℹ️ [About Page] About page loaded');
  }, []);

  return (
    <main
      lang="ar"
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-background-light via-white to-background-light text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100"
    >
      <section className="relative overflow-hidden pb-20 pt-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1e40af]/25 via-transparent to-[#2563eb]/40 blur-3xl dark:from-blue-500/30 dark:to-blue-400/25" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 text-center">
          <motion.div
            initial={fadeUp.hidden}
            animate={fadeUp.visible}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Badge className="rounded-full bg-[#1e40af]/10 px-4 py-2 text-[#1e40af] dark:bg-blue-500/20 dark:text-blue-400">
              {aboutData.hero.badges.vision}
            </Badge>
            <Badge variant="outline" className="rounded-full border-[#1e40af]/40 px-4 py-2 text-[#1e40af] dark:border-blue-400/40 dark:text-blue-400">
              {aboutData.hero.badges.academy}
            </Badge>
          </motion.div>
          <motion.h1
            initial={fadeUp.hidden}
            animate={fadeUp.visible}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-balance text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
          >
            {aboutData.hero.title}
          </motion.h1>
          <motion.p
            initial={fadeUp.hidden}
            animate={fadeUp.visible}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300"
          >
            {aboutData.hero.description}
          </motion.p>
          <motion.div
            initial={fadeUp.hidden}
            animate={fadeUp.visible}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button size="lg" className="min-w-[12rem]" onClick={() => router.push('/contact')}>
              {aboutData.hero.buttons.contact}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="border border-[#1e40af] bg-transparent text-[#1e40af] hover:bg-[#1e40af]/10 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/10"
              onClick={() => router.push('/programs')}
            >
              {aboutData.hero.buttons.programs}
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={fadeUp.hidden}
          animate={fadeUp.visible}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto mt-16 grid max-w-6xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {aboutData.metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={fadeUp.hidden}
              whileInView={fadeUp.visible}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="rounded-3xl border border-[#1e40af]/20 bg-white/80 p-6 text-right shadow-sm backdrop-blur-sm dark:border-blue-400/30 dark:bg-slate-900/60"
            >
              <p className="text-4xl font-bold text-[#1e40af] dark:text-blue-400">{metric.value}</p>
              <p className="mt-2 text-lg font-semibold">{metric.label}</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{metric.caption}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.div
          initial={fadeUp.hidden}
          whileInView={fadeUp.visible}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 mt-12 max-w-3xl text-center"
        >
          <h2 className="text-3xl font-semibold md:text-4xl">{aboutData.features.title}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            {aboutData.features.subtitle}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <Card
              key={title}
              className="group border-transparent bg-white/85 p-6 text-right shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm transition hover:-translate-y-1 hover:ring-[#1e40af]/60 dark:bg-slate-900/70 dark:ring-slate-800"
            >
              <CardContent className="space-y-5 p-0">
                <span className="inline-flex h-12 w-12 items-center justify-center self-end rounded-2xl bg-[#1e40af]/10 text-[#1e40af] transition group-hover:bg-[#1e40af]/20 dark:bg-blue-500/20 dark:text-blue-400 dark:group-hover:bg-[#2563eb]/30">
                  <Icon className="h-6 w-6" />
                </span>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="leading-7 text-slate-600 dark:text-slate-300">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-white/80 py-20 dark:bg-slate-900/60">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={fadeUp.hidden}
            whileInView={fadeUp.visible}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <h2 className="text-3xl font-semibold md:text-4xl">{aboutData.pillars.title}</h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              {aboutData.pillars.subtitle}
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {aboutData.pillars.items.map((pillar, index) => (
              <Card
                key={pillar.title}
                className="border-[#1e40af]/10 bg-gradient-to-br from-white via-white to-[#1e40af]/5 text-right dark:from-slate-900 dark:via-slate-900 dark:to-blue-500/10"
              >
                <CardContent className="space-y-4 p-6">
                  <Badge className="ml-auto w-fit rounded-full bg-[#1e40af]/15 px-3 py-1 text-xs font-medium text-[#1e40af] dark:bg-blue-500/20 dark:text-blue-400">
                    {index + 1}
                  </Badge>
                  <CardTitle className="text-2xl">{pillar.title}</CardTitle>
                  <p className="text-sm font-semibold text-[#1e40af] dark:text-blue-400">{pillar.summary}</p>
                  <CardDescription className="leading-7 text-slate-600 dark:text-slate-300">
                    {pillar.detail}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={fadeUp.hidden}
          whileInView={fadeUp.visible}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <Badge variant="outline" className="rounded-full border-[#1e40af]/40 px-4 py-2 text-[#1e40af] dark:border-blue-400/40 dark:text-blue-400">
            {aboutData.journey.badge}
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">{aboutData.journey.title}</h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            {aboutData.journey.subtitle}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {aboutData.journey.steps.map((step, index) => (
            <Card
              key={step.title}
              className="border-dashed border-slate-200 bg-white/85 text-right shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
            >
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e40af] text-base font-semibold text-white">
                    {index + 1}
                  </span>
                  <Sparkles className="h-5 w-5 text-[#1e40af]/70 dark:text-blue-400/70" />
                </div>
                <CardTitle className="text-2xl">{step.title}</CardTitle>
                <CardDescription className="leading-7 text-slate-600 dark:text-slate-300">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#1e40af] via-[#1e40af] to-[#2563eb] py-20 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <Card className="border-none bg-white/10 p-8 text-right backdrop-blur-md">
            <CardContent className="space-y-6 p-0">
              <Badge className="ml-auto w-fit rounded-full bg-white/20 px-3 py-1 text-white">
                {aboutData.founder.badge}
              </Badge>
              <blockquote className="text-2xl leading-9">
                {aboutData.founder.quote}
              </blockquote>
              <CardFooter className="flex flex-col items-start gap-1 p-0 text-white/80">
                <p className="font-semibold">{aboutData.founder.name}</p>
                <p className="text-sm">{aboutData.founder.position}</p>
              </CardFooter>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pb-24 pt-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl border border-[#1e40af]/30 bg-white/90 px-8 py-16 text-center shadow-lg backdrop-blur-sm dark:border-blue-400/40 dark:bg-slate-900/70">
          <motion.h2
            initial={fadeUp.hidden}
            whileInView={fadeUp.visible}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold md:text-4xl"
          >
            {aboutData.cta.title}
          </motion.h2>
          <motion.p
            initial={fadeUp.hidden}
            whileInView={fadeUp.visible}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl text-base text-slate-600 dark:text-slate-300"
          >
            {aboutData.cta.description}
          </motion.p>
          <motion.div
            initial={fadeUp.hidden}
            whileInView={fadeUp.visible}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button size="lg" onClick={() => router.push('/contact')}>
              {aboutData.cta.buttons.book}
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

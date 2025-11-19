'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

type Section = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const sections: Section[] = [
  {
    title: 'مقدمة',
    paragraphs: [
      'مرحباً بك في منصة رشد سيستم أكاديمي. باستخدامك لأي من خدمات المنصة فإنك توافق على الالتزام بهذه الشروط والأحكام، لذا نرجو قراءتها بعناية قبل إنشاء حسابك أو الاستفادة من أي خدمة تعليمية.'
    ]
  },
  {
    title: 'إنشاء الحساب والمسؤوليات',
    paragraphs: [
      'يجب أن تكون جميع البيانات التي تزودنا بها دقيقة ومحدثة، ويعد المستخدم مسؤولاً عن الحفاظ على سرية بيانات الدخول الخاصة به.',
      'يحق للمنصة تعليق أو إيقاف أي حساب يتم استخدامه بشكل يخالف السياسات أو يعرّض المنصة أو المستخدمين الآخرين لأي ضرر.'
    ]
  },
  {
    title: 'الخدمات التعليمية والمحتوى',
    paragraphs: [
      'تسعى المنصة إلى توفير محتوى تعليمي موثوق ومتجدد، ومع ذلك قد تتغير المناهج أو الجداول أو المشرفون دون إشعار مسبق تماشياً مع متطلبات الجودة.',
      'يحظر إعادة نشر أو مشاركة أي من المحتوى التعليمي أو المواد المصاحبة خارج المنصة دون إذن خطي مسبق.'
    ]
  },
  {
    title: 'المدفوعات والاشتراكات',
    paragraphs: [
      'قد تتطلب بعض الدورات أو البرامج سداد رسوم محددة، وتُعرض تفاصيل الرسوم وخيارات الدفع بوضوح قبل إتمام الطلب.',
      'في حال الإلغاء أو طلب الاسترداد تُطبق سياسات كل برنامج كما هي موضحة في صفحة التسجيل الخاصة به.'
    ]
  },
  {
    title: 'السلوك المقبول',
    paragraphs: [
      'يلتزم جميع المستخدمين بالتعامل باحترام داخل الصفوف الافتراضية والمجموعات المجتمعية، ويُمنع نشر أي محتوى مسيء أو مخالف للآداب العامة أو القوانين المحلية.',
      'يحق للمنصة اتخاذ الإجراءات المناسبة، بما في ذلك تعليق الوصول أو حذف المحتوى المسيء، حفاظاً على بيئة تعلم آمنة.'
    ]
  },
  {
    title: 'حقوق الملكية الفكرية',
    paragraphs: [
      'جميع العلامات والشعارات والمحتوى النصي والمرئي والبرمجي المقدم عبر منصة رشد سيستم أكاديمي ملكية خاصة بالمنصة أو شركائها ويُحظر استخدامها لأغراض تجارية دون تصريح.',
      'المستخدم يحتفظ بملكيته للأعمال أو الواجبات التي يرفعها على المنصة، مع منحه لنا رخصة محدودة لاستخدامها لغرض التقييم أو التحسين التعليمي.'
    ]
  },
  {
    title: 'التعديلات وإنهاء الخدمة',
    paragraphs: [
      'تحتفظ المنصة بحق تعديل هذه الشروط أو أي من خدماتها في أي وقت، وسيتم إخطار المستخدمين بالتعديلات الجوهرية من خلال القنوات المتاحة داخل المنصة أو عبر البريد الإلكتروني.',
      'يمكن للمستخدم إغلاق حسابه في أي وقت من خلال إعدادات الحساب، وتظل الالتزامات المالية المستحقة قائمة حتى بعد الإغلاق.'
    ]
  },
  {
    title: 'التواصل والدعم',
    paragraphs: [
      'يمكنك التواصل مع فريق الدعم عبر مركز المساعدة داخل المنصة أو من خلال البريد الإلكتروني الرسمي للحصول على مساعدة فنية أو استفسارات حول البرامج التعليمية.'
    ],
    bullets: [
      'البريد الإلكتروني للدعم: support@rushdsystemacademy.com',
      'ساعات الاستجابة المتوقعة: من الأحد إلى الخميس، 9 صباحاً - 6 مساءً بتوقيت الرياض.'
    ]
  }
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50/80 dark:bg-slate-900 pt-32 pb-16 md:pt-40">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 text-right"
        >
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
            الشروط والأحكام
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            الإطار النظامي لاستخدام منصة رشد سيستم أكاديمي
          </h1>
          <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
            بهدف توفير بيئة تعلم رقمية موثوقة، نوضح أدناه التزامات المنصة والمستخدمين
            والضوابط التي تنظّم الاستفادة من المحتوى والخدمات التعليمية.
          </p>
        </motion.div>

        <div className="space-y-10">
          {sections.map((section) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-slate-200 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-800/60"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3 text-right text-sm leading-7 text-slate-600 dark:text-slate-300">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className="space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex flex-row-reverse items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </motion.section>
          ))}
        </div>

        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-right shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10"
        >
          <p className="text-sm text-amber-800 dark:text-amber-200">
            استمرارك في استخدام المنصة بعد نشر أي تحديثات يُعد موافقة ضمنية على الشروط المحدثة.
            إن كانت لديك أسئلة إضافية نرجو الاطلاع أيضاً على{' '}
            <Link
              href="/privacy"
              className="font-medium text-amber-700 underline hover:text-amber-800 dark:text-amber-200 dark:hover:text-amber-100"
            >
              سياسة الخصوصية
            </Link>
            .
          </p>
        </motion.footer>
      </div>
    </main>
  );
}

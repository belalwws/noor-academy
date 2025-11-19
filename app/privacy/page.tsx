'use client';

import { motion } from 'framer-motion';

type Section = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const sections: Section[] = [
  {
    title: 'مقدمة عن الخصوصية',
    paragraphs: [
      'نلتزم في منصة رشد سيستم أكاديمي بحماية خصوصية مستخدمينا وضمان استخدام بياناتهم بشكل مسؤول وشفاف. توضح هذه السياسة نوع البيانات التي نجمعها، وكيف نستخدمها، والخيارات المتاحة لك لإدارتها.'
    ]
  },
  {
    title: 'البيانات التي نجمعها',
    paragraphs: [
      'عند إنشاء حساب أو التسجيل في برنامج تعليمي، قد نطلب معلومات أساسية مثل الاسم، البريد الإلكتروني، رقم الجوال، الدولة، واللغة المفضلة.',
      'نجمع أيضاً بعض البيانات التقنية تلقائياً مثل نوع الجهاز والمتصفح، ووقت الاستخدام، والصفحات التي يتم زيارتها بهدف تحسين الأداء وتجربة المستخدم.'
    ]
  },
  {
    title: 'كيفية استخدام البيانات',
    paragraphs: [
      'نستخدم بياناتك لتفعيل حسابك، وتمكينك من الوصول إلى الدورات، وإدارة عمليات الدفع، وتقديم الدعم الفني، وإرسال التنبيهات المهمة المتعلقة بالخدمات.',
      'قد نستخدم البيانات المجمّعة بشكل مجهول لتحليل أداء المنصة وتطوير المناهج والميزات الجديدة.'
    ]
  },
  {
    title: 'مشاركة البيانات مع الغير',
    paragraphs: [
      'لا نقوم ببيع بياناتك الشخصية لأي طرف ثالث. قد نشارك البيانات اللازمة فقط مع مزودي الخدمات الموثوقين (مثل حلول الدفع أو أنظمة البث) بهدف تقديم الخدمة لك، على أن يلتزموا بمعايير حماية البيانات.',
      'عند الحاجة القانونية أو التنظيمية قد نشارك معلومات محدودة مع الجهات المختصة وفقاً للأنظمة المعمول بها في المملكة العربية السعودية.'
    ]
  },
  {
    title: 'ملفات تعريف الارتباط (Cookies)',
    paragraphs: [
      'نستخدم ملفات تعريف الارتباط لتحسين أداء المنصة وتخصيص المحتوى بما يتناسب مع تفضيلاتك. يمكنك التحكم في قبول أو رفض هذه الملفات عبر إعدادات المتصفح، إلا أن تعطيلها قد يؤثر على بعض الوظائف.'
    ]
  },
  {
    title: 'حماية البيانات',
    paragraphs: [
      'نطبق ممارسات أمنية متعددة الطبقات تشمل التشفير والمراقبة المستمرة وحصر الوصول للموظفين المصرح لهم فقط لضمان حماية بياناتك.',
      'على الرغم من حرصنا على حماية المعلومات، فإن أي نقل بيانات عبر الإنترنت ينطوي على قدر من المخاطر، لذا نحثك على استخدام كلمات مرور قوية وتحديثها بشكل دوري.'
    ]
  },
  {
    title: 'حقوقك واختياراتك',
    paragraphs: [
      'يمكنك تحديث معلومات حسابك أو طلب تصحيحها في أي وقت عبر صفحة الملف الشخصي.',
      'يحق لك طلب حذف حسابك أو تقييد بعض الاستخدامات، وسنعمل على تنفيذ طلبك بما يتوافق مع المتطلبات النظامية والتعليمية.'
    ],
    bullets: [
      'لطلب حذف الحساب راسل فريق الدعم موضحاً رقم جوالك والبريد المرتبط بالحساب.',
      'سنقوم بمراجعة الطلب والرد خلال مدة لا تتجاوز سبعة أيام عمل.'
    ]
  },
  {
    title: 'تحديثات سياسة الخصوصية',
    paragraphs: [
      'قد نقوم بتحديث هذه السياسة لتعكس المتطلبات التنظيمية أو التغييرات في الخدمات. سيتم إخطار المستخدمين بالتغييرات الجوهرية عبر البريد الإلكتروني أو الإشعارات داخل المنصة.',
      'يتحمل المستخدم مسؤولية مراجعة السياسة دورياً لضمان اطلاعه على أحدث النسخ.'
    ]
  },
  {
    title: 'التواصل',
    paragraphs: [
      'لأي استفسارات حول سياسة الخصوصية أو طريقة معالجة بياناتك يمكنك التواصل مع فريق الحماية والامتثال عبر البريد الإلكتروني التالي:',
      'privacy@rushdsystemacademy.com'
    ]
  }
];

export default function PrivacyPage() {
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
            سياسة الخصوصية
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            حماية بياناتك في منصة رشد سيستم أكاديمي
          </h1>
          <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
            نلتزم بتقديم تجربة تعلم رقمية آمنة تحترم خصوصيتك وتضمن لك سيطرة واضحة على بياناتك
            الشخصية وأوجه استخدامها داخل المنصة.
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
            يُعد استمرارك في استخدام خدماتنا بعد أي تحديث لهذه السياسة موافقة صريحة على البنود المحدثة.
            للاطلاع على تفاصيل الالتزام بالخدمة نرجو مراجعة صفحة الشروط والأحكام.
          </p>
        </motion.footer>
      </div>
    </main>
  );
}

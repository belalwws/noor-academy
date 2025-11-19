"use client";

import { useState } from "react";
import Link from "next/link";
import Head from "next/head";


type FAQ = {
  question: string;
  answer: string;
  category: string;
};

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const faqs: FAQ[] = [
    {
      question: "كيف يمكنني التسجيل في الأكاديمية؟",
      answer: "يمكنك التسجيل بسهولة من خلال النقر على زر 'سجل الآن' في أعلى الصفحة، ثم ملء البيانات المطلوبة. ستحصل على حساب مجاني فوراً مع إمكانية الوصول للدروس التجريبية.",
      category: "registration"
    },
    {
      question: "هل الدروس مجانية؟",
      answer: "نعم، نقدم العديد من الدروس المجانية للمبتدئين. كما نوفر دورات متقدمة مدفوعة بأسعار رمزية لدعم استمرارية الأكاديمية وتطوير المحتوى.",
      category: "pricing"
    },
    {
      question: "ما هي أوقات الدروس المباشرة؟",
      answer: "نقدم دروساً مباشرة يومياً من الساعة 8 صباحاً حتى 10 مساءً بتوقيت مكة المكرمة. يمكنك اختيار الوقت المناسب لك عند التسجيل في الدرس.",
      category: "schedule"
    },
    {
      question: "هل يمكنني الحصول على شهادة معتمدة؟",
      answer: "نعم، نقدم شهادات معتمدة عند إتمام الدورات بنجاح. الشهادات معترف بها من قبل عدة مؤسسات تعليمية إسلامية.",
      category: "certificates"
    },
    {
      question: "كيف يتم التواصل مع المدرسين؟",
      answer: "يمكنك التواصل مع المدرسين من خلال منصة الأكاديمية، أو عبر البريد الإلكتروني، أو من خلال جلسات الأسئلة والأجوبة المباشرة.",
      category: "communication"
    },
    {
      question: "ما هي المتطلبات التقنية للدراسة؟",
      answer: "تحتاج إلى جهاز كمبيوتر أو هاتف ذكي مع اتصال إنترنت مستقر. ننصح باستخدام متصفح حديث مثل Chrome أو Firefox للحصول على أفضل تجربة.",
      category: "technical"
    },
    {
      question: "هل يمكنني مراجعة الدروس المسجلة؟",
      answer: "نعم، جميع الدروس المباشرة يتم تسجيلها وتكون متاحة للمراجعة في أي وقت من خلال حسابك الشخصي.",
      category: "content"
    },
    {
      question: "كيف يمكنني تتبع تقدمي في التعلم؟",
      answer: "توفر المنصة نظام تتبع شامل يظهر لك تقدمك في كل دورة، والدروس المكتملة، والواجبات المنجزة، ونتائج الاختبارات.",
      category: "progress"
    },
    {
      question: "هل تقدمون دعماً فنياً؟",
      answer: "نعم، فريق الدعم الفني متاح 24/7 لمساعدتك في أي مشكلة تقنية. يمكنك التواصل معنا عبر البريد الإلكتروني أو الدردشة المباشرة.",
      category: "support"
    },
    {
      question: "ما هي طرق الدفع المتاحة؟",
      answer: "نقبل الدفع عبر البطاقات الائتمانية، PayPal، والتحويل البنكي. جميع المعاملات آمنة ومشفرة.",
      category: "pricing"
    }
  ];

  const categories = [
    { id: "all", name: "جميع الأسئلة" },
    { id: "registration", name: "التسجيل" },
    { id: "pricing", name: "الأسعار والدفع" },
    { id: "schedule", name: "المواعيد" },
    { id: "certificates", name: "الشهادات" },
    { id: "communication", name: "التواصل" },
    { id: "technical", name: "المتطلبات التقنية" },
    { id: "content", name: "المحتوى" },
    { id: "progress", name: "التقدم" },
    { id: "support", name: "الدعم الفني" }
  ];

  const filteredFAQs = selectedCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <Head>
        <title>الأسئلة الأكثر شيوعاً - أكاديمية لسان الحكمة</title>
        <meta name="description" content="إجابات شاملة على الأسئلة الأكثر شيوعاً حول أكاديمية لسان الحكمة للتعليم الإسلامي" />
        <meta name="keywords" content="أسئلة شائعة, FAQ, تعليم القرآن, أكاديمية لسان الحكمة, دعم" />
      </Head>

      <div lang="ar" dir="rtl">
        {/* Navbar */}

        <div
          className="min-h-screen"
          style={{
            background: 'linear-gradient(135deg, #2d7d32 0%, #1b5e20 50%, #0d3e10 100%)',
            fontFamily: "'Cairo', sans-serif"
          }}
        >
        {/* Header Section */}
        <section
          className="py-16 text-white"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
          }}
        >
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: "'Amiri', serif", color: '#ffd700' }}
              >
                ❓ الأسئلة الأكثر شيوعاً
              </h1>
              <div
                className="text-xl mb-6 text-white"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                ﴿وَاسْأَلُوا أَهْلَ الذِّكْرِ إِن كُنتُمْ لَا تَعْلَمُونَ﴾
              </div>
              <p className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-white/90">
                إجابات شاملة على جميع استفساراتكم حول أكاديمية لسان الحكمة
              </p>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav
          className="shadow-sm py-4"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 215, 0, 0.2)'
          }}
        >
          <div className="container mx-auto px-6">
            <div className="flex items-center space-x-2 text-sm text-white/80">
              <Link href="/" className="hover:text-yellow-300 transition-colors">
                الرئيسية
              </Link>
              <span className="mx-2">/</span>
              <span className="text-yellow-300 font-medium">الأسئلة الشائعة</span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            {/* Category Filter */}
            <div className="mb-12">
              <h2
                className="text-2xl font-bold text-center mb-8 text-white"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                اختر فئة الأسئلة
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: selectedCategory === category.id
                        ? 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: selectedCategory === category.id ? '#1b5e20' : 'white',
                      border: selectedCategory === category.id
                        ? 'none'
                        : '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== category.id) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== category.id) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-lg shadow-md overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full px-6 py-4 text-right flex justify-between items-center transition-colors"
                      style={{
                        background: activeIndex === index
                          ? 'rgba(255, 215, 0, 0.1)'
                          : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (activeIndex !== index) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeIndex !== index) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <span
                        className="font-semibold text-lg text-white"
                        style={{ fontFamily: "'Cairo', sans-serif" }}
                      >
                        {faq.question}
                      </span>
                      <div className={`transform transition-transform duration-200 ${
                        activeIndex === index ? "rotate-180" : ""
                      }`}>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: '#ffd700' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ${
                      activeIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}>
                      <div className="px-6 pb-4 text-white/90 leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-16 text-center">
              <div
                className="text-white rounded-lg p-8 max-w-4xl mx-auto"
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)',
                  color: '#1b5e20'
                }}
              >
                <h2
                  className="text-3xl font-bold mb-4"
                  style={{ fontFamily: "'Amiri', serif" }}
                >
                  لم تجد إجابة لسؤالك؟
                </h2>
                <p className="text-lg mb-6 leading-relaxed">
                  فريق الدعم متاح لمساعدتك في أي استفسار
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:support@lisanalhekma.com"
                    className="px-8 py-3 rounded-lg font-semibold transition-colors"
                    style={{
                      background: 'rgba(27, 94, 32, 0.1)',
                      color: '#1b5e20',
                      border: '1px solid rgba(27, 94, 32, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(27, 94, 32, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(27, 94, 32, 0.1)';
                    }}
                  >
                    <i className="fas fa-envelope mr-2"></i>
                    راسلنا عبر البريد
                  </a>
                  <a
                    href="#"
                    className="px-8 py-3 rounded-lg font-semibold transition-colors"
                    style={{
                      border: '2px solid #1b5e20',
                      color: '#1b5e20'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1b5e20';
                      e.currentTarget.style.color = '#ffd700';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#1b5e20';
                    }}
                  >
                    <i className="fas fa-comments mr-2"></i>
                    دردشة مباشرة
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/register"
                className="rounded-lg shadow-md p-6 text-center transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                }}
              >
                <div className="text-4xl mb-4" style={{ color: '#ffd700' }}>
                  <i className="fas fa-user-plus"></i>
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">ابدأ التعلم</h3>
                <p className="text-white/80">سجل حساباً مجانياً الآن</p>
              </Link>

              <Link
                href="/courses"
                className="rounded-lg shadow-md p-6 text-center transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                }}
              >
                <div className="text-4xl mb-4" style={{ color: '#ffd700' }}>
                  <i className="fas fa-book"></i>
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">تصفح الدورات</h3>
                <p className="text-white/80">اكتشف برامجنا التعليمية</p>
              </Link>

              <Link
                href="/testimonials"
                className="rounded-lg shadow-md p-6 text-center transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                }}
              >
                <div className="text-4xl mb-4" style={{ color: '#ffd700' }}>
                  <i className="fas fa-star"></i>
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">شهادات الطلاب</h3>
                <p className="text-white/80">اقرأ تجارب المتعلمين</p>
              </Link>
            </div>
          </div>
        </section>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
        }
        
        @media (max-width: 768px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </>
  );
}

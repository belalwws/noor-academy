import { chatScenarios } from '../data/chatScenarios';

// إضافة المزيد من السيناريوهات المتقدمة
export const advancedScenarios = {
  // ===== سيناريوهات أسلوب التعلم المتقدمة =====
  'assessment-learning-style': {
    id: 'assessment-learning-style',
    title: 'تحديد أسلوب التعلم المفضل',
    category: 'courses' as const,
    messages: [
      {
        id: 'learning-style-question',
        content: '🧠 **تحديد أسلوب التعلم الأمثل لك**\n\nكيف تتعلم بشكل أفضل؟',
        type: 'options' as const,
        options: [
          { id: 'visual', text: '👁️ بصري - الصور والرسوم', nextScenario: 'visual-learning-plan' },
          { id: 'auditory', text: '👂 سمعي - الاستماع والمحادثة', nextScenario: 'auditory-learning-plan' },
          { id: 'kinesthetic', text: '✋ حركي - التطبيق العملي', nextScenario: 'kinesthetic-learning-plan' },
          { id: 'reading', text: '📖 قرائي - القراءة والكتابة', nextScenario: 'reading-learning-plan' }
        ]
      }
    ]
  },

  'visual-learning-plan': {
    id: 'visual-learning-plan',
    title: 'خطة التعلم البصرية',
    category: 'courses' as const,
    messages: [
      {
        id: 'visual-plan',
        content: '👁️ **خطة التعلم البصرية المناسبة لك:**\n\n✨ **المقترحات:**\n🎥 فيديوهات تعليمية بصرية\n📊 خرائط ذهنية ومخططات\n🖼️ مواد بصرية تفاعلية\n📱 تطبيقات تعليمية مرئية\n\n🎯 **الدورات المناسبة:**\n• القرآن بالرسم العثماني\n• اللغة العربية بالصور\n• التجويد بالمخارج المرئية',
        type: 'options' as const,
        options: [
          { id: 'visual-courses', text: '📚 الدورات البصرية', nextScenario: 'visual-courses-list' },
          { id: 'visual-tools', text: '🛠️ الأدوات البصرية', nextScenario: 'visual-tools-list' },
          { id: 'schedule-visual', text: '📅 جدولة درس تجريبي', nextScenario: 'demo-booking' },
          { id: 'back-assessment', text: '↩️ العودة للتقييم', nextScenario: 'learning-assessment' }
        ]
      }
    ]
  },

  'auditory-learning-plan': {
    id: 'auditory-learning-plan',
    title: 'خطة التعلم السمعية',
    category: 'courses' as const,
    messages: [
      {
        id: 'auditory-plan',
        content: '👂 **خطة التعلم السمعية المناسبة لك:**\n\n✨ **المقترحات:**\n🎧 محاضرات صوتية مميزة\n🗣️ جلسات محادثة تفاعلية\n📻 دروس البودكاست\n🎵 تعلم بالإيقاع والتلحين\n\n🎯 **الدورات المناسبة:**\n• تحفيظ القرآن بالتلحين\n• تعلم النطق الصحيح\n• دروس الحديث الصوتية',
        type: 'options' as const,
        options: [
          { id: 'audio-courses', text: '🎧 الدورات الصوتية', nextScenario: 'audio-courses-list' },
          { id: 'podcast-series', text: '📻 سلسلة البودكاست', nextScenario: 'podcast-list' },
          { id: 'voice-sessions', text: '🗣️ جلسات صوتية', nextScenario: 'voice-booking' },
          { id: 'back-assessment', text: '↩️ العودة للتقييم', nextScenario: 'learning-assessment' }
        ]
      }
    ]
  },

  // ===== سيناريوهات الذكاء الاصطناعي والدعم المتقدم =====
  'ai-tutor': {
    id: 'ai-tutor',
    title: 'المعلم الذكي',
    category: 'courses' as const,
    messages: [
      {
        id: 'ai-tutor-intro',
        content: '🤖 **المعلم الذكي لأكاديمية لسان الحكمة**\n\n✨ **خدمات متطورة:**\n🧠 تقييم ذكي لمستواك\n📈 خطة تعلم مخصصة\n⚡ تصحيح فوري للأخطاء\n📊 تتبع التقدم التلقائي\n💡 اقتراحات ذكية للتحسين\n\nماذا تريد أن تتعلم اليوم؟',
        type: 'options' as const,
        options: [
          { id: 'ai-assessment', text: '📊 تقييم ذكي لمستواي', nextScenario: 'smart-assessment' },
          { id: 'ai-practice', text: '✍️ تمارين ذكية تفاعلية', nextScenario: 'smart-practice' },
          { id: 'ai-correction', text: '✅ تصحيح النطق والقراءة', nextScenario: 'pronunciation-check' },
          { id: 'ai-plan', text: '📋 خطة دراسة ذكية', nextScenario: 'smart-study-plan' }
        ]
      }
    ]
  },

  // ===== سيناريوهات المجتمع والتفاعل =====
  'community-features': {
    id: 'community-features',
    title: 'مجتمع المتعلمين',
    category: 'community' as const,
    messages: [
      {
        id: 'community-intro',
        content: '👥 **انضم لمجتمع لسان الحكمة**\n\n🌟 **مميزات المجتمع:**\n💬 منتديات نقاش تفاعلية\n👥 مجموعات دراسية\n🏆 تحديات ومسابقات\n📝 مشاركة الإنجازات\n🤝 دعم الأقران\n\nكيف تود المشاركة؟',
        type: 'options' as const,
        options: [
          { id: 'join-groups', text: '👥 الانضمام لمجموعة دراسية', nextScenario: 'study-groups' },
          { id: 'competitions', text: '🏆 المسابقات والتحديات', nextScenario: 'competitions-list' },
          { id: 'forums', text: '💬 المنتديات والنقاشات', nextScenario: 'forums-list' },
          { id: 'achievements', text: '🏅 عرض الإنجازات', nextScenario: 'achievements' }
        ]
      }
    ]
  },

  // ===== سيناريوهات متقدمة للدعم =====
  'advanced-support': {
    id: 'advanced-support',
    title: 'الدعم المتقدم',
    category: 'technical-support' as const,
    messages: [
      {
        id: 'advanced-support-options',
        content: '🔧 **الدعم المتقدم - نحن هنا لمساعدتك**\n\n💡 **خدمات الدعم المتطورة:**\n🎥 دعم فيديو مباشر\n📱 مساعدة عبر التطبيق\n🔄 نقل البيانات\n⚙️ إعدادات متقدمة\n📞 مكالمة مع خبير\n\nماذا تحتاج؟',
        type: 'options' as const,
        options: [
          { id: 'video-support', text: '🎥 دعم بالفيديو', nextScenario: 'video-support' },
          { id: 'data-transfer', text: '🔄 نقل البيانات', nextScenario: 'data-transfer' },
          { id: 'expert-call', text: '📞 مكالمة مع خبير', nextScenario: 'expert-consultation' },
          { id: 'advanced-settings', text: '⚙️ إعدادات متقدمة', nextScenario: 'advanced-settings' }
        ]
      }
    ]
  },

  // ===== سيناريوهات الشهادات والإنجازات =====
  'certification-path': {
    id: 'certification-path',
    title: 'مسار الشهادات',
    category: 'certificates' as const,
    messages: [
      {
        id: 'certification-intro',
        content: '🎓 **مسار الحصول على الشهادات المعتمدة**\n\n✨ **أنواع الشهادات:**\n📜 شهادة إتمام الدورة\n🏆 شهادة التميز\n👑 شهادة الإجازة\n🌟 شهادة المعلم المساعد\n\n📋 **متطلبات الحصول على الشهادة:**\n• إنهاء جميع الوحدات\n• اجتياز الاختبارات\n• تقديم مشروع تطبيقي\n• تقييم الأداء',
        type: 'options' as const,
        options: [
          { id: 'certificate-types', text: '📜 أنواع الشهادات', nextScenario: 'certificate-types' },
          { id: 'certificate-requirements', text: '📋 متطلبات الحصول', nextScenario: 'certificate-requirements' },
          { id: 'certificate-progress', text: '📊 تتبع التقدم', nextScenario: 'certificate-progress' },
          { id: 'certificate-sample', text: '👁️ نماذج الشهادات', nextScenario: 'certificate-samples' }
        ]
      }
    ]
  },

  // ===== سيناريوهات التقييم الذكي =====
  'smart-assessment': {
    id: 'smart-assessment',
    title: 'التقييم الذكي',
    category: 'courses' as const,
    messages: [
      {
        id: 'smart-assessment-start',
        content: '🧠 **تقييم ذكي شامل لمستواك**\n\n🎯 **ما سنقوم بتقييمه:**\n📖 مستوى القراءة والفهم\n🗣️ النطق والتجويد\n✍️ الكتابة والإملاء\n🧮 المعرفة النحوية\n📚 الثقافة الإسلامية\n\n⏱️ **المدة:** 15-20 دقيقة\n🏆 **النتيجة:** تقرير مفصل + خطة مخصصة',
        type: 'options' as const,
        options: [
          { id: 'start-assessment', text: '🚀 بدء التقييم', nextScenario: 'assessment-questions' },
          { id: 'assessment-info', text: 'ℹ️ معلومات أكثر', nextScenario: 'assessment-details' },
          { id: 'skip-assessment', text: '⏭️ تخطي والاستمرار', nextScenario: 'course-categories' }
        ]
      }
    ]
  }
};

// دمج السيناريوهات المتقدمة مع الأساسية
export const allScenarios = {
  ...chatScenarios,
  ...advancedScenarios
};

// اقتراحات ذكية بناء على السياق
export const smartSuggestions = {
  // اقتراحات للمبتدئين
  beginner: [
    { id: 'basic-course', text: '🌱 دورة المبتدئين', nextScenario: 'beginner-courses' },
    { id: 'arabic-letters', text: '🔤 تعلم الحروف', nextScenario: 'arabic-basics' },
    { id: 'simple-quran', text: '📖 قراءة القرآن البسيطة', nextScenario: 'simple-quran' }
  ],
  
  // اقتراحات للمتقدمين
  advanced: [
    { id: 'advanced-tajweed', text: '🎵 تجويد متقدم', nextScenario: 'advanced-tajweed' },
    { id: 'teach-others', text: '👨‍🏫 تعليم الآخرين', nextScenario: 'teaching-program' },
    { id: 'certification', text: '🎓 الحصول على إجازة', nextScenario: 'certification-path' }
  ],
  
  // اقتراحات للأطفال
  children: [
    { id: 'fun-learning', text: '🎮 تعلم ممتع', nextScenario: 'kids-courses' },
    { id: 'stories', text: '📚 القصص الإسلامية', nextScenario: 'islamic-stories' },
    { id: 'games', text: '🎲 ألعاب تعليمية', nextScenario: 'educational-games' }
  ]
};

// كلمات مفتاحية ذكية للبحث المتقدم
export const advancedKeywords = {
  // أساليب التعليم الجديدة
  'أريد أتعلم': 'learning-assessment',
  'عايز أبدأ': 'learning-assessment',
  'كيف أتعلم': 'learning-assessment',
  'أيه أفضل طريقة': 'learning-assessment',
  'أسلوب تعليم': 'learning-assessment',
  'مباشر': 'live-teaching-paths',
  'فردي': 'individual-single-details',
  'عائلي': 'individual-family-details',
  'مجموعة': 'private-group-details',
  'جماعي': 'public-group-details',
  'تفاعلي': 'interactive-learning-info',
  'مسجل': 'recorded-courses-info',
  'قريباً': 'interactive-learning-info',
  'مقارنة أساليب': 'teaching-methods-comparison',
  
  // الحجز والأسعار
  'حجز': 'booking-form',
  'جلسة مجانية': 'trial-booking-form',
  'تجربة مجانية': 'trial-booking-form',
  'كام السعر': 'individual-pricing',
  'أسعار فردي': 'individual-pricing',
  'أسعار عائلة': 'family-pricing',
  'أسعار مجموعة': 'group-pricing',
  
  // عبارات شائعة
  'محتاج مساعدة': 'support-menu',
  'فين الدورات': 'course-categories',
  'إيه أحسن دورة': 'learning-assessment',
  'أزاي أسجل': 'registration-guide',
  'مين المعلمين': 'teacher-profiles',
  'عندي مشكلة': 'technical-support',
  'شهادة معتمدة': 'certification-path',
  'الأطفال': 'kids-courses',
  'البنات': 'women-courses',
  'تحفيظ': 'quran-courses',
  'نحو': 'arabic-courses',
  'فقه': 'islamic-studies',
  'حديث': 'hadith-courses',
  
  // إشعارات وتحديثات
  'إشعار': 'notification-signup',
  'تحديثات': 'notification-signup',
  'خبرني': 'notification-signup',
  'متى هيكون متاح': 'notification-signup'
};

// تحليل المشاعر البسيط للردود
export const sentimentAnalysis = {
  positive: ['ممتاز', 'رائع', 'جميل', 'شكراً', 'أحب', 'مفيد', 'جيد'],
  negative: ['صعب', 'معقد', 'مش فاهم', 'مشكلة', 'صعوبة', 'مش عارف'],
  neutral: ['أريد', 'عايز', 'محتاج', 'ممكن', 'كيف', 'أين', 'متى']
};

export default allScenarios;

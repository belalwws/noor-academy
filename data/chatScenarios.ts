import { ChatScenario, ChatOption } from '../types/chatbot';

// قاعدة بيانات السيناريوهات الشاملة لمساعد أكاديمية لسان الحكمة

export const chatScenarios: Record<string, ChatScenario> = {
  // ===== سيناريوهات الترحيب والبداية =====
  welcome: {
    id: 'welcome',
    title: 'الترحيب والبداية',
    category: 'welcome',
    messages: [
      {
        id: 'welcome-1',
        content: '🕌 السلام عليكم ورحمة الله وبركاته\n\nأهلاً وسهلاً بك في أكاديمية لسان الحكمة! 🌟\n\nأنا مساعدك الذكي، وأنا هنا لمساعدتك في رحلتك التعليمية.\n\nكيف يمكنني مساعدتك اليوم؟',
        type: 'options',
        options: [
          { id: 'courses', text: '📚 تصفح الدورات', icon: 'fas fa-book', nextScenario: 'course-categories', color: '#2d7d32' },
          { id: 'learning-style', text: '🎯 ترشيح أسلوب التعلم المناسب', icon: 'fas fa-compass', nextScenario: 'learning-assessment', color: '#ff9800' },
          { id: 'registration', text: '✍️ التسجيل والانضمام', icon: 'fas fa-user-plus', nextScenario: 'registration-guide', color: '#1976d2' },
          { id: 'islamic-tools', text: '🕌 الأدوات الإسلامية', icon: 'fas fa-mosque', nextScenario: 'islamic-tools-menu', color: '#4caf50' },
          { id: 'support', text: '🔧 المساعدة والدعم', icon: 'fas fa-headset', nextScenario: 'support-menu', color: '#f44336' },
          { id: 'about', text: 'ℹ️ معلومات عن الأكاديمية', icon: 'fas fa-info-circle', nextScenario: 'about-academy', color: '#9c27b0' }
        ]
      }
    ]
  },

  // ===== سيناريوهات أساليب التعليم في الأكاديمية =====
  'learning-assessment': {
    id: 'learning-assessment',
    title: 'أساليب التعليم في أكاديمية لسان الحكمة',
    category: 'courses',
    messages: [
      {
        id: 'assessment-intro',
        content: '🎯 **أساليب التعليم في أكاديميتنا**\n\n﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾\n\n**ثلاثة أنماط تعليمية متميزة تناسب جميع أنواع المتعلمين:**\n\nاختر الأسلوب الذي يناسب احتياجاتك وظروفك:',
        type: 'options',
        options: [
          { id: 'live-teaching', text: '📹 تعليم مباشر - متاح الآن', nextScenario: 'live-teaching-paths', color: '#2d7d32' },
          { id: 'interactive-learning', text: '💻 تعليم تفاعلي - قريباً', nextScenario: 'interactive-learning-info', color: '#ff9800' },
          { id: 'recorded-courses', text: '🎥 دورات مسجلة - قريباً', nextScenario: 'recorded-courses-info', color: '#1976d2' },
          { id: 'comparison', text: '📊 مقارنة بين الأساليب', nextScenario: 'teaching-methods-comparison' }
        ]
      }
    ]
  },

  // ===== التعليم المباشر (متاح الآن) =====
  'live-teaching-paths': {
    id: 'live-teaching-paths',
    title: 'مسارات التعليم المباشر',
    category: 'courses',
    messages: [
      {
        id: 'live-paths-intro',
        content: '📹 **التعليم المباشر - متاح الآن**\n\n﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾\n\n**تجربة تعليمية مباشرة ومخصصة مع معلمين متخصصين**\n\n🌟 **المميزات:**\n• جلسات فردية مخصصة\n• مجموعات صغيرة تفاعلية  \n• مجموعات كبيرة شاملة\n• مرونة في المواعيد\n• تفاعل ممتاز ومباشر\n• تخصيص عالي جداً\n\nاختر المسار المناسب لك:',
        type: 'options',
        options: [
          { id: 'individual-single', text: '👤 مباشر فردي (طالب واحد)', nextScenario: 'individual-single-details' },
          { id: 'individual-family', text: '👨‍👩‍👧‍👦 مباشر فردي (2-5) عائلة', nextScenario: 'individual-family-details' },
          { id: 'private-group', text: '👥 جماعي خاص (10-15 طالب)', nextScenario: 'private-group-details' },
          { id: 'public-group', text: '🎓 جماعي عام (50 طالب)', nextScenario: 'public-group-details' }  
        ]
      }
    ]
  },

  'individual-single-details': {
    id: 'individual-single-details',
    title: 'التعليم الفردي - طالب واحد',
    category: 'courses',
    messages: [
      {
        id: 'individual-single-info',
        content: '👤 **مباشر فردي - طالب واحد**\n\n**تجربة تعليمية فردية مكثفة مع معلم متخصص، مصممة خصيصاً لاحتياجات الطالب الواحد**\n\n✨ **المميزات:**\n🎯 تركيز كامل على الطالب\n📋 خطة دراسية مخصصة\n🚀 تقدم سريع ومضمون\n⏰ مرونة كاملة في المواعيد\n🎨 محتوى مخصص حسب المستوى\n💬 تفاعل مباشر 100%',
        type: 'options',
        options: [
          { id: 'book-individual', text: '📅 حجز جلسة فردية', nextScenario: 'booking-form' },
          { id: 'individual-pricing', text: '💰 الأسعار والباقات', nextScenario: 'individual-pricing' },
          { id: 'back-paths', text: '↩️ العودة للمسارات', nextScenario: 'live-teaching-paths' }
        ]
      }
    ]
  },

  'individual-family-details': {
    id: 'individual-family-details', 
    title: 'التعليم الفردي - العائلة',
    category: 'courses',
    messages: [
      {
        id: 'individual-family-info',
        content: '👨‍👩‍👧‍👦 **مباشر فردي (2-5) عائلة**\n\n**تعليم مخصص للعائلات الصغيرة، يتيح للوالدين والأطفال التعلم معاً في بيئة عائلية دافئة ومريحة**\n\n✨ **المميزات:**\n👨‍👩‍👧‍👦 جلسات مخصصة للعائلة\n⏰ مرونة في المواعيد\n🎯 محتوى يناسب جميع الأعمار\n💝 تعلم جماعي عائلي\n🏠 بيئة آمنة ومريحة\n📚 برامج متنوعة للكبار والصغار',
        type: 'options',
        options: [
          { id: 'book-family', text: '📅 حجز جلسة عائلية', nextScenario: 'booking-form' },
          { id: 'family-pricing', text: '� الأسعار والباقات', nextScenario: 'family-pricing' },
          { id: 'back-paths', text: '↩️ العودة للمسارات', nextScenario: 'live-teaching-paths' }
        ]
      }
    ]
  },

  'private-group-details': {
    id: 'private-group-details',
    title: 'المجموعات الخاصة',
    category: 'courses', 
    messages: [
      {
        id: 'private-group-info',
        content: '👥 **جماعي خاص (10-15 طالب)**\n\n**مجموعات صغيرة مغلقة توفر تفاعلاً عالياً مع إمكانية التعلم التشاركي والمناقشات الثرية**\n\n✨ **المميزات:**\n🔒 مجموعة مغلقة ومختارة\n🎯 تفاعل عالي بين الطلاب\n💬 مناقشات جماعية ثرية\n📊 متابعة فردية لكل طالب\n🤝 تعلم تشاركي وتعاوني\n📝 أنشطة جماعية متنوعة',
        type: 'options',
        options: [
          { id: 'join-private-group', text: '👥 الانضمام لمجموعة', nextScenario: 'group-registration' },
          { id: 'private-group-pricing', text: '� الأسعار والباقات', nextScenario: 'group-pricing' },
          { id: 'back-paths', text: '↩️ العودة للمسارات', nextScenario: 'live-teaching-paths' }
        ]
      }
    ]
  },

  'public-group-details': {
    id: 'public-group-details',
    title: 'المجموعات العامة',
    category: 'courses',
    messages: [
      {
        id: 'public-group-info', 
        content: '🎓 **جماعي عام (50 طالب)**\n\n**محاضرات عامة مفتوحة للجميع، تركز على المواضيع الأساسية والمهمة مع إمكانية المشاركة والأسئلة**\n\n✨ **المميزات:**\n🌐 محاضرات عامة مفتوحة\n📚 مواضيع أساسية ومهمة\n🎯 إمكانية الوصول للجميع\n❓ جلسات أسئلة وأجوبة\n💡 محتوى شامل ومفيد\n📈 تعلم من خبرات الآخرين',
        type: 'options',
        options: [
          { id: 'join-public-group', text: '🎓 الانضمام للمحاضرات', nextScenario: 'public-registration' },
          { id: 'public-group-pricing', text: '💰 الأسعار والباقات', nextScenario: 'public-pricing' },
          { id: 'back-paths', text: '↩️ العودة للمسارات', nextScenario: 'live-teaching-paths' }
        ]
      }
    ]
  },

  // ===== التعليم التفاعلي (قريباً) =====
  'interactive-learning-info': {
    id: 'interactive-learning-info',
    title: 'التعليم التفاعلي - قريباً',
    category: 'courses',
    messages: [
      {
        id: 'interactive-info',
        content: '💻 **تعليم تفاعلي - قريباً إن شاء الله**\n\n**منهج تعليمي تفاعلي متطور يعرض المعلومات والأسئلة بشكل ديناميكي وتفاعلي**\n\n🌟 **المميزات المنتظرة:**\n🧠 مذكرات تفاعلية ذكية\n📝 تمارين تطبيقية متدرجة\n🎯 اختبارات ذكية تكيفية\n⏰ مدة مفتوحة ومرنة\n👥 عدد طلاب غير محدود\n🤖 تفاعل ذاتي تفاعلي متقدم\n🎨 تخصيص عالي جداً\n\n🔔 **سنعلمكم فور توفر هذا النمط التعليمي**',
        type: 'options',
        options: [
          { id: 'notify-interactive', text: '🔔 إشعاري عند التوفر', nextScenario: 'notification-signup' },
          { id: 'current-alternatives', text: '📹 البدائل المتاحة حالياً', nextScenario: 'live-teaching-paths' },
          { id: 'back-assessment', text: '↩️ العودة للأساليب', nextScenario: 'learning-assessment' }
        ]
      }
    ]
  },

  // ===== الدورات المسجلة (قريباً) =====
  'recorded-courses-info': {
    id: 'recorded-courses-info',
    title: 'الدورات المسجلة - قريباً',
    category: 'courses',
    messages: [
      {
        id: 'recorded-info',
        content: '🎥 **دورات مسجلة - قريباً إن شاء الله**\n\n**مجموعة شاملة من الدورات المسجلة عالية الجودة، تتيح لك التعلم في أي وقت ومن أي مكان بالسرعة التي تناسبك**\n\n🌟 **المميزات المنتظرة:**\n📹 فيديوهات تعليمية عالية الجودة\n� مواد تفاعلية مساعدة\n⏰ مدة مفتوحة\n👥 عدد طلاب غير محدود\n🎯 تفاعل ذاتي\n📊 تخصيص منخفض\n💾 إمكانية التحميل للمشاهدة دون إنترنت\n\n🔔 **سنعلمكم فور توفر هذا النمط التعليمي**',
        type: 'options',
        options: [
          { id: 'notify-recorded', text: '🔔 إشعاري عند التوفر', nextScenario: 'notification-signup' },
          { id: 'current-alternatives', text: '📹 البدائل المتاحة حالياً', nextScenario: 'live-teaching-paths' },
          { id: 'back-assessment', text: '↩️ العودة للأساليب', nextScenario: 'learning-assessment' }
        ]
      }
    ]
  },

  // ===== مقارنة أساليب التعليم =====
  'teaching-methods-comparison': {
    id: 'teaching-methods-comparison',
    title: 'مقارنة أساليب التعليم',
    category: 'courses',
    messages: [
      {
        id: 'comparison-table',
        content: '📊 **مقارنة بين أساليب التعليم**\n\n**اختر الأسلوب التعليمي الذي يناسب احتياجاتك وظروفك:**\n\n📋 **الخصائص:**\n\n**🎥 التعليم المباشر** (متاح الآن)\n• المدة: مرنة حسب الحاجة\n• المجموعة: 1-50 طالب\n• التفاعل: ممتاز ومباشر\n• الجدولة: عالية\n• التخصيص: عالي جداً\n• الدعم: مكثف ومخصص\n\n**💻 التعليم التفاعلي** (قريباً)\n• المدة: مفتوحة ومرنة\n• المجموعة: غير محدود\n• التفاعل: ذاتي تفاعلي متقدم\n• الجدولة: عالية جداً\n• التخصيص: عالي جداً\n• الدعم: ذكي وتفاعلي\n\n**🎬 الدورات المسجلة** (قريباً)\n• المدة: مفتوحة\n• المجموعة: غير محدود\n• التفاعل: ذاتي\n• الجدولة: عالية جداً\n• التخصيص: منخفض\n• الدعم: محدود',
        type: 'options',
        options: [
          { id: 'choose-live', text: '📹 اختيار التعليم المباشر', nextScenario: 'live-teaching-paths' },
          { id: 'wait-interactive', text: '💻 انتظار التعليم التفاعلي', nextScenario: 'interactive-learning-info' },
          { id: 'wait-recorded', text: '🎥 انتظار الدورات المسجلة', nextScenario: 'recorded-courses-info' },
          { id: 'back-assessment', text: '↩️ العودة للأساليب', nextScenario: 'learning-assessment' }
        ]
      }
    ]
  },

  'assessment-goal': {
    id: 'assessment-goal',
    title: 'تحديد الهدف التعليمي',
    category: 'courses',
    messages: [
      {
        id: 'goal-question',
        content: '🎯 ما هو هدفك الرئيسي من التعلم؟',
        type: 'options',
        options: [
          { id: 'quran', text: '📖 حفظ وتجويد القرآن', nextScenario: 'assessment-method' },
          { id: 'arabic', text: '🔤 إتقان اللغة العربية', nextScenario: 'assessment-method' },
          { id: 'islamic', text: '🕌 دراسة العلوم الشرعية', nextScenario: 'assessment-method' },
          { id: 'general', text: '📚 تعلم شامل ومتوازن', nextScenario: 'assessment-method' }
        ]
      }
    ]
  },

  'assessment-method': {
    id: 'assessment-method',
    title: 'تفضيل طريقة التعلم',
    category: 'courses',
    messages: [
      {
        id: 'method-question',
        content: '🎓 ما هي طريقة التعلم المفضلة لديك؟',
        type: 'options',
        options: [
          { id: 'individual', text: '👤 التعلم الفردي الذاتي', nextScenario: 'learning-recommendation' },
          { id: 'group', text: '👥 التعلم الجماعي', nextScenario: 'learning-recommendation' },
          { id: 'mixed', text: '🔄 مزيج من الطرق', nextScenario: 'learning-recommendation' },
          { id: 'interactive', text: '💻 التعلم التفاعلي الرقمي', nextScenario: 'learning-recommendation' }
        ]
      }
    ]
  },

  'learning-recommendation': {
    id: 'learning-recommendation',
    title: 'توصية أسلوب التعلم',
    category: 'courses',
    messages: [
      {
        id: 'recommendation',
        content: '🎉 ممتاز! بناءً على إجاباتك، إليك التوصيات المخصصة لك:\n\n✨ **خطة التعلم المقترحة:**\n\n🔹 ابدأ بالدورات التأسيسية\n🔹 احجز جلسات فردية مع معلم مختص\n🔹 استخدم الأدوات التفاعلية اليومية\n🔹 انضم لمجموعات الدراسة\n\nهل تود رؤية الدورات المناسبة لك؟',
        type: 'options',
        options: [
          { id: 'show-courses', text: '📚 عرض الدورات المناسبة', nextScenario: 'course-categories' },
          { id: 'schedule-consultation', text: '📞 حجز استشارة مجانية', nextScenario: 'consultation-booking' },
          { id: 'start-trial', text: '🆓 تجربة مجانية', nextScenario: 'trial-registration' },
          { id: 'main-menu', text: '🏠 العودة للقائمة الرئيسية', nextScenario: 'welcome' }
        ]
      }
    ]
  },

  // ===== سيناريوهات الدورات =====
  'course-categories': {
    id: 'course-categories',
    title: 'فئات الدورات',
    category: 'courses',
    messages: [
      {
        id: 'categories-menu',
        content: '📚 اختر الفئة التي تهمك من دوراتنا المتنوعة:\n\n🌟 جميع دوراتنا معتمدة ويشرف عليها نخبة من أفضل الأساتذة',
        type: 'options',
        options: [
          { id: 'quran-courses', text: '📖 القرآن الكريم والتجويد', icon: 'fas fa-quran', nextScenario: 'quran-courses', color: '#2e7d32' },
          { id: 'arabic-courses', text: '🔤 اللغة العربية', icon: 'fas fa-language', nextScenario: 'arabic-courses', color: '#1976d2' },
          { id: 'islamic-studies', text: '🕌 العلوم الشرعية', icon: 'fas fa-mosque', nextScenario: 'islamic-studies', color: '#7b1fa2' },
          { id: 'hadith-courses', text: '📜 الحديث الشريف', icon: 'fas fa-scroll', nextScenario: 'hadith-courses', color: '#f57c00' },
          { id: 'kids-courses', text: '👶 دورات الأطفال', icon: 'fas fa-child', nextScenario: 'kids-courses', color: '#e91e63' },
          { id: 'women-courses', text: '👩 دورات السيدات', icon: 'fas fa-female', nextScenario: 'women-courses', color: '#9c27b0' },
          { id: 'back', text: '↩️ العودة', nextScenario: 'welcome' }
        ]
      }
    ]
  },

  'quran-courses': {
    id: 'quran-courses',
    title: 'دورات القرآن الكريم',
    category: 'courses',
    messages: [
      {
        id: 'quran-options',
        content: '📖 **دورات القرآن الكريم والتجويد**\n\n🌟 اختر المستوى المناسب لك:\n\n• حفظ وتلاوة مع أحكام التجويد\n• دروس فردية وجماعية\n• متابعة يومية ومراجعة دورية',
        type: 'options',
        options: [
          { id: 'quran-beginner', text: '🌱 المبتدئين - تعلم القراءة', nextScenario: 'course-details' },
          { id: 'quran-tajweed', text: '🎵 أحكام التجويد', nextScenario: 'course-details' },
          { id: 'quran-memorization', text: '🧠 حفظ القرآن الكريم', nextScenario: 'course-details' },
          { id: 'quran-advanced', text: '🎓 القراءات والإجازات', nextScenario: 'course-details' },
          { id: 'back-categories', text: '↩️ العودة للفئات', nextScenario: 'course-categories' }
        ]
      }
    ]
  },

  'arabic-courses': {
    id: 'arabic-courses',
    title: 'دورات اللغة العربية',
    category: 'courses',
    messages: [
      {
        id: 'arabic-options',
        content: '🔤 **دورات اللغة العربية**\n\n✨ تعلم لغة القرآن من الصفر إلى الإتقان:\n\n• منهج علمي متدرج\n• تطبيقات عملية\n• دعم مستمر من المعلمين',
        type: 'options',
        options: [
          { id: 'arabic-basics', text: '🌱 الأساسيات والحروف', nextScenario: 'course-details' },
          { id: 'arabic-grammar', text: '📝 النحو والصرف', nextScenario: 'course-details' },
          { id: 'arabic-literature', text: '📚 الأدب والبلاغة', nextScenario: 'course-details' },
          { id: 'arabic-conversation', text: '💬 المحادثة والتعبير', nextScenario: 'course-details' },
          { id: 'arabic-non-native', text: '🌍 العربية لغير الناطقين', nextScenario: 'course-details' },
          { id: 'back-categories', text: '↩️ العودة للفئات', nextScenario: 'course-categories' }
        ]
      }
    ]
  },

  'course-details': {
    id: 'course-details',
    title: 'تفاصيل الدورة',
    category: 'courses',
    messages: [
      {
        id: 'course-info',
        content: '📋 **تفاصيل الدورة**\n\n⭐ **المميزات:**\n• شهادة معتمدة عند الانتهاء\n• دروس تفاعلية مباشرة\n• مواد تعليمية شاملة\n• متابعة فردية من المعلم\n• مجموعات دراسية\n\n💰 **الباقات تبدأ من 99 ريال**\n\nماذا تود أن تفعل؟',
        type: 'options',
        options: [
          { id: 'enroll-now', text: '✅ التسجيل الآن', nextScenario: 'registration-guide' },
          { id: 'schedule-demo', text: '👁️ مشاهدة درس تجريبي', nextScenario: 'demo-booking' },
          { id: 'pricing-details', text: '💰 تفاصيل الأسعار', nextScenario: 'pricing-info' },
          { id: 'teacher-info', text: '👨‍🏫 معلومات عن المعلمين', nextScenario: 'teacher-profiles' },
          { id: 'back-courses', text: '↩️ العودة للدورات', nextScenario: 'course-categories' }
        ]
      }
    ]
  },

  // ===== سيناريوهات التسجيل =====
  'registration-guide': {
    id: 'registration-guide',
    title: 'دليل التسجيل',
    category: 'registration',
    messages: [
      {
        id: 'registration-steps',
        content: '✍️ **خطوات التسجيل السهلة:**\n\n📝 **الخطوة 1:** إنشاء حساب جديد\n🎯 **الخطوة 2:** اختيار الدورة المناسبة\n💳 **الخطوة 3:** اختيار طريقة الدفع\n📅 **الخطوة 4:** جدولة المواعيد\n🎉 **الخطوة 5:** بدء التعلم!\n\nماذا تحتاج؟',
        type: 'options',
        options: [
          { id: 'create-account', text: '👤 إنشاء حساب جديد', action: 'navigate_to_page', payload: '/register' },
          { id: 'login-help', text: '🔑 مساعدة في تسجيل الدخول', nextScenario: 'login-help' },
          { id: 'payment-methods', text: '💳 طرق الدفع المتاحة', nextScenario: 'payment-info' },
          { id: 'registration-requirements', text: '📋 متطلبات التسجيل', nextScenario: 'requirements-info' },
          { id: 'contact-registration', text: '📞 تواصل لمساعدة التسجيل', nextScenario: 'contact-support' }
        ]
      }
    ]
  },

  'trial-registration': {
    id: 'trial-registration',
    title: 'التسجيل للتجربة المجانية',
    category: 'registration',
    messages: [
      {
        id: 'trial-info',
        content: '🆓 **التجربة المجانية**\n\n🎁 **مميزات التجربة:**\n• درس مجاني لمدة 30 دقيقة\n• تقييم مستواك الحالي\n• خطة تعلم مخصصة\n• بدون أي التزامات مالية\n\n📋 **المطلوب منك:**\n• الاسم ورقم الهاتف\n• تحديد الوقت المناسب\n• اختيار المجال المفضل',
        type: 'options',
        options: [
          { id: 'book-trial', text: '📅 حجز التجربة الآن', nextScenario: 'trial-booking' },
          { id: 'trial-faq', text: '❓ أسئلة حول التجربة', nextScenario: 'trial-faq' },
          { id: 'back-main', text: '🏠 العودة للرئيسية', nextScenario: 'welcome' }
        ]
      }
    ]
  },

  // ===== سيناريوهات الأدوات الإسلامية =====
  'islamic-tools-menu': {
    id: 'islamic-tools-menu',
    title: 'الأدوات الإسلامية',
    category: 'islamic-tools',
    messages: [
      {
        id: 'tools-menu',
        content: '🕌 **الأدوات الإسلامية المفيدة**\n\n🌟 مجموعة من الأدوات لمساعدتك في حياتك اليومية:\n\n✨ جميع الأدوات مجانية ومتاحة 24/7',
        type: 'options',
        options: [
          { id: 'prayer-times', text: '🕐 مواقيت الصلاة', action: 'navigate_to_page', payload: '/prayer-times' },
          { id: 'qibla-direction', text: '🧭 اتجاه القبلة', action: 'navigate_to_page', payload: '/qibla' },
          { id: 'hijri-calendar', text: '📅 التقويم الهجري', action: 'navigate_to_page', payload: '/hijri-calendar' },
          { id: 'tasbih-counter', text: '📿 سبحة رقمية', action: 'navigate_to_page', payload: '/tasbih' },
          { id: 'adhkar-daily', text: '🤲 أذكار يومية', action: 'navigate_to_page', payload: '/adhkar' },
          { id: 'quran-reader', text: '📖 قارئ القرآن', action: 'navigate_to_page', payload: '/quran' },
          { id: 'hadith-daily', text: '📜 حديث اليوم', action: 'navigate_to_page', payload: '/hadith' },
          { id: 'back-main', text: '🏠 العودة للرئيسية', nextScenario: 'welcome' }
        ]
      }
    ]
  },

  // ===== سيناريوهات الدعم والمساعدة =====
  'support-menu': {
    id: 'support-menu',
    title: 'المساعدة والدعم',
    category: 'technical-support',
    messages: [
      {
        id: 'support-options',
        content: '🔧 **مركز المساعدة والدعم**\n\n👋 كيف يمكننا مساعدتك اليوم؟\n\n📞 **فريق الدعم متاح 24/7**',
        type: 'options',
        options: [
          { id: 'technical-issues', text: '💻 مشاكل تقنية', nextScenario: 'technical-support' },
          { id: 'account-issues', text: '👤 مشاكل الحساب', nextScenario: 'account-support' },
          { id: 'payment-issues', text: '💳 مشاكل الدفع', nextScenario: 'payment-support' },
          { id: 'course-questions', text: '📚 أسئلة حول الدورات', nextScenario: 'course-support' },
          { id: 'faq', text: '❓ الأسئلة الشائعة', action: 'navigate_to_page', payload: '/faq' },
          { id: 'live-chat', text: '💬 محادثة مباشرة', nextScenario: 'live-chat-connect' },
          { id: 'contact-whatsapp-egypt', text: '📱 واتساب مصر', action: 'open_external_link', payload: 'https://wa.me/201090541161' },
          { id: 'contact-whatsapp-jordan', text: '📱 واتساب الأردن', action: 'open_external_link', payload: 'https://wa.me/9662781853350' },
          { id: 'back-main', text: '🏠 العودة للرئيسية', nextScenario: 'welcome' }
        ]
      }
    ]
  },

  'technical-support': {
    id: 'technical-support',
    title: 'الدعم التقني',
    category: 'technical-support',
    messages: [
      {
        id: 'tech-support-options',
        content: '💻 **الدعم التقني**\n\nما هي المشكلة التي تواجهها؟',
        type: 'options',
        options: [
          { id: 'login-problem', text: '🔑 مشكلة في تسجيل الدخول', nextScenario: 'login-help' },
          { id: 'video-problem', text: '📹 مشاكل في الفيديو/الصوت', nextScenario: 'video-help' },
          { id: 'app-slow', text: '🐌 الموقع بطيء', nextScenario: 'performance-help' },
          { id: 'mobile-issues', text: '📱 مشاكل على الهاتف', nextScenario: 'mobile-help' },
          { id: 'other-tech', text: '🔧 مشكلة أخرى', nextScenario: 'contact-support' },
          { id: 'back-support', text: '↩️ العودة للدعم', nextScenario: 'support-menu' }
        ]
      }
    ]
  },

  // ===== سيناريوهات معلومات عن الأكاديمية =====
  'about-academy': {
    id: 'about-academy',
    title: 'معلومات عن الأكاديمية',
    category: 'general-info',
    messages: [
      {
        id: 'about-info',
        content: 'ℹ️ **أكاديمية لسان الحكمة**\n\n🌟 **رؤيتنا:** تمكين المتعلمين من إتقان اللغة العربية والعلوم الشرعية\n\n🎯 **مهمتنا:** توفير تعليم عالي الجودة باستخدام أحدث التقنيات\n\n📊 **إحصائياتنا:**\n• أكثر من 10,000 طالب\n• أكثر من 100 معلم مؤهل\n• 50+ دورة متخصصة\n• شهادات معتمدة',
        type: 'options',
        options: [
          { id: 'our-teachers', text: '👨‍🏫 فريق التدريس', nextScenario: 'teacher-profiles' },
          { id: 'our-methodology', text: '📖 منهجيتنا', nextScenario: 'methodology-info' },
          { id: 'success-stories', text: '🏆 قصص نجاح', nextScenario: 'success-stories' },
          { id: 'certificates', text: '🎓 الشهادات', nextScenario: 'certificate-info' },
          { id: 'contact-us', text: '📞 تواصل معنا', nextScenario: 'contact-info' },
          { id: 'back-main', text: '🏠 العودة للرئيسية', nextScenario: 'welcome' }
        ]
      }
    ]
  },

  // ===== سيناريوهات أخرى =====
  'pricing-info': {
    id: 'pricing-info',
    title: 'معلومات الأسعار',
    category: 'payment',
    messages: [
      {
        id: 'pricing-details',
        content: '💰 **باقات الأسعار**\n\n🎁 **الباقة الأساسية - 99 ريال/شهر:**\n• 4 جلسات شهرياً\n• مواد تعليمية\n• دعم عبر المنصة\n\n⭐ **الباقة المميزة - 199 ريال/شهر:**\n• 8 جلسات شهرياً\n• جلسات فردية\n• مراجعة الواجبات\n• دعم واتساب\n\n👑 **الباقة الذهبية - 299 ريال/شهر:**\n• جلسات غير محدودة\n• معلم شخصي\n• شهادة معتمدة\n• دعم 24/7',
        type: 'options',
        options: [
          { id: 'choose-basic', text: '🎁 اختيار الأساسية', nextScenario: 'registration-guide' },
          { id: 'choose-premium', text: '⭐ اختيار المميزة', nextScenario: 'registration-guide' },
          { id: 'choose-gold', text: '👑 اختيار الذهبية', nextScenario: 'registration-guide' },
          { id: 'compare-packages', text: '📊 مقارنة الباقات', nextScenario: 'package-comparison' },
          { id: 'discounts', text: '🏷️ العروض والخصومات', nextScenario: 'discount-info' },
          { id: 'back-courses', text: '↩️ العودة للدورات', nextScenario: 'course-categories' }
        ]
      }
    ]
  },

  'contact-info': {
    id: 'contact-info',
    title: 'معلومات التواصل',
    category: 'contact',
    messages: [
      {
        id: 'contact-details',
        content: '📞 **تواصل معنا**\n\n🕐 **ساعات العمل:** 24/7\n\n� **واتساب:**\n• مصر: +201090541161\n• الأردن: +966278185335\n\n�📧 **البريد الإلكتروني:**\n• contact@lisanalhekma.com\n• support@lisanalhekma.com\n\n🌐 **الموقع:** lisan-alhekma.com\n\n **طرق التواصل السريع:**',
        type: 'options',
        options: [
          { id: 'whatsapp-egypt', text: '📱 واتساب مصر', action: 'open_external_link', payload: 'https://wa.me/201090541161' },
          { id: 'whatsapp-jordan', text: '� واتساب الأردن', action: 'open_external_link', payload: 'https://wa.me/9662781853350' },
          { id: 'email-contact', text: '� إرسال إيميل', action: 'open_external_link', payload: 'mailto:contact@lisanalhekma.com' },
          { id: 'email-support', text: '🆘 إيميل الدعم', action: 'open_external_link', payload: 'mailto:support@lisanalhekma.com' },
          { id: 'back-main', text: '🏠 العودة للرئيسية', nextScenario: 'welcome' }
        ]
      }
    ]
  },

  // ===== سيناريوهات مساعدة سريعة =====
  'help-menu': {
    id: 'help-menu',
    title: 'قائمة مساعدة سريعة',
    category: 'help',
    messages: [
      {
        id: 'quick-help',
        content: '🆘 **مساعدة سريعة**\n\nاختر الموضوع الذي تحتاج مساعدة فيه:',
        type: 'options',
        options: [
          { id: 'how-to-register', text: '✍️ كيفية التسجيل', nextScenario: 'registration-guide' },
          { id: 'how-to-book', text: '📅 كيفية حجز جلسة', nextScenario: 'booking-guide' },
          { id: 'how-to-pay', text: '💳 كيفية الدفع', nextScenario: 'payment-guide' },
          { id: 'how-to-access', text: '🔑 كيفية دخول الجلسات', nextScenario: 'access-guide' },
          { id: 'certificates-help', text: '🎓 الحصول على شهادة', nextScenario: 'certificate-help' },
          { id: 'technical-tips', text: '💡 نصائح تقنية', nextScenario: 'technical-tips' },
          { id: 'back-main', text: '🏠 العودة للرئيسية', nextScenario: 'welcome' }
        ]
      }
    ]
  },

  // ===== سيناريوهات الحجز والأسعار =====
  'booking-form': {
    id: 'booking-form',
    title: 'حجز جلسة تعليمية',
    category: 'registration',
    messages: [
      {
        id: 'booking-info',
        content: '📅 **حجز جلسة تعليمية**\n\n🎯 **خطوات الحجز:**\n1️⃣ اختيار نوع الجلسة\n2️⃣ تحديد الموعد المناسب\n3️⃣ اختيار المعلم\n4️⃣ تأكيد الحجز والدفع\n\n🎁 **عرض خاص:** جلسة تجريبية مجانية للمستخدمين الجدد!\n\nكيف تود المتابعة؟',
        type: 'options',
        options: [
          { id: 'free-trial-booking', text: '🆓 حجز جلسة تجريبية مجانية', nextScenario: 'trial-booking-form' },
          { id: 'paid-booking', text: '💳 حجز جلسة مدفوعة', action: 'navigate_to_page', payload: '/register' },
          { id: 'booking-help', text: '❓ مساعدة في الحجز', nextScenario: 'booking-help' },
          { id: 'view-teachers', text: '👨‍🏫 عرض المعلمين المتاحين', nextScenario: 'teacher-profiles' }
        ]
      }
    ]
  },

  'trial-booking-form': {
    id: 'trial-booking-form',
    title: 'حجز الجلسة التجريبية المجانية',
    category: 'registration',
    messages: [
      {
        id: 'trial-booking-details',
        content: '🆓 **الجلسة التجريبية المجانية**\n\n🌟 **ما ستحصل عليه:**\n⏰ جلسة مدتها 30 دقيقة\n👨‍🏫 معلم متخصص\n📊 تقييم مستواك الحالي\n📋 خطة تعلم مقترحة\n🎁 مواد تعليمية مجانية\n\n📝 **للحجز، نحتاج منك:**\n• الاسم الكامل\n• رقم الهاتف\n• الوقت المفضل\n• المجال المهتم به',
        type: 'options',
        options: [
          { id: 'start-trial-booking', text: '📝 بدء التسجيل للجلسة المجانية', action: 'navigate_to_page', payload: '/register?type=trial' },
          { id: 'trial-info', text: 'ℹ️ معلومات أكثر عن الجلسة', nextScenario: 'trial-details' },
          { id: 'contact-booking', text: '📞 التواصل لحجز الجلسة', nextScenario: 'contact-info' }
        ]
      }
    ]
  },

  'individual-pricing': {
    id: 'individual-pricing',
    title: 'أسعار التعليم الفردي',
    category: 'payment',
    messages: [
      {
        id: 'individual-pricing-details',
        content: '💰 **أسعار التعليم الفردي - طالب واحد**\n\n🎯 **الباقات المتاحة:**\n\n🥉 **الباقة الأساسية**\n• 4 جلسات شهرياً (ساعة لكل جلسة)\n• متابعة أسبوعية\n• مواد تعليمية أساسية\n• السعر: 299 ريال/شهر\n\n🥈 **الباقة المتقدمة**\n• 8 جلسات شهرياً\n• متابعة يومية\n• مواد تعليمية شاملة\n• واجبات وتمارين\n• السعر: 499 ريال/شهر\n\n🥇 **الباقة المكثفة**\n• 16 جلسة شهرياً\n• متابعة مكثفة\n• خطة تعليمية مخصصة\n• شهادة معتمدة\n• السعر: 799 ريال/شهر',
        type: 'options',
        options: [
          { id: 'choose-basic-individual', text: '🥉 اختيار الباقة الأساسية', nextScenario: 'registration-guide' },
          { id: 'choose-advanced-individual', text: '🥈 اختيار الباقة المتقدمة', nextScenario: 'registration-guide' },
          { id: 'choose-intensive-individual', text: '🥇 اختيار الباقة المكثفة', nextScenario: 'registration-guide' },
          { id: 'more-pricing-info', text: 'ℹ️ معلومات أكثر عن الأسعار', nextScenario: 'pricing-details' }
        ]
      }
    ]
  },

  'family-pricing': {
    id: 'family-pricing',
    title: 'أسعار التعليم العائلي',
    category: 'payment',
    messages: [
      {
        id: 'family-pricing-details',
        content: '💰 **أسعار التعليم العائلي (2-5 أفراد)**\n\n👨‍👩‍👧‍👦 **عروض خاصة للعائلات:**\n\n🥉 **باقة العائلة الأساسية**\n• 6 جلسات شهرياً (1.5 ساعة لكل جلسة)\n• برامج متنوعة للكبار والصغار\n• مواد تعليمية لجميع الأعمار\n• السعر: 549 ريال/شهر\n\n🥈 **باقة العائلة المتقدمة**\n• 12 جلسة شهرياً\n• خطط تعليمية مخصصة لكل فرد\n• أنشطة عائلية جماعية\n• السعر: 899 ريال/شهر\n\n🥇 **باقة العائلة الشاملة**\n• جلسات غير محدودة\n• معلم مخصص للعائلة\n• برامج تربوية شاملة\n• السعر: 1299 ريال/شهر\n\n💡 **خصم خاص:** 20% خصم للعائلات الجديدة!',
        type: 'options',
        options: [
          { id: 'choose-basic-family', text: '🥉 اختيار باقة العائلة الأساسية', nextScenario: 'registration-guide' },
          { id: 'choose-advanced-family', text: '🥈 اختيار باقة العائلة المتقدمة', nextScenario: 'registration-guide' },
          { id: 'choose-comprehensive-family', text: '🥇 اختيار باقة العائلة الشاملة', nextScenario: 'registration-guide' },
          { id: 'family-discount-info', text: '🎁 معلومات عن العروض', nextScenario: 'discount-info' }
        ]
      }
    ]
  },

  'group-pricing': {
    id: 'group-pricing',
    title: 'أسعار المجموعات',
    category: 'payment',
    messages: [
      {
        id: 'group-pricing-details',
        content: '💰 **أسعار المجموعات**\n\n👥 **المجموعات الخاصة (10-15 طالب):**\n• السعر: 199 ريال/شهر للطالب الواحد\n• 8 جلسات شهرياً\n• مجموعة مغلقة ومختارة\n• تفاعل عالي\n\n🎓 **المجموعات العامة (50 طالب):**\n• السعر: 99 ريال/شهر للطالب الواحد\n• 4 محاضرات شهرياً\n• محاضرات عامة مفتوحة\n• مواضيع أساسية\n\n🌟 **مميزات إضافية:**\n• خصومات للمجموعات الكبيرة\n• إمكانية تكوين مجموعات خاصة\n• جلسات إضافية مجانية',
        type: 'options',
        options: [
          { id: 'join-private-group', text: '👥 الانضمام لمجموعة خاصة', nextScenario: 'group-registration' },
          { id: 'join-public-group', text: '🎓 الانضمام لمجموعة عامة', nextScenario: 'public-registration' },
          { id: 'create-custom-group', text: '🎯 إنشاء مجموعة مخصصة', nextScenario: 'custom-group-form' }
        ]
      }
    ]
  },

  'notification-signup': {
    id: 'notification-signup',
    title: 'التسجيل للإشعارات',
    category: 'general-info',
    messages: [
      {
        id: 'notification-form',
        content: '🔔 **التسجيل للإشعارات**\n\n✨ سنرسل لك إشعاراً فور توفر الميزات الجديدة:\n\n📱 **طرق الإشعار:**\n• رسائل SMS\n• بريد إلكتروني\n• إشعارات الموقع\n• واتساب\n\n📋 **معلومات مطلوبة:**\n• الاسم\n• رقم الهاتف\n• البريد الإلكتروني\n• نوع الخدمة المهتم بها',
        type: 'options',
        options: [
          { id: 'signup-notifications', text: '📝 التسجيل للإشعارات', action: 'navigate_to_page', payload: '/register?type=notification' },
          { id: 'current-services', text: '📹 الخدمات المتاحة حالياً', nextScenario: 'live-teaching-paths' },
          { id: 'contact-updates', text: '📞 التواصل للحصول على التحديثات', nextScenario: 'contact-info' }
        ]
      }
    ]
  },

  // ===== سيناريو الخطأ والعودة =====
  fallback: {
    id: 'fallback',
    title: 'عذراً، لم أفهم',
    category: 'help',
    messages: [
      {
        id: 'fallback-message',
        content: '😅 عذراً، لم أفهم طلبك تماماً.\n\nيمكنك:\n• اختيار من الخيارات أدناه\n• إعادة صياغة سؤالك\n• التواصل مع الدعم المباشر',
        type: 'options',
        options: [
          { id: 'back-main', text: '🏠 العودة للرئيسية', nextScenario: 'welcome' },
          { id: 'common-questions', text: '❓ الأسئلة الشائعة', action: 'navigate_to_page', payload: '/faq' },
          { id: 'human-support', text: '👨‍💼 تحدث مع موظف', nextScenario: 'live-chat-connect' },
          { id: 'help-menu', text: '🆘 قائمة المساعدة', nextScenario: 'help-menu' }
        ]
      }
    ]
  }
};

// خيارات سريعة مقترحة
export const quickSuggestions: ChatOption[] = [
  { id: 'learning-methods', text: '🎯 أساليب التعليم', nextScenario: 'learning-assessment' },
  { id: 'live-teaching', text: '📹 تعليم مباشر', nextScenario: 'live-teaching-paths' },
  { id: 'trial', text: '🆓 جلسة مجانية', nextScenario: 'trial-booking-form' },
  { id: 'prices', text: '� الأسعار', nextScenario: 'individual-pricing' },
  { id: 'contact', text: '� تواصل معنا', nextScenario: 'contact-info' }
];

// كلمات مفتاحية للبحث الذكي
export const keywordMapping: Record<string, string> = {
  // أساليب التعليم
  'أسلوب تعلم': 'learning-assessment',
  'أساليب التعليم': 'learning-assessment',
  'طريقة تعلم': 'learning-assessment',
  'نمط تعليمي': 'learning-assessment',
  'تعليم مباشر': 'live-teaching-paths',
  'تعليم تفاعلي': 'interactive-learning-info',
  'دورات مسجلة': 'recorded-courses-info',
  'مقارنة': 'teaching-methods-comparison',
  
  // مسارات التعليم المباشر
  'فردي': 'individual-single-details',
  'عائلة': 'individual-family-details',
  'مجموعة خاصة': 'private-group-details',
  'مجموعة عامة': 'public-group-details',
  'جماعي': 'private-group-details',
  
  // الدورات
  'دورة': 'course-categories',
  'دورات': 'course-categories',
  'كورس': 'course-categories',
  'كورسات': 'course-categories',
  'تعلم': 'learning-assessment',
  'قرآن': 'quran-courses',
  'عربي': 'arabic-courses',
  'عربية': 'arabic-courses',
  
  // التسجيل
  'تسجيل': 'registration-guide',
  'اشتراك': 'registration-guide',
  'انضمام': 'registration-guide',
  'حساب': 'registration-guide',
  'حجز': 'booking-form',
  
  // المساعدة
  'مساعدة': 'support-menu',
  'دعم': 'support-menu',
  'مشكلة': 'technical-support',
  'مشاكل': 'technical-support',
  
  // الأسعار
  'سعر': 'pricing-info',
  'أسعار': 'pricing-info',
  'تكلفة': 'pricing-info',
  'باقة': 'pricing-info',
  'باقات': 'pricing-info',
  
  // التواصل
  'تواصل': 'contact-info',
  'اتصال': 'contact-info',
  'هاتف': 'contact-info',
  'واتساب': 'contact-info',
  'واتساب مصر': 'contact-info',
  'واتساب الأردن': 'contact-info',
  
  // الأدوات
  'صلاة': 'islamic-tools-menu',
  'قبلة': 'islamic-tools-menu',
  'تقويم': 'islamic-tools-menu',
  'هجري': 'islamic-tools-menu',
  'أذكار': 'islamic-tools-menu',
  'تسبيح': 'islamic-tools-menu'
};

export default chatScenarios;

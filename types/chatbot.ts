// أنواع البيانات لنظام الشات بوت المتقدم بالسيناريوهات

export type MessageType = 'text' | 'options' | 'info' | 'action' | 'error' | 'success';
export type MessageSender = 'user' | 'bot';

// نوع الخيار في الرسالة
export interface ChatOption {
  id: string;
  text: string;
  icon?: string;
  color?: string;
  nextScenario?: string;
  action?: string;
  payload?: any;
  disabled?: boolean;
  description?: string;
}

// نوع الرسالة
export interface ChatMessage {
  id: string;
  type: MessageType;
  sender: MessageSender;
  content: string;
  options?: ChatOption[];
  timestamp: Date;
  scenarioId?: string;
  metadata?: {
    userInfo?: any;
    courseInfo?: any;
    sessionInfo?: any;
    [key: string]: any;
  };
}

// نوع السيناريو
export interface ChatScenario {
  id: string;
  title: string;
  description?: string;
  category: ScenarioCategory;
  trigger?: string[];
  messages: ScenarioMessage[];
  conditions?: ScenarioCondition[];
  tags?: string[];
  priority?: number;
  isActive?: boolean;
}

// فئات السيناريوهات
export type ScenarioCategory = 
  | 'welcome'           // الترحيب والبداية
  | 'courses'           // الدورات والمناهج
  | 'registration'      // التسجيل والانضمام
  | 'islamic-tools'     // الأدوات الإسلامية
  | 'schedule'          // المواعيد والجدولة
  | 'payment'           // المدفوعات والباقات
  | 'technical-support' // الدعم التقني
  | 'general-info'      // معلومات عامة
  | 'contact'           // التواصل
  | 'teachers'          // المعلمين
  | 'students'          // الطلاب
  | 'certificates'      // الشهادات
  | 'assignments'       // الواجبات والتقييم
  | 'live-sessions'     // الجلسات المباشرة
  | 'community'         // المجتمع والمنتدى
  | 'feedback'          // التقييم والاقتراحات
  | 'help';             // المساعدة والأسئلة الشائعة

// رسالة داخل السيناريو
export interface ScenarioMessage {
  id: string;
  content: string;
  type: MessageType;
  options?: ChatOption[];
  delay?: number; // تأخير في عرض الرسالة بالميلي ثانية
  conditions?: ScenarioCondition[];
  dynamicContent?: (context: ChatContext) => string;
}

// شروط السيناريو
export interface ScenarioCondition {
  type: 'user_role' | 'user_status' | 'time' | 'custom';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
  value: any;
  field?: string;
}

// سياق المحادثة
export interface ChatContext {
  currentScenarioId?: string;
  previousScenarioId?: string;
  userInfo?: {
    id?: string;
    name?: string;
    role?: 'student' | 'teacher' | 'supervisor' | 'admin' | 'guest';
    isAuthenticated?: boolean;
    preferences?: any;
  };
  sessionData?: {
    startTime: Date;
    messageCount: number;
    scenariosVisited: string[];
    lastActivity: Date;
  };
  variables?: Record<string, any>;
  history?: ChatMessage[];
}

// حالة الشات بوت
export interface ChatBotState {
  isOpen: boolean;
  isLoading: boolean;
  currentScenario?: ChatScenario;
  messages: ChatMessage[];
  context: ChatContext;
  suggestedActions?: ChatOption[];
  error?: string;
  isTyping?: boolean;
}

// إعدادات الشات بوت
export interface ChatBotConfig {
  welcomeScenarioId: string;
  fallbackScenarioId: string;
  maxMessagesHistory: number;
  enableTypingIndicator: boolean;
  enableSuggestions: boolean;
  enableHistory: boolean;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  animation?: {
    messageDelay?: number;
    typingSpeed?: number;
    enableAnimations?: boolean;
  };
}

// استجابة الشات بوت
export interface ChatBotResponse {
  messages: ChatMessage[];
  nextScenario?: string;
  suggestedActions?: ChatOption[];
  context?: Partial<ChatContext>;
  error?: string;
}

// إحصائيات الشات بوت
export interface ChatBotAnalytics {
  totalSessions: number;
  totalMessages: number;
  popularScenarios: { scenarioId: string; count: number }[];
  averageSessionDuration: number;
  satisfactionRating?: number;
  commonQueries: string[];
  conversionRate?: number;
}

// هوك البيانات للشات بوت
export interface UseChatBotReturn {
  state: ChatBotState;
  sendMessage: (content: string, options?: { scenarioId?: string }) => Promise<void>;
  selectOption: (option: ChatOption) => Promise<void>;
  resetChat: () => void;
  closeChat: () => void;
  openChat: () => void;
  goToScenario: (scenarioId: string) => Promise<void>;
  updateContext: (context: Partial<ChatContext>) => void;
}

// أنواع الإجراءات الخاصة
export type ChatAction = 
  | 'navigate_to_page'
  | 'open_external_link'
  | 'start_registration'
  | 'contact_support'
  | 'book_session'
  | 'download_resource'
  | 'show_courses'
  | 'calculate_price'
  | 'check_schedule'
  | 'send_feedback'
  | 'reset_chat'
  | 'escalate_to_human';

// بيانات التحليلات
export interface ChatAnalyticsEvent {
  type: 'message_sent' | 'option_selected' | 'scenario_started' | 'session_ended';
  timestamp: Date;
  scenarioId?: string;
  optionId?: string;
  userId?: string;
  sessionId: string;
  metadata?: any;
}

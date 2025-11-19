// مرافق لإدارة تاريخ المحادثات والتخزين المحلي للشات بوت

export interface ChatSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  scenariosVisited: string[];
  userType?: 'guest' | 'student' | 'teacher' | 'admin';
  userPreferences?: Record<string, any>;
  lastActivity: Date;
  totalDuration?: number;
  satisfactionRating?: number;
  completedActions?: string[];
}

export interface ChatHistory {
  sessionId: string;
  messages: any[];
  context: any;
  timestamp: Date;
}

export interface UserPreferences {
  preferredLanguage: 'ar' | 'en';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficultLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  notifications: boolean;
  theme: 'light' | 'dark';
  autoPlay: boolean;
}

class ChatBotStorage {
  private readonly STORAGE_KEYS = {
    SESSIONS: 'chatbot_sessions',
    CURRENT_SESSION: 'chatbot_current_session',
    USER_PREFERENCES: 'chatbot_preferences',
    CHAT_HISTORY: 'chatbot_history',
    ANALYTICS: 'chatbot_analytics'
  };

  // ===== إدارة الجلسات =====
  
  createSession(userType?: string): ChatSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: ChatSession = {
      id: sessionId,
      startTime: new Date(),
      messageCount: 0,
      scenariosVisited: [],
      userType: userType as any || 'guest',
      lastActivity: new Date(),
      completedActions: []
    };

    this.setCurrentSession(session);
    this.saveSessions(session);
    
    return session;
  }

  getCurrentSession(): ChatSession | null {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // تحويل التواريخ من string إلى Date
        session.startTime = new Date(session.startTime);
        session.lastActivity = new Date(session.lastActivity);
        if (session.endTime) session.endTime = new Date(session.endTime);
        return session;
      }
    } catch (error) {
      console.error('Error getting current session:', error);
    }
    return null;
  }

  setCurrentSession(session: ChatSession): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    } catch (error) {
      console.error('Error setting current session:', error);
    }
  }

  updateSession(updates: Partial<ChatSession>): void {
    const currentSession = this.getCurrentSession();
    if (currentSession) {
      const updatedSession = { 
        ...currentSession, 
        ...updates, 
        lastActivity: new Date() 
      };
      this.setCurrentSession(updatedSession);
      this.saveSessions(updatedSession);
    }
  }

  endSession(satisfactionRating?: number): void {
    const currentSession = this.getCurrentSession();
    if (currentSession) {
      const endTime = new Date();
      const totalDuration = endTime.getTime() - currentSession.startTime.getTime();
      
      this.updateSession({
        endTime,
        totalDuration,
        satisfactionRating
      });

      // نقل الجلسة إلى التاريخ
      this.archiveSession(currentSession.id);
    }
  }

  // ===== إدارة التاريخ =====

  saveToHistory(sessionId: string, messages: any[], context: any): void {
    try {
      const historyEntry: ChatHistory = {
        sessionId,
        messages: messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp?.toISOString?.() || msg.timestamp
        })),
        context,
        timestamp: new Date()
      };

      const existingHistory = this.getChatHistory();
      const updatedHistory = [historyEntry, ...existingHistory.slice(0, 49)]; // احتفظ بآخر 50 جلسة
      
      localStorage.setItem(this.STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }

  getChatHistory(): ChatHistory[] {
    try {
      const historyData = localStorage.getItem(this.STORAGE_KEYS.CHAT_HISTORY);
      if (historyData) {
        return JSON.parse(historyData).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error getting chat history:', error);
    }
    return [];
  }

  getSessionHistory(sessionId: string): ChatHistory | null {
    const history = this.getChatHistory();
    return history.find(entry => entry.sessionId === sessionId) || null;
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.CHAT_HISTORY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  // ===== تفضيلات المستخدم =====

  saveUserPreferences(preferences: Partial<UserPreferences>): void {
    try {
      const existingPrefs = this.getUserPreferences();
      const updatedPrefs = { ...existingPrefs, ...preferences };
      localStorage.setItem(this.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  getUserPreferences(): UserPreferences {
    try {
      const prefsData = localStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
      if (prefsData) {
        return JSON.parse(prefsData);
      }
    } catch (error) {
      console.error('Error getting preferences:', error);
    }
    
    // إرجاع التفضيلات الافتراضية
    return {
      preferredLanguage: 'ar',
      learningStyle: 'visual',
      difficultLevel: 'beginner',
      interests: [],
      notifications: true,
      theme: 'light',
      autoPlay: false
    };
  }

  // ===== التحليلات =====

  trackEvent(eventType: string, data: any): void {
    try {
      const event = {
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
        sessionId: this.getCurrentSession()?.id
      };

      const existingAnalytics = this.getAnalytics();
      const updatedAnalytics = [event, ...existingAnalytics.slice(0, 99)]; // احتفظ بآخر 100 حدث
      
      localStorage.setItem(this.STORAGE_KEYS.ANALYTICS, JSON.stringify(updatedAnalytics));
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  getAnalytics(): any[] {
    try {
      const analyticsData = localStorage.getItem(this.STORAGE_KEYS.ANALYTICS);
      return analyticsData ? JSON.parse(analyticsData) : [];
    } catch (error) {
      console.error('Error getting analytics:', error);
      return [];
    }
  }

  getAnalyticsSummary(): any {
    const sessions = this.getAllSessions();

    return {
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((sum, session) => sum + session.messageCount, 0),
      averageSessionDuration: sessions.length > 0 
        ? sessions.reduce((sum, session) => sum + (session.totalDuration || 0), 0) / sessions.length
        : 0,
      popularScenarios: this.getMostPopularScenarios(),
      commonQueries: this.getCommonQueries(),
      userSatisfaction: this.getAverageSatisfaction()
    };
  }

  // ===== مساعدات خاصة =====

  private saveSessions(session: ChatSession): void {
    try {
      const existingSessions = this.getAllSessions();
      const sessionIndex = existingSessions.findIndex(s => s.id === session.id);
      
      if (sessionIndex >= 0) {
        existingSessions[sessionIndex] = session;
      } else {
        existingSessions.unshift(session);
      }

      // احتفظ بآخر 20 جلسة فقط
      const sessionsToKeep = existingSessions.slice(0, 20);
      localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(sessionsToKeep));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  private getAllSessions(): ChatSession[] {
    try {
      const sessionsData = localStorage.getItem(this.STORAGE_KEYS.SESSIONS);
      if (sessionsData) {
        return JSON.parse(sessionsData).map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          lastActivity: new Date(session.lastActivity),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        }));
      }
    } catch (error) {
      console.error('Error getting all sessions:', error);
    }
    return [];
  }

  private archiveSession(sessionId: string): void {
    const currentSession = this.getCurrentSession();
    if (currentSession && currentSession.id === sessionId) {
      localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION);
    }
  }

  private getMostPopularScenarios(): Array<{scenarioId: string, count: number}> {
    const sessions = this.getAllSessions();
    const scenarioCount: Record<string, number> = {};

    sessions.forEach(session => {
      session.scenariosVisited.forEach(scenarioId => {
        scenarioCount[scenarioId] = (scenarioCount[scenarioId] || 0) + 1;
      });
    });

    return Object.entries(scenarioCount)
      .map(([scenarioId, count]) => ({ scenarioId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getCommonQueries(): string[] {
    // يمكن تحسين هذا بتتبع الرسائل النصية الفعلية
    return [
      'كيف أتعلم القرآن؟',
      'ما هي أفضل دورة للمبتدئين؟',
      'كم سعر الدورة؟',
      'كيف أسجل في الموقع؟',
      'متى تبدأ الدورات؟'
    ];
  }

  private getAverageSatisfaction(): number {
    const sessions = this.getAllSessions();
    const ratingsCount = sessions.filter(s => s.satisfactionRating).length;
    
    if (ratingsCount === 0) return 0;
    
    const totalRating = sessions.reduce((sum, session) => 
      sum + (session.satisfactionRating || 0), 0);
    
    return totalRating / ratingsCount;
  }

  // ===== تصدير البيانات =====

  exportChatHistory(): string {
    const history = this.getChatHistory();
    const sessions = this.getAllSessions();
    const preferences = this.getUserPreferences();
    const analytics = this.getAnalyticsSummary();

    const exportData = {
      exportDate: new Date().toISOString(),
      chatHistory: history,
      sessions: sessions,
      userPreferences: preferences,
      analytics: analytics
    };

    return JSON.stringify(exportData, null, 2);
  }

  importChatHistory(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.chatHistory) {
        localStorage.setItem(this.STORAGE_KEYS.CHAT_HISTORY, 
          JSON.stringify(importData.chatHistory));
      }
      
      if (importData.userPreferences) {
        localStorage.setItem(this.STORAGE_KEYS.USER_PREFERENCES, 
          JSON.stringify(importData.userPreferences));
      }

      return true;
    } catch (error) {
      console.error('Error importing chat history:', error);
      return false;
    }
  }

  // ===== تنظيف البيانات =====

  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error clearing ${key}:`, error);
      }
    });
  }

  getStorageSize(): string {
    let totalSize = 0;
    Object.values(this.STORAGE_KEYS).forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      } catch (error) {
        console.error(`Error calculating size for ${key}:`, error);
      }
    });

    // تحويل إلى KB
    return `${(totalSize / 1024).toFixed(2)} KB`;
  }
}

// إنشاء instance واحد للاستخدام في كامل التطبيق
export const chatBotStorage = new ChatBotStorage();

// مساعدات إضافية
export const chatHelpers = {
  // تنسيق الوقت
  formatDuration: (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}س ${minutes % 60}د`;
    } else if (minutes > 0) {
      return `${minutes}د ${seconds % 60}ث`;
    } else {
      return `${seconds}ث`;
    }
  },

  // تحليل المشاعر البسيط
  analyzeSentiment: (text: string): 'positive' | 'negative' | 'neutral' => {
    const positiveWords = ['ممتاز', 'رائع', 'جميل', 'شكراً', 'أحب', 'مفيد', 'جيد'];
    const negativeWords = ['صعب', 'معقد', 'مش فاهم', 'مشكلة', 'صعوبة', 'مش عارف'];
    
    const lowerText = text.toLowerCase();
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  },

  // توليد اقتراحات ذكية
  generateSmartSuggestions: (context: any) => {
    const suggestions = [];
    
    if (context.currentScenarioId?.includes('course')) {
      suggestions.push({ id: 'pricing', text: '💰 الأسعار', nextScenario: 'pricing-info' });
    }
    
    if (context.sessionData?.messageCount > 5) {
      suggestions.push({ id: 'summary', text: '📋 ملخص المحادثة', action: 'show_summary' });
    }
    
    return suggestions;
  }
};

export default chatBotStorage;

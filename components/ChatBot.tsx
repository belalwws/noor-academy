'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChatMessage, 
  ChatOption, 
  ChatBotState, 
  ChatContext, 
  UseChatBotReturn,
  ChatAction
} from '../types/chatbot';
import chatScenarios, { quickSuggestions, keywordMapping } from '../data/chatScenarios';
import { allScenarios, advancedKeywords, smartSuggestions } from '../data/advancedScenarios';
import { chatBotStorage, chatHelpers } from '../utils/chatBotStorage';

// هوك للتعامل مع منطق الشات بوت
export const useChatBot = (): UseChatBotReturn => {
  const [state, setState] = useState<ChatBotState>({
    isOpen: false,
    isLoading: false,
    messages: [],
    context: {
      sessionData: {
        startTime: new Date(),
        messageCount: 0,
        scenariosVisited: [],
        lastActivity: new Date()
      },
      variables: {},
      history: []
    },
    suggestedActions: quickSuggestions
  });

  // تهيئة الشات بوت
  useEffect(() => {
    if (state.isOpen && state.messages.length === 0) {
      initializeChat();
    }
  }, [state.isOpen]);

  const initializeChat = useCallback(async () => {
    // إنشاء جلسة جديدة أو استكمال الجلسة الحالية
    let currentSession = chatBotStorage.getCurrentSession();
    if (!currentSession) {
      currentSession = chatBotStorage.createSession();
    }

    const welcomeScenario = chatScenarios['welcome'];
    if (welcomeScenario) {
      setState(prev => ({
        ...prev,
        currentScenario: welcomeScenario,
        isLoading: true
      }));

      // محاكاة تأخير الكتابة
      setTimeout(() => {
        const welcomeMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          type: 'options',
          sender: 'bot',
          content: welcomeScenario.messages[0].content,
          options: welcomeScenario.messages[0].options,
          timestamp: new Date(),
          scenarioId: welcomeScenario.id
        };

        setState(prev => ({
          ...prev,
          messages: [welcomeMessage],
          isLoading: false,
          context: {
            ...prev.context,
            currentScenarioId: welcomeScenario.id,
            sessionData: {
              ...prev.context.sessionData!,
              scenariosVisited: [welcomeScenario.id]
            }
          }
        }));
      }, 1000);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, options?: { scenarioId?: string }) => {
    // إضافة رسالة المستخدم
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'text',
      sender: 'user',
      content,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      context: {
        ...prev.context,
        sessionData: {
          ...prev.context.sessionData!,
          messageCount: prev.context.sessionData!.messageCount + 1,
          lastActivity: new Date()
        }
      }
    }));

    // البحث الذكي عن السيناريو المناسب
    let targetScenario = options?.scenarioId ? 
      (chatScenarios[options.scenarioId] || (allScenarios as any)[options.scenarioId]) : null;
    
    if (!targetScenario) {
      // البحث بالكلمات المفتاحية الأساسية
      const lowerContent = content.toLowerCase();
      for (const [keyword, scenarioId] of Object.entries(keywordMapping)) {
        if (lowerContent.includes(keyword)) {
          targetScenario = chatScenarios[scenarioId];
          break;
        }
      }

      // البحث بالكلمات المفتاحية المتقدمة
      if (!targetScenario) {
        for (const [keyword, scenarioId] of Object.entries(advancedKeywords)) {
          if (lowerContent.includes(keyword)) {
            targetScenario = chatScenarios[scenarioId] || (allScenarios as any)[scenarioId];
            break;
          }
        }
      }
    }

    // إذا لم يتم العثور على سيناريو، استخدام الافتراضي
    if (!targetScenario) {
      targetScenario = chatScenarios['fallback'];
    }

    // تتبع الحدث
    chatBotStorage.trackEvent('message_sent', {
      content,
      targetScenario: targetScenario.id,
      sentiment: chatHelpers.analyzeSentiment(content)
    });

    // محاكاة تأخير الاستجابة
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        type: targetScenario!.messages[0].type,
        sender: 'bot',
        content: targetScenario!.messages[0].content,
        options: targetScenario!.messages[0].options,
        timestamp: new Date(),
        scenarioId: targetScenario!.id
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        currentScenario: targetScenario!,
        isLoading: false,
        context: {
          ...prev.context,
          currentScenarioId: targetScenario!.id,
          previousScenarioId: prev.context.currentScenarioId,
          sessionData: {
            ...prev.context.sessionData!,
            scenariosVisited: [...prev.context.sessionData!.scenariosVisited, targetScenario!.id]
          }
        }
      }));
    }, Math.random() * 1000 + 500); // تأخير عشوائي من 0.5 إلى 1.5 ثانية
  }, []);

  const selectOption = useCallback(async (option: ChatOption) => {
    // إضافة رسالة المستخدم بالخيار المحدد
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'text',
      sender: 'user',
      content: option.text,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }));

    // تنفيذ الإجراء إذا كان موجوداً
    if (option.action) {
      handleAction(option.action as ChatAction, option.payload);
    }

    // الانتقال للسيناريو التالي
    if (option.nextScenario) {
      await goToScenario(option.nextScenario);
    }
  }, []);

  const handleAction = (action: ChatAction, payload?: any) => {
    switch (action) {
      case 'navigate_to_page':
        if (typeof window !== 'undefined' && payload) {
          window.location.href = payload;
        }
        break;
      case 'open_external_link':
        if (typeof window !== 'undefined' && payload) {
          window.open(payload, '_blank');
        }
        break;
      case 'reset_chat':
        resetChat();
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };

  const goToScenario = useCallback(async (scenarioId: string) => {
    const scenario = chatScenarios[scenarioId] || (allScenarios as any)[scenarioId];
    if (!scenario) {
      console.error('Scenario not found:', scenarioId);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        type: scenario.messages[0].type,
        sender: 'bot',
        content: scenario.messages[0].content,
        options: scenario.messages[0].options,
        timestamp: new Date(),
        scenarioId: scenario.id
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        currentScenario: scenario,
        isLoading: false,
        context: {
          ...prev.context,
          currentScenarioId: scenario.id,
          previousScenarioId: prev.context.currentScenarioId,
          sessionData: {
            ...prev.context.sessionData!,
            scenariosVisited: [...prev.context.sessionData!.scenariosVisited, scenario.id]
          }
        }
      }));
    }, 800);
  }, []);

  const resetChat = useCallback(() => {
    // إنهاء الجلسة الحالية
    chatBotStorage.endSession();
    
    setState({
      isOpen: false,
      isLoading: false,
      messages: [],
      context: {
        sessionData: {
          startTime: new Date(),
          messageCount: 0,
          scenariosVisited: [],
          lastActivity: new Date()
        },
        variables: {},
        history: []
      },
      suggestedActions: quickSuggestions
    });
  }, []);

  const updateContext = useCallback((contextUpdate: Partial<ChatContext>) => {
    setState(prev => ({
      ...prev,
      context: { ...prev.context, ...contextUpdate }
    }));
  }, []);

  return {
    state,
    sendMessage,
    selectOption,
    resetChat,
    closeChat: () => setState(prev => ({ ...prev, isOpen: false })),
    openChat: () => setState(prev => ({ ...prev, isOpen: true })),
    goToScenario,
    updateContext
  };
};

// مكون الشات بوت الرئيسي
interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose, className = '' }) => {
  const chatBot = useChatBot();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // تحديث حالة فتح/إغلاق الشات
  useEffect(() => {
    if (isOpen !== chatBot.state.isOpen) {
      if (isOpen) {
        chatBot.openChat();
      } else {
        chatBot.closeChat();
      }
    }
  }, [isOpen, chatBot.state.isOpen]);

  // التمرير التلقائي للأسفل
  useEffect(() => {
    scrollToBottom();
  }, [chatBot.state.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <div className={`chatbot-container ${className}`}>
      <div className="chatbot-modal">
        {/* رأس الشات بوت */}
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <div className="chatbot-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="chatbot-info">
              <div className="chatbot-title">مساعد أكاديمية لسان الحكمة</div>
              <div className="chatbot-status">
                {chatBot.state.isLoading ? (
                  <>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    يكتب...
                  </>
                ) : (
                  'متاح الآن'
                )}
              </div>
            </div>
          </div>
          <button className="chatbot-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* منطقة الرسائل */}
        <div className="chatbot-messages">
          {chatBot.state.messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender}-message`}
              tabIndex={-1}
              style={{
                outline: 'none',
                border: 'none',
                boxShadow: 'none',
                WebkitTapHighlightColor: 'transparent',
                ...(message.sender === 'user' && {
                  background: 'linear-gradient(135deg, #2d7d32, #1b5e20)',
                  color: 'white',
                  borderRadius: '18px 18px 4px 18px',
                  padding: '12px 16px',
                  maxWidth: '80%',
                  wordWrap: 'break-word' as any,
                  alignSelf: 'flex-end',
                  marginBottom: '8px'
                })
              } as React.CSSProperties}
            >
              <div 
                className="message-content"
                tabIndex={-1}
                style={{
                  outline: 'none',
                  border: 'none',
                  boxShadow: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  ...(message.sender === 'user' && {
                    background: 'transparent',
                    padding: '0',
                    borderRadius: '0'
                  })
                } as React.CSSProperties}
              >
                <div 
                  className="message-text"
                  tabIndex={-1}
                  style={{
                    outline: 'none',
                    border: 'none',
                    boxShadow: 'none'
                  }}
                >
                  {message.content}
                </div>
                
                {/* عرض الخيارات */}
                {message.options && message.options.length > 0 && (
                  <div className="message-options">
                    {message.options.map((option) => (
                      <button
                        key={option.id}
                        className={`option-button ${option.disabled ? 'disabled' : ''}`}
                        style={{ borderColor: option.color }}
                        onClick={() => !option.disabled && chatBot.selectOption(option)}
                        disabled={option.disabled}
                      >
                        {option.icon && <i className={option.icon}></i>}
                        <span>{option.text}</span>
                        {option.description && (
                          <small className="option-description">{option.description}</small>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString('ar-SA', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))}
          
          {/* مؤشر الكتابة */}
          {chatBot.state.isLoading && (
            <div className="message bot-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* اقتراحات سريعة */}
        {chatBot.state.suggestedActions && chatBot.state.suggestedActions.length > 0 && (
          <div className="quick-suggestions">
            {chatBot.state.suggestedActions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="suggestion-button"
                onClick={() => chatBot.selectOption(suggestion)}
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        )}

        {/* أدوات إضافية */}
        {chatBot.state.messages.length > 5 && (
          <div className="chat-tools">
            <button
              className="tool-button"
              onClick={() => chatBot.resetChat()}
              title="بدء محادثة جديدة"
            >
              <i className="fas fa-refresh"></i>
            </button>
          </div>
        )}


      </div>

      <style jsx>{`
        .chatbot-container {
          position: fixed;
          bottom: 100px;
          left: 20px;
          width: 380px;
          height: 600px;
          z-index: 2000;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
        }

        .chatbot-container *,
        .chatbot-container *:focus,
        .chatbot-container *:focus-visible,
        .chatbot-container *:active,
        .chatbot-container *:hover {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-focus-ring-color: transparent !important;
          -moz-outline: none !important;
        }

        /* خاص برسائل المستخدم - إزالة أي تأثيرات */
        .message.user-message,
        .message.user-message *,
        .message.user-message div {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent !important;
          background-clip: padding-box !important;
          border-style: none !important;
        }

        .chatbot-container *:focus,
        .chatbot-container *:active,
        .chatbot-container *:hover:focus {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }

        /* إزالة خاصة للإطارات الزرقاء */
        .chatbot-container input:focus,
        .chatbot-container button:focus,
        .chatbot-container div:focus,
        .chatbot-container span:focus,
        .chatbot-container [tabindex]:focus {
          outline: 0 !important;
          outline-offset: 0 !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        /* قواعد عامة لإزالة أي تأثيرات زرقاء */
        .chatbot-container *:focus-visible {
          outline: none !important;
        }
        
        .chatbot-container *::-moz-focus-inner {
          border: 0 !important;
        }

        .chatbot-modal {
          width: 100%;
          height: 100%;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }

        .chatbot-header {
          background: linear-gradient(135deg, #2d7d32 0%, #1b5e20 100%);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chatbot-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chatbot-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .chatbot-info {
          flex: 1;
        }

        .chatbot-title {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .chatbot-status {
          font-size: 12px;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .typing-indicator {
          display: flex;
          gap: 2px;
        }

        .typing-indicator span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: currentColor;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .chatbot-close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .chatbot-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chatbot-messages *:focus {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 85%;
          margin: 12px 0;
        }

        .user-message {
          align-self: flex-end;
          align-items: flex-end;
        }

        /* إزالة جميع الحدود والإطارات من رسائل المستخدم */
        .message.user-message,
        .message.user-message *,
        .message.user-message div,
        .user-message, 
        .user-message *,
        .user-message div,
        .user-message .message-content,
        .user-message .message-text {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-focus-ring-color: transparent !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }

        /* إزالة focus states شاملة */
        .message.user-message:focus,
        .message.user-message:focus-visible,
        .message.user-message:hover,
        .message.user-message:active,
        .message.user-message *:focus,
        .message.user-message *:focus-visible,
        .user-message:focus,
        .user-message:focus-visible,
        .user-message:hover,
        .user-message:active,
        .user-message *:focus,
        .user-message *:focus-visible,
        .user-message .message-content:focus,
        .user-message .message-content:focus-visible,
        .user-message .message-text:focus,
        .user-message .message-text:focus-visible {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        .bot-message {
          align-self: flex-start;
          align-items: flex-start;
        }

        .message-content {
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }

        .message-content::before,
        .message-content::after {
          display: none !important;
        }

        .user-message .message-content {
          background: linear-gradient(135deg, #2d7d32, #1b5e20) !important;
          color: white !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
          pointer-events: none !important;
        }

        /* منع أي عنصر في رسالة المستخدم من أن يكون focusable */
        .user-message,
        .user-message *,
        .message.user-message,
        .message.user-message * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          pointer-events: none !important;
          tabindex: -1 !important;
        }

        .bot-message .message-content {
          background: #f5f5f5;
          color: #333;
          border: none;
        }

        .message-text {
          white-space: pre-wrap;
          line-height: 1.4;
          font-size: 14px;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          background: transparent !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }

        .message-time {
          font-size: 11px;
          color: #888;
          margin-top: 4px;
          margin-right: 8px;
        }

        .message-options {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .option-button {
          background: white;
          border: 2px solid #2d7d32;
          border-radius: 12px;
          padding: 12px 16px;
          color: #2d7d32;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          text-align: right;
          min-height: 44px;
        }

        .option-button:hover:not(.disabled) {
          background: #2d7d32;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(45, 125, 50, 0.3);
        }

        .option-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .option-button i {
          font-size: 16px;
        }

        .option-description {
          display: block;
          margin-top: 4px;
          opacity: 0.8;
          font-size: 12px;
        }

        .quick-suggestions {
          padding: 0 20px 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .suggestion-button {
          background: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 6px 12px;
          font-size: 12px;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion-button:hover {
          background: #2d7d32;
          color: white;
          border-color: #2d7d32;
        }

        .chat-tools {
          padding: 10px 20px;
          display: flex;
          justify-content: center;
          gap: 10px;
          border-top: 1px solid #e0e0e0;
          background: #fafafa;
        }

        .tool-button {
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #666;
        }

        .tool-button:hover {
          background: #2d7d32;
          color: white;
          border-color: #2d7d32;
          transform: scale(1.1);
        }

        .chatbot-input {
          padding: 20px;
          border-top: 1px solid #e0e0e0;
          background: #fafafa;
        }

        .input-container {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .message-input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 25px;
          padding: 12px 20px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          font-family: 'Cairo', sans-serif;
        }

        .message-input:focus {
          border-color: #2d7d32;
          box-shadow: 0 0 0 3px rgba(45, 125, 50, 0.1);
        }

        .send-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2d7d32, #1b5e20);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(45, 125, 50, 0.3);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* تخصيصات للشاشات الصغيرة */
        @media (max-width: 768px) {
          .chatbot-container {
            left: 10px;
            right: 10px;
            width: auto;
            height: 70vh;
            bottom: 80px;
          }
        }

        /* تخصيص شريط التمرير */
        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chatbot-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;

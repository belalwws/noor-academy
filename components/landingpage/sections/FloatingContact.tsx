import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Bot, X } from 'lucide-react';

export const FloatingContact: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const contacts = [
    {
      icon: Bot,
      label: 'مساعد ذكي',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:shadow-purple-500/50',
      action: () => alert('مساعد ذكي - قيد التطوير'),
    },
    {
      icon: MessageCircle,
      label: 'واتساب',
      color: 'from-green-500 to-emerald-500',
      hoverColor: 'hover:shadow-green-500/50',
      action: () => window.open('https://wa.me/966500000000', '_blank'),
    },
    {
      icon: Phone,
      label: 'اتصل بنا',
      color: 'from-blue-500 to-cyan-500',
      hoverColor: 'hover:shadow-blue-500/50',
      action: () => window.open('tel:+966500000000'),
    },
  ];

  return (
    <div className="fixed left-6 bottom-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 space-y-3"
          >
            {contacts.map((contact, index) => (
              <motion.button
                key={contact.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                onClick={contact.action}
                className={`flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-lg ${contact.hoverColor} hover:shadow-xl dark:hover:shadow-xl transition-all duration-300 group border border-transparent dark:border-slate-700`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${contact.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <contact.icon className="text-white" size={24} />
                </div>
                <span className="font-semibold text-text-primary dark:text-slate-200">{contact.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 gradient-primary rounded-full shadow-glow flex items-center justify-center hover:shadow-xl transition-all duration-300"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="text-white" size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="text-white" size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, X } from 'lucide-react';

interface MarkTheWordsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface MarkableWord {
  id: string;
  word: string;
  correct: boolean; // true if word should be selected, false if not
}

export default function MarkTheWordsEditor({ value, onChange }: MarkTheWordsEditorProps) {
  const [text, setText] = useState('');
  const [markableWords, setMarkableWords] = useState<MarkableWord[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const isInternalUpdate = useRef(false);

  // Initialize from value
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    if (!value) {
      if (text !== '' || markableWords.length > 0) {
        setText('');
        setMarkableWords([]);
        setSelectedWords(new Set());
      }
      return;
    }

    // Parse format: "text text [correctWord] text [wrongWord:!] text"
    // [word] means word should be selected (correct)
    // [word:!] means word should NOT be selected (incorrect)
    const parts: Array<{ type: 'text' | 'word'; content: string; correct: boolean }> = [];
    const regex = /\[([^\]:]+)(:!)?\]/g;
    let match;
    let lastIndex = 0;
    let fullText = '';

    while ((match = regex.exec(value)) !== null) {
      if (match.index > lastIndex) {
        const textPart = value.substring(lastIndex, match.index);
        fullText += textPart;
        parts.push({ type: 'text', content: textPart, correct: false });
      }
      
      const word = match[1];
      const isIncorrect = match[2] === ':!';
      fullText += word;
      parts.push({ type: 'word', content: word, correct: !isIncorrect });
      
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < value.length) {
      const textPart = value.substring(lastIndex);
      fullText += textPart;
      parts.push({ type: 'text', content: textPart, correct: false });
    }

    setText(fullText);

    // Extract markable words
    const words: MarkableWord[] = [];
    const wordsSet = new Set<string>();
    
    parts.forEach((part, idx) => {
      if (part.type === 'word') {
        if (!wordsSet.has(part.content)) {
          wordsSet.add(part.content);
          words.push({
            id: `word-${idx}-${Date.now()}`,
            word: part.content,
            correct: part.correct
          });
        }
      }
    });

    // Also extract unique words from text
    const textWords = fullText.split(/\s+/).filter(w => w.trim());
    textWords.forEach((word) => {
      const cleanWord = word.trim().replace(/[.,;:!?()]/g, '');
      if (cleanWord && !wordsSet.has(cleanWord) && !words.find(w => w.word === cleanWord)) {
        words.push({
          id: `word-${words.length}-${Date.now()}`,
          word: cleanWord,
          correct: false // Default to incorrect (should not be selected)
        });
      }
    });

    // Only update if there's an actual change
    const wordsChanged = JSON.stringify(words) !== JSON.stringify(markableWords);
    const textChanged = fullText !== text;
    
    if (textChanged) {
      setText(fullText);
    }
    
    if (wordsChanged) {
      setMarkableWords(words);
      // Set selected words (correct ones)
      const correctWords = new Set(words.filter(w => w.correct).map(w => w.word));
      setSelectedWords(correctWords);
    }
  }, [value]); // Keep value as dependency, but check for actual changes before updating

  // Update output when text or markable words change
  useEffect(() => {
    if (isInternalUpdate.current) {
      return;
    }

    if (!text) {
      if (onChange && value !== '') {
        isInternalUpdate.current = true;
        onChange('');
      }
      return;
    }

    // Only update if markableWords has been modified by user (not from parsing)
    if (markableWords.length === 0) {
      // No words marked yet, don't update output
      return;
    }

    // Build output: mark correct words with [word] and incorrect ones with [word:!]
    let output = text;
    
    // Replace words with marked versions (in reverse order to avoid position shifts)
    const sortedWords = [...markableWords].reverse();
    sortedWords.forEach((wordObj) => {
      if (wordObj.correct) {
        // Mark correct word
        const regex = new RegExp(`\\b${wordObj.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        output = output.replace(regex, (match, offset, string) => {
          // Check if already marked
          const before = string.substring(Math.max(0, offset - 1), offset);
          const after = string.substring(offset + match.length, offset + match.length + 1);
          if (before === '[' && after === ']') {
            return match; // Already marked correctly
          }
          // Remove any existing marks first
          const before2 = string.substring(Math.max(0, offset - 3), offset);
          if (before2.endsWith('[') && after === ']') {
            // Already has some mark, skip
            return match;
          }
          return `[${match}]`;
        });
      } else if (wordObj.word) {
        // Mark incorrect word (should not be selected) - only if explicitly set
        // Skip default incorrect words to avoid marking everything
        const regex = new RegExp(`\\b${wordObj.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        const matches = output.match(regex);
        if (matches && matches.length > 0) {
          // Only mark if word was explicitly added to markableWords
          output = output.replace(regex, (match, offset, string) => {
            const before = string.substring(Math.max(0, offset - 1), offset);
            const after = string.substring(offset + match.length, offset + match.length + 3);
            if (before === '[' && after === ']:!') {
              return match; // Already marked
            }
            if (before === '[' && string.substring(offset + match.length, offset + match.length + 1) === ']') {
              // Already marked as correct, skip
              return match;
            }
            // Only mark if not already in brackets
            if (before !== '[' && !after.startsWith(']')) {
              return `[${match}:!]`;
            }
            return match;
          });
        }
      }
    });

    // Only call onChange if output actually changed and is different from current value
    if (onChange && output !== value && output !== text) {
      isInternalUpdate.current = true;
      onChange(output);
      // Reset flag after a microtask to allow React to process the update
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    }
  }, [text, markableWords]); // Removed onChange and value from dependencies to avoid loops

  const handleToggleWord = (word: string) => {
    const wordObj = markableWords.find(w => w.word === word);
    if (!wordObj) return;

    const updatedWords = markableWords.map(w => 
      w.id === wordObj.id ? { ...w, correct: !w.correct } : w
    );
    setMarkableWords(updatedWords);

    // Update selected words
    const newSelected = new Set(selectedWords);
    if (wordObj.correct) {
      newSelected.delete(word);
    } else {
      newSelected.add(word);
    }
    setSelectedWords(newSelected);
  };

  const handleAddWord = () => {
    // Extract words from text
    const words = text.split(/\s+/).filter(w => {
      const cleanWord = w.trim().replace(/[.,;:!?()]/g, '');
      return cleanWord && !markableWords.find(mw => mw.word === cleanWord);
    });

    if (words.length === 0) {
      // No new words to add
      return;
    }

    // Add first new word
    const newWord = words[0];
    const newWordObj: MarkableWord = {
      id: `word-${Date.now()}`,
      word: newWord,
      correct: false
    };

    setMarkableWords([...markableWords, newWordObj]);
  };

  const handleRemoveWord = (id: string) => {
    const wordObj = markableWords.find(w => w.id === id);
    if (wordObj) {
      const newSelected = new Set(selectedWords);
      newSelected.delete(wordObj.word);
      setSelectedWords(newSelected);
    }
    setMarkableWords(markableWords.filter(w => w.id !== id));
  };

  // Build preview showing marked words
  const buildPreview = () => {
    if (!text) return null;

    const parts: Array<{ type: 'text' | 'word'; content: string; correct: boolean }> = [];
    const words = text.split(/\s+/);
    let lastIndex = 0;

    words.forEach((wordWithPunctuation) => {
      const cleanWord = wordWithPunctuation.replace(/[.,;:!?()]/g, '');
      const wordObj = markableWords.find(w => w.word === cleanWord);
      
      if (wordObj) {
        // Add text before word
        const wordStart = text.indexOf(wordWithPunctuation, lastIndex);
        if (wordStart > lastIndex) {
          parts.push({
            type: 'text',
            content: text.substring(lastIndex, wordStart),
            correct: false
          });
        }
        
        // Add word
        parts.push({
          type: 'word',
          content: wordWithPunctuation,
          correct: wordObj.correct
        });
        
        lastIndex = wordStart + wordWithPunctuation.length;
      }
    });

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
        correct: false
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text' as const, content: text, correct: false }];
  };

  const previewParts = buildPreview();

  return (
    <div className="space-y-6" dir="rtl">
      <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
        <AlertDescription className="text-sm text-red-900 dark:text-red-200">
          💡 <strong>كيفية الاستخدام:</strong> اكتب النص، ثم حدد الكلمات التي يجب على الطالب تحديدها (صحيحة) والكلمات التي لا يجب تحديدها (خاطئة).
        </AlertDescription>
      </Alert>

      {/* Text Input */}
      <div className="space-y-2">
        <Label className="text-lg font-bold text-gray-900 dark:text-white">
          النص *
        </Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب النص هنا..."
          rows={6}
          dir="rtl"
          className="text-lg h-12 focus:ring-2 focus:ring-red-500 shadow-sm rounded-lg resize-none"
        />
      </div>

      {/* Add Word Button */}
      {text && (
        <Button
          type="button"
          onClick={handleAddWord}
          variant="outline"
          className="shadow-sm hover:shadow-md text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Plus className="w-5 h-5 ml-2" />
          إضافة كلمة من النص
        </Button>
      )}

      {/* Markable Words List */}
      {markableWords.length > 0 && (
        <div className="space-y-3">
          <Label className="text-lg font-bold text-gray-900 dark:text-white">
            الكلمات القابلة للتحديد ({markableWords.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {markableWords.map((wordObj) => {
              const isSelected = wordObj.correct;
              return (
                <motion.button
                  key={wordObj.id}
                  type="button"
                  onClick={() => handleToggleWord(wordObj.word)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-100'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                  } hover:shadow-md`}
                >
                  <span className="font-semibold">{wordObj.word}</span>
                  {isSelected ? (
                    <span className="text-blue-600 dark:text-blue-400">✓ صحيح</span>
                  ) : (
                    <span className="text-gray-500">✗ خطأ</span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveWord(wordObj.id);
                    }}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </motion.button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 اضغط على الكلمة لتغيير حالتها بين "صحيح" (يجب تحديدها) و "خطأ" (لا يجب تحديدها)
          </p>
        </div>
      )}

      {/* Preview */}
      {text && markableWords.length > 0 && previewParts && (
        <div className="space-y-3">
          <Label className="text-lg font-bold text-gray-900 dark:text-white">
            معاينة النص للطلاب:
          </Label>
          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl min-h-[100px] text-lg leading-relaxed text-right border border-red-200 dark:border-red-800" dir="rtl">
            {previewParts.map((part, idx) => {
              if (part.type === 'word') {
                const wordObj = markableWords.find(w => w.word === part.content.replace(/[.,;:!?()]/g, ''));
                if (wordObj?.correct) {
                  return (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-block mx-1 px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded border-2 border-dashed border-yellow-400 dark:border-yellow-600 font-semibold cursor-pointer hover:bg-yellow-300 dark:hover:bg-yellow-700"
                      title="اضغط لتحديد هذه الكلمة"
                    >
                      {part.content}
                    </motion.span>
                  );
                }
              }
              return (
                <span key={idx} className="text-gray-900 dark:text-white">
                  {part.content}
                </span>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 الكلمات المميزة باللون الأصفر هي الكلمات التي يجب على الطالب تحديدها
          </p>
        </div>
      )}
    </div>
  );
}


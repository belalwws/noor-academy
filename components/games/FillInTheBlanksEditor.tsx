'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FillInTheBlanksEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FillInTheBlanksEditor({ value, onChange }: FillInTheBlanksEditorProps) {
  const [baseText, setBaseText] = useState('');
  const [blanks, setBlanks] = useState<Array<{ id: number; word: string; position: number }>>([]);
  const [blankCounter, setBlankCounter] = useState(0);
  const isInternalUpdate = useRef(false);
  const isInitialized = useRef(false);

  // Initialize from value (only once on mount or when value changes from outside)
  useEffect(() => {
    if (isInitialized.current && !isInternalUpdate.current) {
      // Value changed from outside, re-parse
      const regex = /\*([^*]+)\*/g;
      let match;
      const foundBlanks: Array<{ id: number; word: string; position: number }> = [];
      let text = value || '';
      let blankId = 0;
      let offset = 0;

      // Find all blanks
      while ((match = regex.exec(value || '')) !== null) {
        const word = match[1];
        const position = match.index - offset;
        foundBlanks.push({ id: blankId++, word, position });
        // Remove *word* from text to get base text
        text = text.substring(0, match.index - offset) + text.substring(match.index - offset + match[0].length);
        offset += match[0].length;
      }

      isInternalUpdate.current = true;
      setBaseText(text);
      setBlanks(foundBlanks);
      setBlankCounter(blankId > 0 ? blankId : 0);
      isInternalUpdate.current = false;
    } else if (!isInitialized.current) {
      // First mount - initialize
      if (value) {
        const regex = /\*([^*]+)\*/g;
        let match;
        const foundBlanks: Array<{ id: number; word: string; position: number }> = [];
        let text = value;
        let blankId = 0;
        let offset = 0;

        while ((match = regex.exec(value)) !== null) {
          const word = match[1];
          const position = match.index - offset;
          foundBlanks.push({ id: blankId++, word, position });
          text = text.substring(0, match.index - offset) + text.substring(match.index - offset + match[0].length);
          offset += match[0].length;
        }

        setBaseText(text);
        setBlanks(foundBlanks);
        setBlankCounter(blankId > 0 ? blankId : 0);
      }
      isInitialized.current = true;
    }
  }, [value]);

  // Update output when base text or blanks change (internal updates only)
  useEffect(() => {
    if (!isInitialized.current || isInternalUpdate.current) {
      return; // Skip during initialization or external updates
    }

    if (!baseText) {
      if (value !== '') {
        isInternalUpdate.current = true;
        onChange('');
        isInternalUpdate.current = false;
      }
      return;
    }

    // Build output by inserting blanks at their positions
    let output = baseText;
    const sortedBlanks = [...blanks].sort((a, b) => b.position - a.position); // Sort reverse to maintain positions
    
    sortedBlanks.forEach(blank => {
      if (blank.word.trim()) {
        // Insert blank at position
        const before = output.substring(0, blank.position);
        const after = output.substring(blank.position);
        output = before + `*${blank.word.trim()}*` + after;
      }
    });

    // Only call onChange if output is different to prevent loops
    if (output !== value) {
      isInternalUpdate.current = true;
      onChange(output);
      isInternalUpdate.current = false;
    }
  }, [baseText, blanks]); // Removed onChange from dependencies

  // Add new blank
  const handleAddBlank = () => {
    const newBlank = { 
      id: blankCounter, 
      word: '', 
      position: baseText.length // Default to end of text
    };
    setBlanks([...blanks, newBlank]);
    setBlankCounter(blankCounter + 1);
  };

  // Update blank word
  const handleUpdateBlank = (id: number, word: string) => {
    setBlanks(blanks.map(blank => 
      blank.id === id ? { ...blank, word } : blank
    ));
  };

  // Update blank position
  const handleUpdatePosition = (id: number, position: number) => {
    setBlanks(blanks.map(blank => 
      blank.id === id ? { ...blank, position: Math.max(0, Math.min(position, baseText.length)) } : blank
    ));
  };

  // Remove blank
  const handleRemoveBlank = (id: number) => {
    setBlanks(blanks.filter(blank => blank.id !== id));
  };


  // State for drag and drop in preview
  const [draggedBlankId, setDraggedBlankId] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Get position from mouse event (drag or click) - simplified version
  const getPositionFromEvent = (e: React.MouseEvent<HTMLDivElement> | React.DragEvent<HTMLDivElement>) => {
    if (!previewRef.current) return null;
    
    const x = e.clientX;
    const y = e.clientY;
    
    try {
      // Use caretRangeFromPoint to get the click position
      const range = document.caretRangeFromPoint?.(x, y);
      if (!range || !previewRef.current.contains(range.commonAncestorContainer)) {
        return null;
      }
      
      // Build preview structure to calculate position
      const parts: Array<{ type: 'text' | 'blank'; content: string; blankId?: number }> = [];
      const sortedBlanks = [...blanks]
        .filter(b => b.word.trim())
        .sort((a, b) => a.position - b.position);
      
      let lastIndex = 0;
      sortedBlanks.forEach(blank => {
        if (blank.position > lastIndex) {
          parts.push({ type: 'text', content: baseText.substring(lastIndex, blank.position) });
        }
        parts.push({ type: 'blank', content: blank.word.trim(), blankId: blank.id });
        lastIndex = blank.position;
      });
      
      if (lastIndex < baseText.length) {
        parts.push({ type: 'text', content: baseText.substring(lastIndex) });
      }
      
      // Calculate position in preview text
      const previewRange = document.createRange();
      previewRange.selectNodeContents(previewRef.current);
      previewRange.setEnd(range.startContainer, range.startOffset);
      const previewPos = previewRange.toString().length;
      
      // Convert preview position to base text position
      let basePos = 0;
      let accumulatedPreviewLength = 0;
      
      for (const part of parts) {
        const partLength = part.type === 'blank' 
          ? `[${part.content}] `.length 
          : part.content.length;
        
        if (previewPos <= accumulatedPreviewLength + partLength) {
          // Click is within this part
          if (part.type === 'blank') {
            // Clicking on a blank, return its position
            return blanks.find(b => b.id === part.blankId)?.position ?? null;
          } else {
            // Clicking on text, calculate relative position
            const relativePos = previewPos - accumulatedPreviewLength;
            return basePos + relativePos;
          }
        }
        
        accumulatedPreviewLength += partLength;
        if (part.type === 'text') {
          basePos += part.content.length;
        }
      }
      
      // If click is at the end
      return Math.min(basePos, baseText.length);
    } catch (err) {
      console.error('Error calculating position:', err);
      return null;
    }
  };

  // Handle drag start from blank
  const handleDragStart = (e: React.DragEvent, blankId: number) => {
    setDraggedBlankId(blankId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
  };

  // Handle drag over preview
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (draggedBlankId === null) return;
    
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    const pos = getPositionFromEvent(e);
    if (pos !== null) {
      setDropPosition(pos);
    }
  };

  // Handle drop in preview
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (draggedBlankId === null) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const pos = getPositionFromEvent(e);
    if (pos !== null) {
      setBlanks(blanks.map(blank => 
        blank.id === draggedBlankId ? { ...blank, position: pos } : blank
      ));
    }
    
    setDraggedBlankId(null);
    setDropPosition(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedBlankId(null);
    setDropPosition(null);
  };

  // Build preview with clickable text
  const buildPreview = () => {
    if (!baseText) return <span className="text-gray-400">اكتب النص أولاً</span>;
    
    const parts: Array<{ type: 'text' | 'blank'; content: string; blankId?: number }> = [];
    const sortedBlanks = [...blanks]
      .filter(b => b.word.trim())
      .sort((a, b) => a.position - b.position);
    
    let lastIndex = 0;
    sortedBlanks.forEach(blank => {
      if (blank.position > lastIndex) {
        parts.push({ type: 'text', content: baseText.substring(lastIndex, blank.position) });
      }
      parts.push({ type: 'blank', content: blank.word.trim(), blankId: blank.id });
      lastIndex = blank.position;
    });
    
    if (lastIndex < baseText.length) {
      parts.push({ type: 'text', content: baseText.substring(lastIndex) });
    } else {
      if (sortedBlanks.length === 0) {
        parts.push({ type: 'text', content: baseText });
      }
    }

    return parts.map((part, idx) => {
      if (part.type === 'blank') {
        const isDragging = draggedBlankId === part.blankId;
        const isDropTarget = dropPosition !== null && blanks.find(b => b.id === part.blankId)?.position === dropPosition;
        return (
          <button
            key={idx}
            type="button"
            draggable
            data-blank-id={part.blankId}
            onDragStart={(e) => handleDragStart(e, part.blankId!)}
            onDragEnd={handleDragEnd}
            className={`bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded font-bold text-purple-800 dark:text-purple-200 mx-1 hover:bg-purple-300 dark:hover:bg-purple-700 transition-colors cursor-grab active:cursor-grabbing ${
              isDragging ? 'opacity-50 scale-95' : ''
            } ${isDropTarget ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
            title="اسحب لتغيير موضع هذا الفراغ"
          >
            [{part.content}]
          </button>
        );
      }
      // Check if drop position is at the end of this text part
      let showDropIndicator = false;
      if (dropPosition !== null && draggedBlankId !== null && part.type === 'text') {
        // Calculate position of this text part in base text
        let partStartInBase = 0;
        for (let i = 0; i < idx; i++) {
          if (parts[i].type === 'text') {
            partStartInBase += parts[i].content.length;
          }
        }
        
        const partEndInBase = partStartInBase + part.content.length;
        
        // Show indicator if drop position is at the end of this part
        if (dropPosition >= partStartInBase && dropPosition <= partEndInBase) {
          showDropIndicator = true;
        }
      }

      return (
        <span 
          key={idx} 
          className={`text-gray-900 dark:text-white relative inline-block transition-colors ${
            showDropIndicator ? 'bg-blue-200 dark:bg-blue-800' : ''
          }`}
        >
          {part.content}
          {/* Show drop indicator line */}
          {showDropIndicator && dropPosition !== null && (
            <span 
              className="absolute -right-0.5 top-0 bottom-0 w-0.5 bg-blue-500 z-10"
              style={{
                right: dropPosition === 0 ? 'auto' : `${((part.content.length - (dropPosition - (parts.slice(0, idx).reduce((acc, p) => acc + (p.type === 'text' ? p.content.length : 0), 0)))) / part.content.length) * 100}%`
              }}
            />
          )}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Instructions */}
      <Alert className="bg-blue-50 dark:bg-blue-900/20 shadow-md">
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>كيفية الاستخدام:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>اكتب النص الكامل في المربع أدناه</li>
            <li>اضغط على زر "إضافة فراغ" لإضافة فراغ جديد</li>
            <li>اكتب الكلمة الصحيحة للفراغ (بدون *)</li>
            <li>حدد موضع الفراغ في النص باستخدام رقم الموضع (0 = بداية النص، {baseText.length || 'N'} = نهاية النص)</li>
            <li>ستظهر معاينة لكيفية ظهور النص للطلاب</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Base Text Input */}
      <div className="space-y-2">
        <Label htmlFor="fill-blanks-base-text" className="text-lg font-bold">
          النص الكامل *
        </Label>
        <Textarea
          id="fill-blanks-base-text"
          value={baseText}
          onChange={(e) => setBaseText(e.target.value)}
          placeholder="اكتب النص الكامل هنا، ثم أضف الفراغات باستخدام الأزرار أدناه"
          className="min-h-[150px] text-lg rounded-xl focus:ring-2 focus:ring-primary shadow-sm"
          dir="rtl"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          مثال: بنت شاطرة في المدرسة، ولد شاطر في البيت
        </p>
      </div>


      {/* Add Blank Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          type="button"
          onClick={handleAddBlank}
          variant="outline"
          className="w-full md:w-auto shadow-sm hover:shadow-md text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <Plus className="w-5 h-5 ml-2" />
          إضافة فراغ جديد
        </Button>
      </motion.div>

      {/* Blanks List */}
      {blanks.length > 0 && (
        <div className="space-y-3">
          <Label className="text-lg font-bold">
            الفراغات ({blanks.filter(b => b.word.trim()).length} / {blanks.length})
          </Label>
          <div className="space-y-3">
            {blanks.map((blank) => (
              <motion.div
                key={blank.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 flex-wrap p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <Badge variant="secondary" className="text-base px-3 py-1 shrink-0">
                  فراغ {blank.id + 1}
                </Badge>
                
                <div className="flex-1 min-w-[200px]">
                  <Input
                    value={blank.word}
                    onChange={(e) => handleUpdateBlank(blank.id, e.target.value)}
                    placeholder="اكتب الكلمة الصحيحة للفراغ (بدون *)"
                    className="text-lg rounded-xl focus:ring-2 focus:ring-primary shadow-sm bg-white dark:bg-slate-700"
                    dir="rtl"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">الموضع في النص:</Label>
                  <Input
                    type="number"
                    value={blank.position}
                    onChange={(e) => handleUpdatePosition(blank.id, parseInt(e.target.value) || 0)}
                    min={0}
                    max={baseText.length}
                    className="w-24 text-center rounded-xl focus:ring-2 focus:ring-primary shadow-sm bg-white dark:bg-slate-700"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">من {baseText.length}</span>
                  <span className="text-xs text-gray-400">(0 = بداية النص)</span>
                </div>
                
                <Button
                  type="button"
                  onClick={() => handleRemoveBlank(blank.id)}
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                  title="حذف الفراغ"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {baseText && (
        <div className="space-y-3">
          <Label className="text-lg font-bold text-gray-900 dark:text-white">
            معاينة النص للطلاب:
          </Label>
          <div 
            ref={previewRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={() => setDropPosition(null)}
            className={`text-xl leading-relaxed p-6 bg-gray-50 dark:bg-gray-900 rounded-xl min-h-[100px] shadow-sm ${
              draggedBlankId !== null ? 'ring-2 ring-blue-300 dark:ring-blue-700 ring-dashed' : ''
            }`}
            dir="rtl"
          >
            {blanks.filter(b => b.word.trim()).length > 0 ? (
              buildPreview()
            ) : (
              <span className="text-gray-500">أضف فراغات لرؤية المعاينة</span>
            )}
          </div>
          {draggedBlankId !== null && (
            <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
              💡 اسحب الفراغ وأسقطه في المكان المطلوب في النص أعلاه
            </div>
          )}
        </div>
      )}
    </div>
  );
}

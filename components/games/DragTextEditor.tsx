'use client';

import { useState, useEffect, useRef } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Plus, X, GripVertical } from 'lucide-react';

interface DragTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface DraggableWord {
  id: string;
  word: string;
  position: number | null; // Position in text where word should be placed (character index)
}

// Draggable Word Component
function DraggableWordItem({ word, onRemove, onUpdate }: { 
  word: DraggableWord; 
  onRemove: (id: string) => void;
  onUpdate: (id: string, newWord: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: word.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: isDragging ? 0.95 : 1 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-grab active:cursor-grabbing ${
        word.position !== null
          ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-600'
          : 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-700'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>
      <Input
        value={word.word}
        onChange={(e) => onUpdate(word.id, e.target.value)}
        className="h-8 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm border-0 bg-transparent"
        dir="rtl"
        style={{ width: `${Math.max(word.word.length * 10, 80)}px` }}
        onClick={(e) => e.stopPropagation()}
      />
      {word.position !== null && (
        <span className="text-xs text-blue-600 dark:text-blue-400">✓</span>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onRemove(word.id)}
        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </motion.div>
  );
}

// Droppable Text Area Component
function DroppableTextArea({ 
  text, 
  words, 
  onDrop, 
  hoveredPosition,
  isDragging,
  activeWordId
}: { 
  text: string; 
  words: DraggableWord[];
  onDrop: (position: number) => void;
  hoveredPosition: number | null;
  isDragging: boolean;
  activeWordId: string | null;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: 'text-area',
  });

  // Build display text with placed words
  const buildDisplayText = () => {
    if (!text) return [];

    const sortedWords = [...words]
      .filter(w => w.position !== null)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    const parts: Array<{ type: 'text' | 'word'; content: string; wordId?: string; startPos?: number }> = [];
    let lastIndex = 0;

    for (const word of sortedWords) {
      if (word.position !== null && word.position >= lastIndex) {
        if (word.position > lastIndex) {
          parts.push({
            type: 'text',
            content: text.substring(lastIndex, word.position),
            startPos: lastIndex
          });
        }
        parts.push({
          type: 'word',
          content: word.word,
          wordId: word.id,
          startPos: word.position
        });
        lastIndex = word.position;
      }
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
        startPos: lastIndex
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text' as const, content: text, startPos: 0 }];
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!textRef.current || !isDragging) return;
    
    const range = document.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (range && textRef.current.contains(range.commonAncestorContainer)) {
      // Map position from displayed text to base text
      const parts = buildDisplayText();
      let displayPos = 0;
      let basePos = 0;
      
      // Calculate display position
      const textRange = document.createRange();
      textRange.selectNodeContents(textRef.current);
      textRange.setEnd(range.endContainer, range.endOffset);
      const displayPosition = textRange.toString().length;
      
      // Map to base text position
      for (const part of parts) {
        const partLength = part.content.length;
        if (displayPos + partLength >= displayPosition) {
          // Position is in this part
          if (part.type === 'text') {
            basePos = (part.startPos || 0) + (displayPosition - displayPos);
          } else {
            // If over a word, place after it
            basePos = (part.startPos || 0) + partLength;
          }
          break;
        }
        displayPos += partLength;
        if (part.type === 'text') {
          basePos += partLength;
        } else {
          // Skip word in base text calculation
        }
      }
      
      onDrop(Math.min(Math.max(0, basePos), text.length));
    }
  };

  const parts = buildDisplayText();

  return (
    <div
      id="droppable-text-area"
      ref={(node) => {
        textRef.current = node;
        setNodeRef(node);
      }}
      onMouseMove={handleMouseMove}
      className={`p-6 bg-gray-50 dark:bg-gray-900 rounded-xl min-h-[150px] text-lg leading-relaxed text-right border-2 transition-all ${
        isOver
          ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-300 dark:ring-indigo-700'
          : 'border-indigo-200 dark:border-indigo-800'
      }`}
      dir="rtl"
    >
      {parts.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          {parts.map((part, idx) => {
            if (part.type === 'text') {
              // Show cursor indicator at hovered position
              const startPos = part.startPos || 0;
              const endPos = startPos + part.content.length;
              const showCursor = hoveredPosition !== null && 
                hoveredPosition >= startPos && 
                hoveredPosition <= endPos &&
                isDragging;
              
              // Split text to show cursor
              if (showCursor && hoveredPosition !== null) {
                const cursorPosInPart = hoveredPosition - startPos;
                const beforeCursor = part.content.substring(0, cursorPosInPart);
                const afterCursor = part.content.substring(cursorPosInPart);
                
                return (
                  <span key={idx} className="text-gray-900 dark:text-white">
                    {beforeCursor}
                    <span className="inline-block w-0.5 h-5 bg-indigo-500 animate-pulse align-middle mx-0.5" />
                    {afterCursor}
                  </span>
                );
              }
              
              return (
                <span key={idx} className="text-gray-900 dark:text-white">
                  {part.content}
                </span>
              );
            } else {
              return (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-block mx-1 px-3 py-1.5 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 rounded-lg font-semibold border-2 border-blue-400 dark:border-blue-600"
                >
                  {part.content}
                </motion.span>
              );
            }
          })}
        </div>
      ) : (
        <span className="text-gray-400 dark:text-gray-500">{text}</span>
      )}
    </div>
  );
}

export default function DragTextEditor({ value, onChange }: DragTextEditorProps) {
  const [text, setText] = useState('');
  const [draggableWords, setDraggableWords] = useState<DraggableWord[]>([]);
  const [newWord, setNewWord] = useState('');
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);
  const isInternalUpdate = useRef(false);

  // Initialize from value
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    if (!value) {
      setText('');
      setDraggableWords([]);
      return;
    }

    // Parse: extract text and draggable words with their positions
    const words: DraggableWord[] = [];
    let baseText = value;
    const regex = /\*([^*]+)\*/g;
    let match;
    let wordCounter = 0;
    const matches: Array<{ word: string; position: number }> = [];

    while ((match = regex.exec(value)) !== null) {
      matches.push({
        word: match[1],
        position: match.index
      });
    }

    // Process matches in reverse to maintain positions
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i];
      const wordId = `word-${wordCounter++}`;
      
      words.push({
        id: wordId,
        word: m.word,
        position: m.position
      });

      // Remove *word* from base text
      baseText = baseText.substring(0, m.position) + baseText.substring(m.position + m[0].length);
    }

    setText(baseText);
    setDraggableWords(words.reverse());
  }, [value]);

  // Update output when text or words change
  useEffect(() => {
    if (!text) {
      if (onChange && value !== '') {
        isInternalUpdate.current = true;
        onChange('');
      }
      return;
    }

    // Build output: insert *word* markers at correct positions
    let output = text;
    const sortedWords = [...draggableWords]
      .filter(w => w.position !== null)
      .sort((a, b) => (b.position || 0) - (a.position || 0));

    for (const word of sortedWords) {
      if (word.position !== null && word.position >= 0 && word.position <= output.length) {
        const before = output.substring(0, word.position);
        const after = output.substring(word.position);
        output = before + `*${word.word}*` + after;
      }
    }

    if (onChange && output !== value) {
      isInternalUpdate.current = true;
      onChange(output);
    }
  }, [text, draggableWords, onChange, value]);

  const handleAddWord = () => {
    if (!newWord.trim()) return;
    if (draggableWords.some(w => w.word === newWord.trim())) {
      setNewWord('');
      return;
    }

    const wordId = `word-${Date.now()}`;
    const newWordObj: DraggableWord = {
      id: wordId,
      word: newWord.trim(),
      position: null
    };

    setDraggableWords([...draggableWords, newWordObj]);
    setNewWord('');
  };

  const handleRemoveWord = (wordId: string) => {
    setDraggableWords(draggableWords.filter(w => w.id !== wordId));
  };

  const handleUpdateWord = (wordId: string, newWord: string) => {
    setDraggableWords(draggableWords.map(w => 
      w.id === wordId ? { ...w, word: newWord.trim() } : w
    ));
  };

  const handleDragStart = (event: any) => {
    setActiveWordId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    const wordId = active.id as string;

    if (over && over.id === 'text-area') {
      // Use hoveredPosition if available
      let position = hoveredPosition;
      
      // If no hovered position, try to calculate from drop location
      if (position === null || position === undefined) {
        const textAreaElement = document.getElementById('droppable-text-area');
        if (textAreaElement) {
          // Try to get mouse position from the last known position
          // Since we can't reliably get it from the event, use hoveredPosition
          // or calculate from the center of the drop zone
          position = text.length; // Default to end
        }
      }
      
      // Ensure position is valid
      position = Math.max(0, Math.min(position || text.length, text.length));
      
      setDraggableWords(draggableWords.map(w => 
        w.id === wordId ? { ...w, position } : w
      ));
    }

    setActiveWordId(null);
    setHoveredPosition(null);
  };

  const handleDragOver = (event: any) => {
    if (!activeWordId || !text) return;
    
    // Only update if over the text area
    if (event.over?.id !== 'text-area') return;
    
    // Use onMouseMove from DroppableTextArea to calculate position
    // The position will be updated via hoveredPosition state
  };

  // Build preview for students
  const buildStudentPreview = () => {
    if (!text) return null;

    const sortedWords = [...draggableWords]
      .filter(w => w.position !== null)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    let displayText = text;
    for (let i = sortedWords.length - 1; i >= 0; i--) {
      const word = sortedWords[i];
      if (word.position !== null && word.position >= 0 && word.position <= displayText.length) {
        const before = displayText.substring(0, word.position);
        const after = displayText.substring(word.position);
        displayText = before + `\0WORD_${word.id}\0` + after;
      }
    }

    const parts = displayText.split(/(\0WORD_\w+\0)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('\0WORD_') && part.endsWith('\0')) {
        return {
          type: 'blank' as const,
          content: ''
        };
      }
      return {
        type: 'text' as const,
        content: part
      };
    });
  };

  const studentPreview = buildStudentPreview();
  const activeWord = activeWordId ? draggableWords.find(w => w.id === activeWordId) : null;

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="space-y-4">
        <Alert className="bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800">
          <AlertDescription className="text-sm text-indigo-900 dark:text-indigo-200">
            💡 <strong>سهل جداً:</strong> اكتب النص، أضف الكلمات القابلة للسحب، ثم اسحبها إلى أماكنها الصحيحة في النص.
          </AlertDescription>
        </Alert>

        {/* Text Input */}
        <div className="space-y-2">
          <Label className="text-lg font-bold text-gray-900 dark:text-white">
            النص الكامل *
          </Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب النص الكامل هنا..."
            rows={6}
            dir="rtl"
            className="text-lg h-12 focus:ring-2 focus:ring-indigo-500 shadow-sm rounded-lg resize-none"
          />
        </div>

        {/* Add Word */}
        <div className="space-y-2">
          <Label className="text-lg font-bold text-gray-900 dark:text-white">
            إضافة كلمة قابلة للسحب
          </Label>
          <div className="flex gap-2">
            <Input
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddWord();
                }
              }}
              placeholder="اكتب الكلمة..."
              dir="rtl"
              className="flex-1 h-12 text-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <Button
              type="button"
              onClick={handleAddWord}
              disabled={!newWord.trim()}
              className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5 ml-2" />
              إضافة
            </Button>
          </div>
        </div>

        {/* Words List */}
        {draggableWords.length > 0 && (
          <div className="space-y-2">
            <Label className="text-lg font-bold text-gray-900 dark:text-white">
              الكلمات القابلة للسحب ({draggableWords.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {draggableWords.map((word) => (
                <DraggableWordItem
                  key={word.id}
                  word={word}
                  onRemove={handleRemoveWord}
                  onUpdate={handleUpdateWord}
                />
              ))}
            </div>
          </div>
        )}

        {/* Text with Drop Zones */}
        {text && (
          <div className="space-y-3">
            <Label className="text-lg font-bold text-gray-900 dark:text-white">
              اسحب الكلمات إلى أماكنها الصحيحة في النص
            </Label>
            <DroppableTextArea
              text={text}
              words={draggableWords}
              onDrop={setHoveredPosition}
              hoveredPosition={hoveredPosition}
              isDragging={activeWordId !== null}
              activeWordId={activeWordId}
            />
          </div>
        )}

        {/* Student Preview */}
        {text && draggableWords.some(w => w.position !== null) && (
          <div className="space-y-3">
            <Label className="text-lg font-bold text-gray-900 dark:text-white">
              معاينة النص للطلاب:
            </Label>
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl min-h-[100px] text-lg leading-relaxed text-right border border-indigo-200 dark:border-indigo-800" dir="rtl">
              {studentPreview ? (
                studentPreview.map((part, idx) => {
                  if (part.type === 'text') {
                    return <span key={idx} className="text-gray-900 dark:text-white">{part.content}</span>;
                  } else {
                    return (
                      <span
                        key={idx}
                        className="inline-block mx-1 px-3 py-1.5 bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-lg font-semibold border-2 border-dashed border-indigo-400 dark:border-indigo-600 min-w-[100px] text-center"
                      >
                        ___
                      </span>
                    );
                  }
                })
              ) : (
                <span className="text-gray-400 dark:text-gray-500">أضف كلمات قابلة للسحب</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeWord ? (
          <div className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-lg border-2 border-indigo-600">
            {activeWord.word}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

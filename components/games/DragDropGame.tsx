'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  Active,
  Over,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, CheckCircle2, XCircle } from 'lucide-react';
import { useGameSounds } from '@/hooks/useGameSounds';

export type DragDropGameType = 
  | 'matching' // Match items with their pairs
  | 'ordering' // Order items in correct sequence
  | 'sorting'; // Sort items into categories

export interface DragDropItem {
  id: string;
  content: string;
  correctMatch?: string; // For matching games
  correctOrder?: number; // For ordering games
  category?: string; // For sorting games
}

export interface DragDropGameProps {
  /**
   * Type of drag and drop game
   */
  type: DragDropGameType;
  
  /**
   * Items to drag
   */
  items: DragDropItem[];
  
  /**
   * Correct answers/matches/order
   */
  correctAnswers?: Record<string, string | number>;
  
  /**
   * Callback when answer is checked
   */
  onCheck?: (isCorrect: boolean, result: Record<string, string | number>) => void;
  
  /**
   * Callback when game is completed correctly
   */
  onComplete?: () => void;
  
  /**
   * Whether to show feedback immediately
   * Default: false
   */
  showFeedback?: boolean;
  
  /**
   * Whether sounds are enabled
   * Default: true
   */
  playSounds?: boolean;
  
  /**
   * Whether items are disabled (after completion)
   * Default: false
   */
  disabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

interface SortableItemProps {
  id: string;
  item: DragDropItem;
  isDragging?: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
}

function SortableItem({ id, item, isDragging, isCorrect, isIncorrect }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isDragging || isSortableDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging || isSortableDragging ? 0.95 : 1,
      }}
      whileHover={!isCorrect && !isIncorrect ? { scale: 1.05 } : {}}
      className={`
        flex items-center gap-3 p-4 rounded-lg border-2 bg-white dark:bg-slate-800
        ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
        ${isIncorrect ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
        ${!isCorrect && !isIncorrect ? 'border-gray-300 dark:border-slate-600 hover:border-primary cursor-move' : 'cursor-default'}
        ${isDragging || isSortableDragging ? 'shadow-lg' : 'shadow-sm'}
        transition-all duration-200
      `}
      dir="rtl"
    >
      <div
        {...attributes}
        {...listeners}
        className={`flex items-center ${isCorrect || isIncorrect ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <GripVertical
          className={`w-5 h-5 ${
            isCorrect || isIncorrect
              ? 'text-gray-400'
              : 'text-gray-500 hover:text-primary'
          }`}
        />
      </div>
      <div className="flex-1">
        <p className="text-gray-900 dark:text-gray-100 font-medium">{item.content}</p>
      </div>
      {isCorrect && (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      )}
      {isIncorrect && (
        <XCircle className="w-5 h-5 text-red-500" />
      )}
    </motion.div>
  );
}

/**
 * DragDropGame Component
 * 
 * A versatile drag and drop game component supporting:
 * - Matching: Match items with their pairs
 * - Ordering: Order items in correct sequence
 * - Sorting: Sort items into categories
 */
export function DragDropGame({
  type,
  items,
  correctAnswers,
  onCheck,
  onComplete,
  showFeedback = false,
  playSounds = true,
  disabled = false,
  className = '',
}: DragDropGameProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [order, setOrder] = useState<DragDropItem[]>(items);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect'>>({});
  
  const sounds = useGameSounds({ enabled: playSounds });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find active item
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return items.find((item) => item.id === activeId);
  }, [activeId, items]);

  // Handle drag start
  function handleDragStart(event: DragStartEvent) {
    if (disabled) return;
    setActiveId(event.active.id as string);
  }

  // Handle drag end
  function handleDragEnd(event: DragEndEvent) {
    if (disabled) return;
    
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (type === 'ordering') {
      const oldIndex = order.findIndex((item) => item.id === active.id);
      const newIndex = order.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(order, oldIndex, newIndex);
        setOrder(newOrder);

        if (showFeedback) {
          checkOrder(newOrder);
        }
      }
    } else if (type === 'matching') {
      // Handle matching logic
      const itemId = active.id as string;
      const matchId = over.id as string;
      
      setMatches((prev) => ({
        ...prev,
        [itemId]: matchId,
      }));

      if (showFeedback) {
        checkMatch(itemId, matchId);
      }
    } else if (type === 'sorting') {
      // Handle sorting logic
      const itemId = active.id as string;
      const categoryId = over.id as string;
      
      setMatches((prev) => ({
        ...prev,
        [itemId]: categoryId,
      }));

      if (showFeedback) {
        checkSort(itemId, categoryId);
      }
    }
  }

  // Check ordering
  function checkOrder(currentOrder: DragDropItem[]) {
    const result: Record<string, number> = {};
    let allCorrect = true;

    currentOrder.forEach((item, index) => {
      result[item.id] = index;
      const isCorrect = item.correctOrder === index;
      
      if (!isCorrect) allCorrect = false;
      
      setFeedback((prev) => ({
        ...prev,
        [item.id]: isCorrect ? 'correct' : 'incorrect',
      }));
    });

    if (allCorrect) {
      sounds.playCorrect();
      if (onComplete) onComplete();
    } else {
      sounds.playIncorrect();
    }

    if (onCheck) {
      onCheck(allCorrect, result);
    }

    setChecked(true);
  }

  // Check matching
  function checkMatch(itemId: string, matchId: string) {
    const item = items.find((i) => i.id === itemId);
    const isCorrect = item?.correctMatch === matchId;

    setFeedback((prev) => ({
      ...prev,
      [itemId]: isCorrect ? 'correct' : 'incorrect',
    }));

    if (isCorrect) {
      sounds.playCorrect();
    } else {
      sounds.playIncorrect();
    }

    if (onCheck) {
      onCheck(isCorrect, { [itemId]: matchId });
    }
  }

  // Check sorting
  function checkSort(itemId: string, categoryId: string) {
    const item = items.find((i) => i.id === itemId);
    const isCorrect = item?.category === categoryId;

    setFeedback((prev) => ({
      ...prev,
      [itemId]: isCorrect ? 'correct' : 'incorrect',
    }));

    if (isCorrect) {
      sounds.playCorrect();
    } else {
      sounds.playIncorrect();
    }

    if (onCheck) {
      onCheck(isCorrect, { [itemId]: categoryId });
    }
  }

  // Manual check function
  function handleCheck() {
    if (checked) return;

    if (type === 'ordering') {
      checkOrder(order);
    } else if (type === 'matching') {
      // Check all matches
      let allCorrect = true;
      items.forEach((item) => {
        const matchId = matches[item.id];
        if (matchId && item.correctMatch === matchId) {
          setFeedback((prev) => ({
            ...prev,
            [item.id]: 'correct',
          }));
        } else {
          allCorrect = false;
          if (matchId) {
            setFeedback((prev) => ({
              ...prev,
              [item.id]: 'incorrect',
            }));
          }
        }
      });

      if (allCorrect) {
        sounds.playCorrect();
        if (onComplete) onComplete();
      } else {
        sounds.playIncorrect();
      }

      if (onCheck) {
        onCheck(allCorrect, matches);
      }
    } else if (type === 'sorting') {
      // Check all sorts
      let allCorrect = true;
      items.forEach((item) => {
        const categoryId = matches[item.id];
        if (categoryId && item.category === categoryId) {
          setFeedback((prev) => ({
            ...prev,
            [item.id]: 'correct',
          }));
        } else {
          allCorrect = false;
          if (categoryId) {
            setFeedback((prev) => ({
              ...prev,
              [item.id]: 'incorrect',
            }));
          }
        }
      });

      if (allCorrect) {
        sounds.playCorrect();
        if (onComplete) onComplete();
      } else {
        sounds.playIncorrect();
      }

      if (onCheck) {
        onCheck(allCorrect, matches);
      }
    }

    setChecked(true);
  }

  return (
    <div className={`w-full ${className}`} dir="rtl">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={order.map((item) => item.id)}
          strategy={type === 'ordering' ? verticalListSortingStrategy : horizontalListSortingStrategy}
        >
          <div className="space-y-3">
            {order.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                item={item}
                isDragging={activeId === item.id}
                isCorrect={feedback[item.id] === 'correct'}
                isIncorrect={feedback[item.id] === 'incorrect'}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeItem ? (
            <div className="p-4 rounded-lg border-2 border-primary bg-white dark:bg-slate-800 shadow-lg opacity-90">
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {activeItem.content}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {!showFeedback && !checked && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleCheck}
          className="mt-6 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          تحقق من الإجابة
        </motion.button>
      )}
    </div>
  );
}


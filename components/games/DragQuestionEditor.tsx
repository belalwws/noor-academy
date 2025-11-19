'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

interface DragQuestionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface DraggableItem {
  id: string;
  text: string;
  dropZoneId: string | null;
}

interface DropZone {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Draggable Item Component
function DraggableItemComponent({ 
  item, 
  onRemove, 
  onUpdate 
}: { 
  item: DraggableItem; 
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700 hover:shadow-md transition-all">
      <Input
        value={item.text}
        onChange={(e) => onUpdate(item.id, e.target.value)}
        className="h-8 text-sm focus:ring-2 focus:ring-purple-500 shadow-sm border-0 bg-transparent"
        dir="rtl"
        placeholder="نص العنصر"
        style={{ width: `${Math.max(item.text.length * 10, 150)}px` }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onRemove(item.id)}
        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// Drop Zone Component
function DropZoneComponent({ 
  zone, 
  assignedItems,
  onRemove,
  onUpdate,
  onRemoveItemFromZone,
  onAssignItem,
  allItems,
  zoneIndex,
  useGrid = false
}: { 
  zone: DropZone;
  assignedItems: DraggableItem[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<DropZone>) => void;
  onRemoveItemFromZone: (itemId: string) => void;
  onAssignItem: (zoneId: string, itemId: string) => void;
  allItems: DraggableItem[];
  zoneIndex: number;
  useGrid?: boolean;
}) {
  const style = useGrid ? {
    minHeight: '150px',
    width: '100%',
    position: 'relative' as const,
  } : {
    left: `${zone.x}%`,
    top: `${zone.y}%`,
    width: `${zone.width}%`,
    height: `${zone.height}%`,
    minWidth: '150px',
    minHeight: '100px',
    position: 'absolute' as const,
    zIndex: 10 + zoneIndex,
  };

  // Get available items (not assigned to any zone)
  const availableItems = allItems.filter(item => !item.dropZoneId);

  return (
    <div
      className={`rounded-lg border-2 transition-all border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 ${
        useGrid ? 'relative' : 'absolute'
      }`}
      data-zone-id={zone.id}
      style={style}
    >
      <div className="p-2 h-full flex flex-col relative">
        <div className="flex items-center justify-between mb-2">
          <Input
            value={zone.label}
            onChange={(e) => onUpdate(zone.id, { label: e.target.value })}
            className="h-6 text-xs font-bold border-0 bg-transparent p-0 focus:ring-0 flex-1"
            dir="rtl"
            placeholder="تسمية المنطقة"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(zone.id)}
            className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        
        {/* Select dropdown to add items */}
        <div className="mb-2">
          {availableItems.length > 0 ? (
            <Select
              value=""
              onValueChange={(itemId) => {
                if (itemId) {
                  onAssignItem(zone.id, itemId);
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="اختر عنصر لإضافته" />
              </SelectTrigger>
              <SelectContent>
                {availableItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.text || 'عنصر فارغ'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-8 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md px-3">
              لا توجد عناصر متاحة
            </div>
          )}
        </div>

        {/* Display assigned items */}
        <div className="flex-1 flex flex-wrap gap-1 items-center justify-start p-1 overflow-auto min-h-[80px]">
          {assignedItems.length > 0 ? (
            assignedItems.map((item) => (
              <div
                key={item.id}
                className="px-2 py-1 bg-purple-200 dark:bg-purple-800 rounded text-xs font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-1"
              >
                <span>{item.text || 'عنصر فارغ'}</span>
                <button
                  type="button"
                  onClick={() => onRemoveItemFromZone(item.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                  title="إزالة من المنطقة"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-400 dark:text-gray-500 w-full text-center">
              اختر عنصر من القائمة أعلاه
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DragQuestionEditor({ value, onChange }: DragQuestionEditorProps) {
  const [question, setQuestion] = useState('');
  const [draggableItems, setDraggableItems] = useState<DraggableItem[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Initialize from value
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    if (!value) {
      setQuestion('');
      setDraggableItems([]);
      setDropZones([]);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setQuestion(parsed.question || '');
      
      const newItems: DraggableItem[] = (parsed.items || []).map((item: any, idx: number) => ({
        id: item.id || `item-${Date.now()}-${idx}`,
        text: item.text || '',
        dropZoneId: item.dropZoneId || null,
      }));
      setDraggableItems(newItems);

      // ALWAYS recalculate grid positions - ignore saved positions
      const cols = 2;
      const zoneWidth = 47; // Width per zone (percentage)
      const zoneHeight = 25; // Height per zone (percentage)
      const spacing = 3; // Spacing between zones (percentage)
      const startX = 1.5;
      const startY = 2;

      // Remove duplicates first
      const uniqueZones = (parsed.dropZones || []).filter((zone: any, idx: number, self: any[]) => 
        idx === self.findIndex((z: any) => z.id === zone.id)
      );

      const newZones: DropZone[] = uniqueZones.map((zone: any, idx: number) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const x = startX + (col * (zoneWidth + spacing));
        const y = startY + (row * (zoneHeight + spacing));
        return {
          id: zone.id || `zone-${Date.now()}-${idx}`,
          label: zone.label || `منطقة ${idx + 1}`, // Preserve label if exists
          x: Math.round(x * 100) / 100, // Round to 2 decimal places
          y: Math.round(y * 100) / 100,
          width: zoneWidth,
          height: zoneHeight,
        };
      });
      
      setDropZones(newZones);
    } catch (e) {
      console.error('❌ Error parsing value:', e);
      setQuestion('');
      setDraggableItems([]);
      setDropZones([]);
    }
  }, [value]);

  // Force reorder zones on mount and when zones change
  useEffect(() => {
    if (dropZones.length > 0) {
      const cols = 2;
      const zoneWidth = 47; // Width per zone (percentage)
      const zoneHeight = 25; // Height per zone (percentage)
      const spacing = 3; // Spacing between zones (percentage)
      const startX = 1.5;
      const startY = 2;

      // Always recalculate to ensure no overlap
      const recalculatedZones = dropZones.map((zone, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const x = startX + (col * (zoneWidth + spacing));
        const y = startY + (row * (zoneHeight + spacing));
        return {
          ...zone,
          label: zone.label || `منطقة ${idx + 1}`, // Preserve label if exists
          x: Math.round(x * 100) / 100, // Round to 2 decimal places
          y: Math.round(y * 100) / 100,
          width: zoneWidth,
          height: zoneHeight,
        };
      });

      // Check if any zone position changed
      const hasChanges = recalculatedZones.some((newZone, idx) => {
        const oldZone = dropZones[idx];
        return !oldZone || 
               Math.abs(oldZone.x - newZone.x) > 0.01 || 
               Math.abs(oldZone.y - newZone.y) > 0.01 ||
               oldZone.width !== newZone.width ||
               oldZone.height !== newZone.height;
      });

      if (hasChanges) {
        setDropZones(recalculatedZones);
      }
    }
  }, [dropZones.length]); // Only depend on length to avoid infinite loop

  // Update output when data changes
  useEffect(() => {
    if (isInternalUpdate.current) {
      return;
    }

    if (!question && draggableItems.length === 0 && dropZones.length === 0) {
      if (onChange && value !== '') {
        isInternalUpdate.current = true;
        onChange('');
        setTimeout(() => {
          isInternalUpdate.current = false;
        }, 0);
      }
      return;
    }

    const output = JSON.stringify({
      question,
      items: draggableItems,
      dropZones,
    }, null, 2);

    if (onChange && output !== value) {
      isInternalUpdate.current = true;
      onChange(output);
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    }
  }, [question, draggableItems, dropZones, value, onChange]);

  const handleAddItem = () => {
    const newItem: DraggableItem = {
      id: `item-${Date.now()}`,
      text: '',
      dropZoneId: null,
    };
    setDraggableItems([...draggableItems, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setDraggableItems(draggableItems.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, text: string) => {
    setDraggableItems(draggableItems.map(item => 
      item.id === id ? { ...item, text } : item
    ));
  };

  const handleAddDropZone = () => {
    const cols = 2;
    const zoneWidth = 47; // Width per zone (percentage)
    const zoneHeight = 25; // Height per zone (percentage)
    const spacing = 3; // Spacing between zones (percentage)
    const startX = 1.5;
    const startY = 2;

    // Remove duplicates first
    const uniqueZones = dropZones.filter((zone, index, self) => 
      index === self.findIndex(z => z.id === zone.id)
    );

    // Recalculate ALL zones to ensure proper grid (no overlapping)
    const recalculatedZones = uniqueZones.map((zone, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const x = startX + (col * (zoneWidth + spacing));
      const y = startY + (row * (zoneHeight + spacing));
      return {
        ...zone,
        label: zone.label || `منطقة ${idx + 1}`,
        x: Math.round(x * 100) / 100, // Round to 2 decimal places
        y: Math.round(y * 100) / 100,
        width: zoneWidth,
        height: zoneHeight,
      };
    });

    // Add new zone at the end
    const newRow = Math.floor(recalculatedZones.length / cols);
    const newCol = recalculatedZones.length % cols;
    const newX = startX + (newCol * (zoneWidth + spacing));
    const newY = startY + (newRow * (zoneHeight + spacing));
    
    const newZone: DropZone = {
      id: `zone-${Date.now()}`,
      label: `منطقة ${recalculatedZones.length + 1}`,
      x: Math.round(newX * 100) / 100,
      y: Math.round(newY * 100) / 100,
      width: zoneWidth,
      height: zoneHeight,
    };

    // Update all zones at once
    setDropZones([...recalculatedZones, newZone]);

    setTimeout(() => {
      if (containerRef.current) {
        const zoneElement = containerRef.current.querySelector(`[data-zone-id="${newZone.id}"]`) as HTMLElement;
        if (zoneElement) {
          zoneElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  };

  const handleRemoveDropZone = (id: string) => {
    setDraggableItems(draggableItems.map(item => 
      item.dropZoneId === id ? { ...item, dropZoneId: null } : item
    ));
    
    const updatedZones = dropZones.filter(zone => zone.id !== id);
    const cols = 2;
    const zoneWidth = 47; // Width per zone (percentage)
    const zoneHeight = 25; // Height per zone (percentage)
    const spacing = 3; // Spacing between zones (percentage)
    const startX = 1.5;
    const startY = 2;

    const recalculatedZones = updatedZones.map((zone, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const x = startX + (col * (zoneWidth + spacing));
      const y = startY + (row * (zoneHeight + spacing));
      return {
        ...zone,
        label: zone.label || `منطقة ${idx + 1}`, // Preserve label if exists
        x: Math.round(x * 100) / 100, // Round to 2 decimal places
        y: Math.round(y * 100) / 100,
        width: zoneWidth,
        height: zoneHeight,
      };
    });

    setDropZones(recalculatedZones);
  };

  const handleClearAllZones = () => {
    setDraggableItems(draggableItems.map(item => ({ ...item, dropZoneId: null })));
    setDropZones([]);
  };

  const handleReorderZones = () => {
    const cols = 2;
    const zoneWidth = 47; // Width per zone (percentage)
    const zoneHeight = 25; // Height per zone (percentage)
    const spacing = 3; // Spacing between zones (percentage)
    const startX = 1.5;
    const startY = 2;

    const recalculatedZones = dropZones.map((zone, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const x = startX + (col * (zoneWidth + spacing));
      const y = startY + (row * (zoneHeight + spacing));
      return {
        ...zone,
        label: zone.label || `منطقة ${idx + 1}`, // Preserve label if exists
        x: Math.round(x * 100) / 100, // Round to 2 decimal places
        y: Math.round(y * 100) / 100,
        width: zoneWidth,
        height: zoneHeight,
      };
    });

    setDropZones(recalculatedZones);
  };

  const handleUpdateDropZone = (id: string, updates: Partial<DropZone>) => {
    setDropZones(dropZones.map(zone => 
      zone.id === id ? { ...zone, ...updates } : zone
    ));
  };

  const handleRemoveItemFromZone = (itemId: string) => {
    setDraggableItems(draggableItems.map(item => 
      item.id === itemId ? { ...item, dropZoneId: null } : item
    ));
  };

  const handleAssignItem = (zoneId: string, itemId: string) => {
    setDraggableItems(draggableItems.map(item => 
      item.id === itemId ? { ...item, dropZoneId: zoneId } : item
    ));
  };

  // Calculate container height based on actual zones
  const calculateContainerHeight = () => {
    if (dropZones.length === 0) return '100%';
    
    const cols = 2;
    const rows = Math.ceil(dropZones.length / cols);
    const zoneHeight = 25; // Match the zoneHeight used in calculations
    const spacing = 3;
    const startY = 2;
    const padding = 5;
    
    // Calculate total height needed
    const totalHeightPercent = startY + (rows * (zoneHeight + spacing)) + padding;
    return `${Math.max(100, totalHeightPercent)}%`;
  };
  
  const containerHeight = calculateContainerHeight();

  return (
    <div className="space-y-6" dir="rtl">
      <Alert className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
        <AlertDescription className="text-sm text-purple-900 dark:text-purple-200">
          💡 <strong>كيفية الاستخدام:</strong> اكتب السؤال، أضف العناصر القابلة للسحب، أضف مناطق الإفلات، ثم اختر العناصر من القائمة المنسدلة في كل منطقة.
        </AlertDescription>
      </Alert>

        <div className="space-y-2">
          <Label className="text-lg font-bold text-gray-900 dark:text-white">
            السؤال *
          </Label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="اكتب السؤال هنا..."
            rows={3}
            dir="rtl"
            className="text-lg focus:ring-2 focus:ring-purple-500 shadow-sm rounded-lg"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-bold text-gray-900 dark:text-white">
              العناصر القابلة للسحب ({draggableItems.length})
            </Label>
            <Button
              type="button"
              onClick={handleAddItem}
              variant="outline"
              size="sm"
              className="text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة عنصر
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {draggableItems.map((item) => (
              <DraggableItemComponent
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onUpdate={handleUpdateItem}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-bold text-gray-900 dark:text-white">
              مناطق الإفلات ({dropZones.length})
            </Label>
            <div className="flex gap-2">
              {dropZones.length > 0 && (
                <>
                  <Button
                    type="button"
                    onClick={handleReorderZones}
                    variant="outline"
                    size="sm"
                    className="text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    🔄 إعادة ترتيب
                  </Button>
                  <Button
                    type="button"
                    onClick={handleClearAllZones}
                    variant="outline"
                    size="sm"
                    className="text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    🗑️ مسح الكل
                  </Button>
                </>
              )}
              <Button
                type="button"
                onClick={handleAddDropZone}
                variant="outline"
                size="sm"
                className="text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة منطقة
              </Button>
            </div>
          </div>
          <div 
            className="relative w-full bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700"
            style={{ 
              minHeight: '400px',
              maxHeight: '1200px',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <div
              ref={containerRef}
              className="relative w-full"
              style={{ 
                minHeight: '100%',
              }}
            >
              {dropZones.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 pointer-events-none">
                  <p>أضف مناطق الإفلات هنا</p>
                </div>
              ) : (
                <div 
                  className="grid grid-cols-2 gap-4 p-4"
                  style={{ 
                    minHeight: '100%',
                    position: 'relative',
                  }}
                >
                  {dropZones.map((zone, index) => {
                    const assignedItems = draggableItems.filter(item => item.dropZoneId === zone.id);
                    return (
                      <DropZoneComponent
                        key={zone.id}
                        zone={zone}
                        assignedItems={assignedItems}
                        onRemove={handleRemoveDropZone}
                        onUpdate={handleUpdateDropZone}
                        onRemoveItemFromZone={handleRemoveItemFromZone}
                        onAssignItem={handleAssignItem}
                        allItems={draggableItems}
                        zoneIndex={index}
                        useGrid={true}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {question && draggableItems.length > 0 && dropZones.length > 0 && (
          <div className="space-y-3">
            <Label className="text-lg font-bold text-gray-900 dark:text-white">
              معاينة للطلاب:
            </Label>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-purple-200 dark:border-purple-800">
              <p className="text-lg mb-4 font-bold text-gray-900 dark:text-white">{question}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {draggableItems.filter(item => !item.dropZoneId).map((item) => (
                  <span
                    key={item.id}
                    className="px-3 py-2 bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-300 dark:border-purple-700 rounded-lg text-purple-900 dark:text-purple-100 font-semibold"
                  >
                    {item.text || 'عنصر فارغ'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

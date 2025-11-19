'use client';

import { useState } from 'react';
import { QuestionForm } from './QuestionForm';
import { QuestionList } from './QuestionList';
import { Question } from '@/types/knowledge-lab';

interface QuestionsTabProps {
  labId: string;
}

export function QuestionsTab({ labId }: QuestionsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formKey, setFormKey] = useState(0); // Key to force form reset

  const handleSuccess = () => {
    // If editing, close the form. If adding new, reset the form to allow adding another question
    if (editingQuestion) {
      setShowForm(false);
      setEditingQuestion(null);
    } else {
      // Keep form open but reset it by incrementing the key to force React to recreate the form
      setEditingQuestion(null);
      setFormKey(prev => prev + 1); // Force form reset by changing key
    }
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setShowForm(true);
    setFormKey(prev => prev + 1); // Reset form when editing
  };

  const handleAddNew = () => {
    setEditingQuestion(null);
    setShowForm(true);
    setFormKey(prev => prev + 1); // Reset form when adding new
  };

  return (
    <div className="space-y-6" dir="rtl">
      {showForm && (
        <QuestionForm
          key={formKey} // Use key to force form reset
          labId={labId}
          initialData={editingQuestion}
          onSuccess={handleSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingQuestion(null);
          }}
        />
      )}

      <QuestionList
        labId={labId}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}

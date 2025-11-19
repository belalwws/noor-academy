'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, X, User, Users, Mail, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FamilyMember {
  student_name: string;
  student_email: string;
  relationship: string;
  notes: string;
}

interface FamilyEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (familyName: string, members: FamilyMember[], notes: string) => Promise<void>;
  courseTitle?: string;
  enrolling: boolean;
}

export default function FamilyEnrollmentModal({
  isOpen,
  onClose,
  onSubmit,
  courseTitle,
  enrolling
}: FamilyEnrollmentModalProps) {
  const [familyName, setFamilyName] = useState("");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { student_name: "", student_email: "", relationship: "parent", notes: "" }
  ]);
  const [enrollmentNotes, setEnrollmentNotes] = useState("");

  const addFamilyMember = () => {
    if (familyMembers.length < 5) {
      setFamilyMembers([...familyMembers, { student_name: "", student_email: "", relationship: "parent", notes: "" }]);
    }
  };

  const removeFamilyMember = (index: number) => {
    if (familyMembers.length > 1) {
      setFamilyMembers(familyMembers.filter((_, i) => i !== index));
    }
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const handleSubmit = async () => {
    await onSubmit(familyName, familyMembers, enrollmentNotes);
    
    // Reset form after successful submission
    setFamilyName("");
    setFamilyMembers([{ student_name: "", student_email: "", relationship: "parent", notes: "" }]);
    setEnrollmentNotes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-white rounded-2xl -m-6 p-6">
          {/* Animated Background Elements */}
          <motion.div 
            className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"
            initial={{ scale: 0, opacity: 0, x: 100, y: -100 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-400/20 to-green-400/20 rounded-full blur-3xl"
            initial={{ scale: 0, opacity: 0, x: -100, y: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
              <DialogHeader className="pb-6 border-b border-green-200/50 relative z-10">
                <motion.div 
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1
                  }}
                >
                  <Users className="w-10 h-10 text-white" />
                </motion.div>
                <DialogTitle className="text-3xl font-bold text-center text-green-800 mb-2">
                  التسجيل العائلي في الدورة
                </DialogTitle>
                <DialogDescription className="text-center text-green-700 text-lg font-medium">
                  {courseTitle}
                </DialogDescription>
              </DialogHeader>
            </motion.div>
            
            <motion.div 
              className="space-y-8 p-6 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* Family Name */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Label htmlFor="family-name" className="text-lg font-semibold text-green-800 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  اسم العائلة *
                </Label>
                <Input
                  id="family-name"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="أدخل اسم العائلة"
                  className="w-full h-12 text-lg rounded-2xl border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/80 backdrop-blur-sm transition-all duration-200"
                />
              </motion.div>

              {/* Family Members */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-green-800 flex items-center gap-2">
                    <UserCircle className="w-5 h-5" />
                    أعضاء العائلة *
                  </Label>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFamilyMember}
                      disabled={familyMembers.length >= 5}
                      className="flex items-center gap-2 bg-green-100 hover:bg-green-200 border-green-300 text-green-700 rounded-2xl px-4 py-2 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة عضو
                    </Button>
                  </motion.div>
                </div>
                
                <AnimatePresence mode="popLayout">
                  {familyMembers.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-6 border-2 border-green-200 rounded-3xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                        {/* Card Background Decoration */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/10 to-transparent rounded-full -translate-y-8 translate-x-8" />
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-green-800">عضو {index + 1}</h4>
                          </div>
                          {familyMembers.length > 1 && (
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFamilyMember(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-2xl p-2 transition-colors duration-200"
                              >
                                <X className="w-5 h-5" />
                              </Button>
                            </motion.div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                          <div className="space-y-3">
                            <Label htmlFor={`name-${index}`} className="text-base font-semibold text-green-700 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              الاسم الكامل *
                            </Label>
                            <Input
                              id={`name-${index}`}
                              value={member.student_name}
                              onChange={(e) => updateFamilyMember(index, 'student_name', e.target.value)}
                              placeholder="أدخل الاسم الكامل"
                              className="h-11 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/90 transition-all duration-200"
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <Label htmlFor={`email-${index}`} className="text-base font-semibold text-green-700 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              البريد الإلكتروني *
                            </Label>
                            <Input
                              id={`email-${index}`}
                              type="email"
                              value={member.student_email}
                              onChange={(e) => updateFamilyMember(index, 'student_email', e.target.value)}
                              placeholder="أدخل البريد الإلكتروني"
                              className="h-11 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/90 transition-all duration-200"
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <Label htmlFor={`relationship-${index}`} className="text-base font-semibold text-green-700">صلة القرابة</Label>
                            <Select
                              value={member.relationship}
                              onValueChange={(value) => updateFamilyMember(index, 'relationship', value)}
                            >
                              <SelectTrigger className="h-11 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/90 transition-all duration-200">
                                <SelectValue placeholder="اختر صلة القرابة" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-2 border-green-200">
                                <SelectItem value="parent" className="rounded-xl">والد/والدة</SelectItem>
                                <SelectItem value="sibling" className="rounded-xl">أخ/أخت</SelectItem>
                                <SelectItem value="child" className="rounded-xl">ابن/ابنة</SelectItem>
                                <SelectItem value="spouse" className="rounded-xl">زوج/زوجة</SelectItem>
                                <SelectItem value="other" className="rounded-xl">أخرى</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-3">
                            <Label htmlFor={`notes-${index}`} className="text-base font-semibold text-green-700">ملاحظات (اختياري)</Label>
                            <Input
                              id={`notes-${index}`}
                              value={member.notes}
                              onChange={(e) => updateFamilyMember(index, 'notes', e.target.value)}
                              placeholder="أي ملاحظات إضافية"
                              className="h-11 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/90 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* General Notes */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Label htmlFor="enrollment-notes" className="text-lg font-semibold text-green-800">ملاحظات عامة (اختياري)</Label>
                <Textarea
                  id="enrollment-notes"
                  value={enrollmentNotes}
                  onChange={(e) => setEnrollmentNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية حول التسجيل العائلي"
                  rows={4}
                  className="rounded-2xl border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/80 backdrop-blur-sm text-lg transition-all duration-200"
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div 
                className="flex gap-6 pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={enrolling}
                  className="flex-1 h-14 text-lg font-semibold rounded-2xl border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 transition-all duration-200"
                >
                  <X className="w-5 h-5 ml-2" />
                  إلغاء
                </Button>
                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={enrolling}
                    className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    {enrolling ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 ml-2" />
                        إرسال طلب التسجيل
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

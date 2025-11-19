'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Phone, Calendar, GraduationCap, 
  BookOpen, Award, FileText, Briefcase, CheckCircle, 
  ArrowRight, ArrowLeft, AlertCircle, Upload, X, Eye, EyeOff, Home, Globe
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getApiUrl } from '@/lib/config';

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkingExistingAccount, setCheckingExistingAccount] = useState(true);

  const [step1Data, setStep1Data] = useState({
    first_name: '', last_name: '', email: '', password: '', password2: '',
    age: 25, gender: '', country: 'SA', country_code: '+966', phone_number: '',
    academic_degree: '', specialization: '', specialization_other: ''
  });

  const [step2Islamic, setStep2Islamic] = useState({
    has_ijazah: false, ijazah_source: '', islamic_specialization: ''
  });

  const [step2Other, setStep2Other] = useState({
    university_name: '', graduation_year: new Date().getFullYear(),
    graduation_certificate: null as File | null, years_of_experience: 0,
    cv_file: null as File | null, linkedin_url: ''
  });

  // Check if user is already a registered teacher
  useEffect(() => {
    const checkExistingTeacher = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('teacher_access_token');
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
          setCheckingExistingAccount(false);
          return;
        }

        const userData = JSON.parse(user);
        
        // If user is already a teacher, redirect to choose supervisor
        if (userData.role === 'teacher') {
          console.log('✅ User is already a teacher, redirecting to choose supervisor');
          router.push('/choose-supervisor');
          return;
        }
        
        setCheckingExistingAccount(false);
      } catch (error) {
        console.error('Error checking existing teacher:', error);
        setCheckingExistingAccount(false);
      }
    };

    checkExistingTeacher();
  }, [router]);

  const handleStep1Change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStep1Data(prev => ({ ...prev, [name]: value }));
  };

  const handleStep1Next = () => {
    if (!step1Data.first_name || !step1Data.last_name || !step1Data.email || 
        !step1Data.password || !step1Data.password2 || !step1Data.gender || 
        !step1Data.phone_number || !step1Data.academic_degree || !step1Data.specialization) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (step1Data.password !== step1Data.password2) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    if (step1Data.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    if (step1Data.specialization === 'other' && !step1Data.specialization_other) {
      setError('يرجى تحديد التخصص الآخر');
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(step1Data).forEach(([key, value]) => {
        if (value !== null && value !== '') formData.append(key, value.toString());
      });
      if (step1Data.specialization === 'quran_islamic') {
        formData.append('has_ijazah', step2Islamic.has_ijazah.toString());
        if (step2Islamic.has_ijazah && step2Islamic.ijazah_source) {
          formData.append('ijazah_source', step2Islamic.ijazah_source);
        }
        if (step2Islamic.islamic_specialization) {
          formData.append('islamic_specialization', step2Islamic.islamic_specialization);
        }
      } else {
        if (step2Other.university_name) formData.append('university_name', step2Other.university_name);
        formData.append('graduation_year', step2Other.graduation_year.toString());
        formData.append('years_of_experience', step2Other.years_of_experience.toString());
        if (step2Other.graduation_certificate) formData.append('graduation_certificate', step2Other.graduation_certificate);
        if (step2Other.cv_file) formData.append('cv_file', step2Other.cv_file);
        if (step2Other.linkedin_url) formData.append('linkedin_url', step2Other.linkedin_url);
      }
      const response = await fetch(getApiUrl('/teachers/register/'), { method: 'POST', body: formData });
      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors (e.g., email already exists)
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => {
              if (field === 'email') {
                return 'البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر.';
              }
              return Array.isArray(messages) ? messages.join(', ') : messages;
            })
            .join('\n');
          throw new Error(errorMessages);
        }
        throw new Error(data.detail || data.message || 'فشل في التسجيل');
      }
      
      // Save tokens for supervisor selection
      if (data.data?.tokens) {
        localStorage.setItem('teacher_access_token', data.data.tokens.access);
        localStorage.setItem('teacher_refresh_token', data.data.tokens.refresh);
        localStorage.setItem('teacher_email', step1Data.email);
      } else {
        // Fallback: save email/password if tokens not returned
        localStorage.setItem('teacher_email', step1Data.email);
        localStorage.setItem('teacher_password', step1Data.password);
      }
      
      router.push(`/choose-supervisor?teacher_id=${data.data.teacher_id}`);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking for existing account
  if (checkingExistingAccount) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4 pt-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
      </div>
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 mb-4">
            <Home size={20} /><span>العودة للرئيسية</span>
          </Link>
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Roshd Logo" width={80} height={80} className="rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-900 to-orange-900 dark:from-amber-300 dark:to-orange-300 bg-clip-text text-transparent mb-2">
            انضم كمعلم في أكاديمية رُشد
          </h1>
          <p className="text-slate-600 dark:text-slate-400">ساهم في نشر العلم الشرعي وكن جزءاً من رحلتنا التعليمية</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center mb-8 gap-4">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                currentStep >= step ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>{currentStep > step ? <CheckCircle size={20} /> : step}</div>
              {step < 2 && <div className={`w-16 h-1 mx-2 transition-all ${currentStep > step ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-red-700 dark:text-red-200">
              <AlertCircle className="mt-0.5 flex-shrink-0" size={18} /><p className="text-sm">{error}</p>
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            {currentStep === 1 && <Step1Form data={step1Data} onChange={handleStep1Change} onNext={handleStep1Next} showPassword={showPassword} setShowPassword={setShowPassword} showPassword2={showPassword2} setShowPassword2={setShowPassword2} />}
            {currentStep === 2 && step1Data.specialization === 'quran_islamic' && <Step2IslamicForm data={step2Islamic} onChange={setStep2Islamic} onBack={() => setCurrentStep(1)} onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
            {currentStep === 2 && step1Data.specialization === 'other' && <Step2OtherForm data={step2Other} onChange={setStep2Other} onBack={() => setCurrentStep(1)} onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
          </AnimatePresence>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mt-6 text-slate-600 dark:text-slate-400">
          <p>لديك حساب بالفعل؟ <Link href="/login" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-semibold">تسجيل الدخول</Link></p>
        </motion.div>
      </div>
    </div>
  );
}

function Step1Form({ data, onChange, onNext, showPassword, setShowPassword, showPassword2, setShowPassword2 }: any) {
  return (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">المرحلة 1: البيانات الأساسية</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><User className="inline ml-2" size={16} />الاسم الأول *</label><input type="text" name="first_name" value={data.first_name} onChange={onChange} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" placeholder="أحمد" required /></div>
        <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><User className="inline ml-2" size={16} />الاسم الأخير *</label><input type="text" name="last_name" value={data.last_name} onChange={onChange} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" placeholder="محمد" required /></div>
      </div>
      <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><Mail className="inline ml-2" size={16} />البريد الإلكتروني *</label><input type="email" name="email" value={data.email} onChange={onChange} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" placeholder="ahmed@example.com" required /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative"><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><Lock className="inline ml-2" size={16} />كلمة المرور *</label><input type={showPassword ? 'text' : 'password'} name="password" value={data.password} onChange={onChange} className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" placeholder="••••••••" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-11 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
        <div className="relative"><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><Lock className="inline ml-2" size={16} />تأكيد كلمة المرور *</label><input type={showPassword2 ? 'text' : 'password'} name="password2" value={data.password2} onChange={onChange} className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" placeholder="••••••••" required /><button type="button" onClick={() => setShowPassword2(!showPassword2)} className="absolute left-3 top-11 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><Calendar className="inline ml-2" size={16} />العمر *</label><input type="number" name="age" value={data.age} onChange={onChange} min="18" max="80" className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" required /></div>
        <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><User className="inline ml-2" size={16} />الجنس *</label><select name="gender" value={data.gender} onChange={onChange} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" required><option value="">اختر الجنس</option><option value="male">ذكر</option><option value="female">أنثى</option></select></div>
      </div>
      <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><Phone className="inline ml-2" size={16} />رقم الهاتف *</label><div className="flex gap-2"><select name="country_code" value={data.country_code} onChange={onChange} className="w-32 px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all"><option value="+966">🇸🇦 +966</option><option value="+20">🇪🇬 +20</option><option value="+971">🇦🇪 +971</option><option value="+965">🇰🇼 +965</option></select><input type="tel" name="phone_number" value={data.phone_number} onChange={onChange} className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" placeholder="501234567" required /></div></div>
      <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><GraduationCap className="inline ml-2" size={16} />المؤهل الأكاديمي *</label><select name="academic_degree" value={data.academic_degree} onChange={onChange} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" required><option value="">اختر المؤهل</option><option value="bachelor">بكالوريوس</option><option value="master">ماجستير</option><option value="phd">دكتوراه</option><option value="other">أخرى</option></select></div>
      <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><BookOpen className="inline ml-2" size={16} />التخصص *</label><select name="specialization" value={data.specialization} onChange={onChange} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" required><option value="">اختر التخصص</option><option value="quran_islamic">قرآن وعلوم شرعية</option><option value="other">أخرى</option></select></div>
      {data.specialization === 'other' && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">حدد التخصص *</label><input type="text" name="specialization_other" value={data.specialization_other} onChange={onChange} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" placeholder="مثال: رياضيات، فيزياء، كيمياء..." required /></motion.div>}
      <button type="button" onClick={onNext} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"><span>التالي</span><ArrowRight size={20} /></button>
    </motion.div>
  );
}

function Step2IslamicForm({ data, onChange, onBack, onSubmit, isSubmitting }: any) {
  return (
    <motion.div key="step2-islamic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">المرحلة 2: معلومات التخصص الشرعي</h2>
      <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3"><Award className="inline ml-2" size={16} />هل لديك إجازة في القرآن الكريم؟ *</label><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="has_ijazah" checked={data.has_ijazah === true} onChange={() => onChange({ ...data, has_ijazah: true })} className="w-4 h-4 text-amber-500 focus:ring-amber-500" /><span className="text-slate-700 dark:text-slate-300">نعم</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="has_ijazah" checked={data.has_ijazah === false} onChange={() => onChange({ ...data, has_ijazah: false })} className="w-4 h-4 text-amber-500 focus:ring-amber-500" /><span className="text-slate-700 dark:text-slate-300">لا</span></label></div></div>
      {data.has_ijazah && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">جهة الإجازة *</label><input type="text" value={data.ijazah_source} onChange={(e) => onChange({ ...data, ijazah_source: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" placeholder="مثال: الأزهر الشريف" required /></motion.div>}
      <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><BookOpen className="inline ml-2" size={16} />التخصص الشرعي الدقيق *</label><select value={data.islamic_specialization} onChange={(e) => onChange({ ...data, islamic_specialization: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" required><option value="">اختر التخصص</option><option value="tajweed">تجويد</option><option value="tafseer">تفسير</option><option value="fiqh">فقه</option><option value="aqeedah">عقيدة</option><option value="hadith">حديث</option><option value="dawah">دعوة</option><option value="other">أخرى</option></select></div>
      <div className="flex gap-4"><button type="button" onClick={onBack} className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2"><ArrowLeft size={20} /><span>السابق</span></button><button type="button" onClick={onSubmit} disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? <><Spinner size="md" tone="contrast" /><span>جاري الإرسال...</span></> : <><CheckCircle size={20} /><span>إرسال الطلب</span></>}</button></div>
    </motion.div>
  );
}

function Step2OtherForm({ data, onChange, onBack, onSubmit, isSubmitting }: any) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0] || null;
    onChange({ ...data, [field]: file });
  };
  return (
    <motion.div key="step2-other" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">المرحلة 2: معلومات التخصص</h2>
      <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><GraduationCap className="inline ml-2" size={16} />اسم الجامعة *</label><input type="text" value={data.university_name} onChange={(e) => onChange({ ...data, university_name: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" placeholder="جامعة القاهرة" required /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><Calendar className="inline ml-2" size={16} />سنة التخرج *</label><input type="number" value={data.graduation_year} onChange={(e) => onChange({ ...data, graduation_year: parseInt(e.target.value) || new Date().getFullYear() })} min="1950" max="2030" className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" required /></div><div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><Briefcase className="inline ml-2" size={16} />سنوات الخبرة *</label><input type="number" value={data.years_of_experience} onChange={(e) => onChange({ ...data, years_of_experience: parseInt(e.target.value) || 0 })} min="0" max="50" className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" required /></div></div>
      <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><FileText className="inline ml-2" size={16} />شهادة التخرج (اختياري)</label><input type="file" onChange={(e) => handleFileChange(e, 'graduation_certificate')} accept=".pdf,.jpg,.jpeg,.png" className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" /></div>
      <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><FileText className="inline ml-2" size={16} />السيرة الذاتية CV (اختياري)</label><input type="file" onChange={(e) => handleFileChange(e, 'cv_file')} accept=".pdf,.doc,.docx" className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" /></div>
      <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"><Globe className="inline ml-2" size={16} />رابط LinkedIn (اختياري)</label><input type="url" value={data.linkedin_url} onChange={(e) => onChange({ ...data, linkedin_url: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all" placeholder="https://linkedin.com/in/yourprofile" /></div>
      <div className="flex gap-4"><button type="button" onClick={onBack} className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2"><ArrowLeft size={20} /><span>السابق</span></button><button type="button" onClick={onSubmit} disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? <><Spinner size="md" tone="contrast" /><span>جاري الإرسال...</span></> : <><CheckCircle size={20} /><span>إرسال الطلب</span></>}</button></div>
    </motion.div>
  );
}





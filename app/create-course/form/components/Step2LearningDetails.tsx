import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { StepProps } from '../types';

export function Step2LearningDetails({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          مخرجات التعلم والمواضيع
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          حدد ما سيتعلمه الطلاب والمواضيع المطروحة
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="learning_outcomes" className="text-base font-semibold">
            مخرجات التعلم <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="learning_outcomes"
            value={formData.learning_outcomes}
            onChange={(e) => updateFormData('learning_outcomes', e.target.value)}
            placeholder="اكتب مخرجات التعلم المتوقعة (كل سطر يمثل مخرجاً)&#10;مثال:&#10;- إتقان قراءة القرآن بالتجويد&#10;- فهم أحكام التجويد الأساسية&#10;- تطبيق المخارج الصحيحة للحروف"
            rows={8}
            className="mt-2"
          />
          <p className="text-xs text-slate-500 mt-1">
            💡 نصيحة: اكتب كل مخرج في سطر منفصل لتسهيل القراءة
          </p>
        </div>

        <div>
          <Label htmlFor="topics" className="text-base font-semibold">
            المواضيع المطروحة <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="topics"
            value={formData.topics}
            onChange={(e) => updateFormData('topics', e.target.value)}
            placeholder="اكتب المواضيع التي ستغطيها الدورة&#10;مثال:&#10;- أحكام النون الساكنة والتنوين&#10;- المدود وأنواعها&#10;- صفات الحروف&#10;- التطبيق العملي على السور"
            rows={8}
            className="mt-2"
          />
          <p className="text-xs text-slate-500 mt-1">
            💡 نصيحة: رتب المواضيع حسب تسلسل الدورة
          </p>
        </div>

        <div>
          <Label htmlFor="intro_session_id" className="text-base font-semibold">
            رابط المحاضرة المجانية (اختياري)
          </Label>
          <Input
            id="intro_session_id"
            value={formData.intro_session_id}
            onChange={(e) => updateFormData('intro_session_id', e.target.value)}
            placeholder="مثال: https://example.com/intro-session"
            className="mt-2"
          />
          <p className="text-xs text-slate-500 mt-1">
            يمكنك إضافة رابط لمحاضرة تعريفية مجانية للطلاب
          </p>
        </div>
      </div>
    </div>
  );
}


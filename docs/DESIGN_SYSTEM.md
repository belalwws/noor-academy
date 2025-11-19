# Design System Documentation
# توثيق نظام التصميم - نظام أكاديمية رشد التعليمي

## نظرة عامة

هذا المشروع يستخدم Design System مركزي قائم على CSS Variables يسمح بتغيير الـ UI بالكامل من مكان واحد (`client/styles/tokens.css`).

## الملفات الأساسية

- `client/styles/tokens.css` - جميع Design Tokens (الألوان، الخطوط، المسافات، إلخ)
- `client/tailwind.config.ts` - إعدادات Tailwind التي تستخدم CSS Variables
- `client/lib/theme.ts` - Theme Management System
- `client/components/ThemeSwitcher.tsx` - UI Component لتبديل الـ Themes

## الألوان الأساسية

### Brand Colors (من Homepage)
- **Primary**: `#E9A821` (ذهبي) - `var(--color-primary)`
- **Primary Dark**: `#C78C12` - `var(--color-primary-dark)`
- **Primary Light**: `#FFB347` (برتقالي فاتح) - `var(--color-primary-light)`
- **Secondary**: `#2d7d32` (أخضر) - `var(--color-secondary)`
- **Accent Cool**: `#4C8BF5` (أزرق) - `var(--color-accent-cool)`

### Text Colors
- **Text Primary**: `#1E1E1E` - `var(--color-text-primary)`
- **Text Secondary**: `#555555` - `var(--color-text-secondary)`
- **Text Tertiary**: `#62636c` - `var(--color-text-tertiary)`

### Background Colors
- **Background**: `#FAFAF9` - `var(--color-bg)`
- **Background Alt**: `#FFFFFF` - `var(--color-bg-alt)`
- **Background Card**: `#FFFFFF` - `var(--color-bg-card)`

## الاستخدام في Tailwind

### الألوان
```tsx
// استخدام Primary Color
<div className="bg-primary text-white">...</div>
<div className="bg-primary-dark">...</div>
<div className="bg-primary-light">...</div>

// استخدام Text Colors
<p className="text-text-primary">...</p>
<p className="text-text-secondary">...</p>

// استخدام Background Colors
<div className="bg-bg">...</div>
<div className="bg-bg-card">...</div>
```

### Gradients
```tsx
// Gradient Primary
<div className="bg-gradient-primary">...</div>

// Gradient Navbar
<nav className="gradient-navbar">...</nav>

// Gradient Hero
<section className="gradient-hero">...</section>

// Gradient Card Header
<div className="gradient-card-header">...</div>
```

### Spacing
```tsx
// استخدام Spacing Scale
<div className="p-md gap-lg">...</div>
<div className="m-xl">...</div>
```

### Border Radius
```tsx
<div className="rounded-md">...</div>
<div className="rounded-lg">...</div>
```

### Shadows
```tsx
<div className="shadow-glow">...</div>
<div className="shadow-soft">...</div>
```

## CSS Variables المباشرة

يمكن استخدام CSS Variables مباشرة في inline styles:

```tsx
<div style={{ backgroundColor: 'var(--color-primary)' }}>...</div>
<div style={{ background: 'var(--gradient-primary)' }}>...</div>
```

## Multiple Themes

النظام يدعم عدة Themes للعملاء المختلفين:

### Themes المتاحة
1. **default** - الذهبي (الافتراضي) - `#E9A821`
2. **islamic-green** - الأخضر الإسلامي - `#2d7d32`
3. **blue-ocean** - الأزرق المحيط - `#3b82f6`
4. **purple-royal** - البنفسجي الملكي - `#8b5cf6`

### تغيير Theme
```tsx
import { setTheme, getTheme } from '@/lib/theme';

// تغيير Theme
setTheme('islamic-green');

// جلب Theme الحالي
const currentTheme = getTheme();
```

### استخدام Theme Switcher Component
```tsx
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

// في أي صفحة أو layout
<ThemeSwitcher />
```

## Dark Mode

Dark Mode يعمل تلقائياً عبر CSS Variables. الألوان تتغير تلقائياً عند تفعيل Dark Mode:

```css
:root.dark {
  --color-bg: #0F172A;
  --color-text-primary: #F1F5F9;
  /* ... */
}
```

## إضافة Theme جديد

لإضافة theme جديد:

1. افتح `client/styles/tokens.css`
2. أضف theme جديد في نهاية الملف:

```css
:root[data-theme="new-theme"] {
  --color-primary: #YOUR_COLOR;
  --color-primary-dark: #YOUR_DARK_COLOR;
  --color-primary-light: #YOUR_LIGHT_COLOR;
  --gradient-primary: linear-gradient(90deg, #COLOR1 0%, #COLOR2 100%);
  --gradient-navbar: linear-gradient(135deg, #COLOR1 0%, #COLOR2 100%);
  --shadow-glow: 0 4px 16px rgba(R, G, B, 0.15);
}

:root[data-theme="new-theme"].dark {
  --shadow-glow: 0 10px 40px rgba(R, G, B, 0.2), 0 0 20px rgba(R, G, B, 0.1);
}
```

3. أضف Theme في `client/lib/theme.ts`:

```typescript
export type Theme = 'default' | 'islamic-green' | 'blue-ocean' | 'purple-royal' | 'new-theme';

export function getThemeName(theme: Theme): string {
  const names: Record<Theme, string> = {
    // ...
    'new-theme': 'اسم Theme الجديد',
  };
  return names[theme];
}
```

## Fonts

### Font Families
- **Sans**: `var(--font-sans)` - Cairo, Tajawal
- **Heading**: `var(--font-heading)` - Poppins
- **Arabic**: `var(--font-arabic)` - Amiri, Noto Naskh Arabic
- **Mono**: `var(--font-mono)` - Geist Mono

### الاستخدام
```tsx
<h1 className="font-heading">عنوان</h1>
<p className="font-sans">نص عادي</p>
<p className="font-arabic">نص عربي</p>
```

## Spacing Scale

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

## Border Radius

- `sm`: 4px
- `md`: 8px
- `lg`: 12px
- `xl`: 16px
- `2xl`: 24px
- `full`: 9999px

## Best Practices

1. **لا تستخدم ألوان hardcoded** - استخدم CSS Variables دائماً
2. **استخدم Tailwind Classes** - أفضل من inline styles
3. **استخدم Design Tokens** - لا تخترع قيم جديدة
4. **اختبر Dark Mode** - تأكد من أن كل شيء يعمل في Dark Mode
5. **استخدم Theme Switcher** - للتحقق من Themes المختلفة

## أمثلة

### Button
```tsx
<button className="bg-primary hover:bg-primary-dark text-white px-md py-sm rounded-md">
  اضغط هنا
</button>
```

### Card
```tsx
<div className="bg-bg-card border border-border rounded-lg p-lg shadow-soft">
  <h3 className="text-text-primary font-heading">عنوان</h3>
  <p className="text-text-secondary">محتوى</p>
</div>
```

### Gradient Background
```tsx
<section className="gradient-hero p-xl rounded-xl">
  <h1 className="text-text-primary">عنوان رئيسي</h1>
</section>
```

## الدعم

لأي استفسارات أو مشاكل في Design System، راجع:
- `client/styles/tokens.css` - جميع Tokens
- `client/lib/theme.ts` - Theme Management
- هذا الملف للتوثيق

---

**آخر تحديث**: 2025
**المشروع**: نظام أكاديمية رشد التعليمي


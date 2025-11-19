import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "animate-spin drop-shadow-[0_3px_12px_rgba(233,168,33,0.35)]",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-8 w-8",
        xl: "h-12 w-12"
      },
      tone: {
        brand: "text-primary",
        subtle: "text-primary/70",
        contrast: "text-white",
        muted: "text-slate-400 dark:text-slate-500"
      }
    },
    defaultVariants: {
      size: "md",
      tone: "brand"
    }
  }
);

type SpinnerProps = VariantProps<typeof spinnerVariants> & {
  "aria-label"?: string;
  className?: string;
};

export const Spinner = ({
  size,
  tone,
  className,
  "aria-label": ariaLabel = "جاري التحميل"
}: SpinnerProps) => {
  return (
    <Loader2
      data-testid="brand-spinner"
      aria-label={ariaLabel}
      className={cn(spinnerVariants({ size, tone }), className)}
    />
  );
};

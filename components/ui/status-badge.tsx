import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
  {
    variants: {
      variant: {
        pending: 'bg-yellow-100 text-yellow-900',
        approved: 'bg-green-100 text-green-900',
        rejected: 'bg-red-100 text-red-900',
        processing: 'bg-blue-100 text-blue-900',
        conditional: 'bg-purple-100 text-purple-900',
      },
    },
    defaultVariants: {
      variant: 'pending',
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function StatusBadge({
  variant,
  children,
  className,
  icon,
}: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ variant }), className)}>
      {icon}
      {children}
    </div>
  );
}

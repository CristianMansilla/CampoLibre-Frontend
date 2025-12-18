import { cn } from '@/lib/cn';

type Variant = 'neutral' | 'success' | 'info' | 'warning';

const variants: Record<Variant, string> = {
    neutral: 'border-white/15 bg-white/10 text-white/70',
    success: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200',
    info: 'border-cyan-500/30 bg-cyan-500/15 text-cyan-200',
    warning: 'border-amber-500/30 bg-amber-500/15 text-amber-200',
};

export function Badge({
    className,
    variant = 'neutral',
    ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
    return (
        <span
            className={cn('text-xs px-2.5 py-1 rounded-full border', variants[variant], className)}
            {...props}
        />
    );
}

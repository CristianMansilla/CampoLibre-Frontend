import { cn } from '@/lib/cn';

type Variant = 'danger' | 'info' | 'success';

const variants: Record<Variant, string> = {
    danger: 'text-red-200 bg-red-500/10 border-red-500/30',
    info: 'text-cyan-200 bg-cyan-500/10 border-cyan-500/30',
    success: 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30',
};

export function Alert({
    className,
    variant = 'info',
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
    return (
        <div
            className={cn('text-sm border rounded-xl px-3 py-2', variants[variant], className)}
            {...props}
        />
    );
}

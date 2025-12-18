import { cn } from '@/lib/cn';

type PillVariant = 'default' | 'selected' | 'danger';

export function Pill({
    className,
    selected,
    disabled,
    variant,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    selected?: boolean;
    variant?: PillVariant;
}) {
    const v: PillVariant = variant ?? (selected ? 'selected' : 'default');

    const base = 'px-3 py-2 rounded-xl border text-sm font-semibold transition';

    const state = disabled
        ? 'border-white/10 bg-white/5 text-white/35 cursor-not-allowed'
        : v === 'selected'
            ? 'border-emerald-500/60 bg-emerald-500/30 text-emerald-100 ring-1 ring-emerald-500/30'
            : v === 'danger'
                ? 'border-red-500/40 bg-red-500/20 text-red-100 hover:bg-red-500/25'
                : 'border-white/10 bg-white/10 text-white/80 hover:bg-white/15';

    return (
        <button
            className={cn(base, state, className)}
            disabled={disabled}
            aria-pressed={selected}
            {...props}
        />
    );
}

export function PillGroup({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-wrap gap-2', className)} {...props} />;
}

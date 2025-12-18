import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
    'inline-flex items-center justify-center font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/10',
    ghost: 'bg-transparent hover:bg-white/10 text-white border border-white/10',
    danger: 'bg-red-600/80 hover:bg-red-600 text-white',
};

const sizes: Record<Size, string> = {
    sm: 'px-3 py-2 text-sm rounded-xl',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-4 py-3 text-base rounded-xl',
};

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
}) {
    return (
        <button
            className={cn(base, variants[variant], sizes[size], className)}
            {...props}
        />
    );
}

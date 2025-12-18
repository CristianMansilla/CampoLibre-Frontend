import { cn } from '@/lib/cn';

export function Label({
    className,
    ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label
            className={cn('block text-xs font-medium text-white/80 mb-1', className)}
            {...props}
        />
    );
}

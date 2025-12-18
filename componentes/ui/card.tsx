import { cn } from '@/lib/cn';

export function Card({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl',
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('p-6 sm:p-8', className)} {...props} />;
}

export function CardContent({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('px-6 pb-6 sm:px-8 sm:pb-8', className)} {...props} />;
}

export function CardTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2 className={cn('text-lg font-semibold text-white', className)} {...props} />
    );
}

export function CardDescription({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={cn('text-sm text-white/65', className)} {...props} />
    );
}

'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type KpiCardProps = {
    title: string;
    value: ReactNode;
    hint?: string;
    className?: string;
};

export function KpiCard({
    title,
    value,
    hint,
    className,
}: KpiCardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-white/10 bg-white/5 p-5',
                className
            )}
        >
            <p className="text-white/60 text-sm">{title}</p>

            <p className="text-white text-2xl font-semibold mt-2">
                {value}
            </p>

            {hint && (
                <p className="text-white/50 text-xs mt-2">
                    {hint}
                </p>
            )}
        </div>
    );
}

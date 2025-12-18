import { cn } from '@/lib/cn';

export function Toggle({
    label,
    value,
    onChange,
    className,
}: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            className={cn(
                'grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border px-4 py-3 transition',
                value
                    ? 'border-emerald-500/30 bg-emerald-500/15'
                    : 'border-white/10 bg-white/5 hover:bg-white/10',
                className
            )}
            aria-pressed={value}
        >
            <div>
                <p className="text-sm text-white/80 font-semibold">{label}</p>
                <p className="text-xs text-white/55">{value ? 'Activado' : 'Desactivado'}</p>
            </div>

            <div
                className={cn(
                    'h-5 w-9 rounded-full border border-white/10 p-1 transition',
                    value ? 'bg-emerald-500/20' : 'bg-white/10'
                )}
            >
                <div
                    className={cn(
                        'h-3 w-3 rounded-full transition',
                        value ? 'translate-x-4 bg-emerald-300' : 'translate-x-0 bg-white/40'
                    )}
                />
            </div>
        </button>
    );
}

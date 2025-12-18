import Link from 'next/link';
import { cn } from '@/lib/cn';

type Accent = 'emerald' | 'cyan';

export function NavCard({
    href,
    title,
    desc,
    tag,
    ctaHint,
    accent = 'emerald',
    className,
}: {
    href: string;
    title: string;
    desc: string;
    tag?: React.ReactNode;
    ctaHint?: string;
    accent?: Accent;
    className?: string;
}) {
    const accentBg =
        accent === 'emerald'
            ? 'from-emerald-500/25 to-transparent'
            : 'from-cyan-500/25 to-transparent';

    const ctaColor = accent === 'emerald' ? 'text-emerald-300' : 'text-cyan-200';

    return (
        <Link
            href={href}
            className={cn(
                'group relative overflow-hidden',
                'rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6',
                'transition hover:bg-white/10 hover:-translate-y-0.5 hover:border-white/20',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
                className
            )}
        >
            <div
                className={cn(
                    'absolute inset-x-0 top-0 h-20 bg-gradient-to-b pointer-events-none',
                    accentBg
                )}
            />
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition">
                <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-white font-semibold text-lg">{title}</h3>
                        <p className="text-white/65 text-sm mt-2">{desc}</p>
                    </div>

                    {tag ? <div className="shrink-0">{tag}</div> : null}
                </div>

                <div className={cn('mt-5 inline-flex items-center gap-2 text-sm font-semibold', ctaColor)}>
                    Ir → <span className="text-white/40 font-semibold">{ctaHint ?? ''}</span>
                </div>
            </div>
        </Link>
    );
}

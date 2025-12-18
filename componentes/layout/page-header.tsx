type PageHeaderProps = {
    title: string;
    subtitle?: string;
    breadcrumb?: React.ReactNode;
    ontoggleResponsive: () => void;
    actions?: React.ReactNode;
};

export function PageHeader({
    title,
    subtitle,
    breadcrumb,
    ontoggleResponsive,
    actions,
}: PageHeaderProps) {
    return (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 items-start">
                    <button
                        onClick={ontoggleResponsive}
                        className="mt-1 h-9 w-9 rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 text-white/80"
                        aria-label="Abrir menú"
                    >
                        ☰
                    </button>

                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-white">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-white/60 text-sm mt-1">{subtitle}</p>
                        )}
                        {breadcrumb && (
                            <div className="mt-2 text-sm text-white/60">{breadcrumb}</div>
                        )}
                    </div>
                </div>

                {actions && <div>{actions}</div>}
            </div>
        </div>
    );
}

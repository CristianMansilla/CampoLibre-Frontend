'use client';

import { Fragment, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { cn } from '@/lib/cn';

type SelectOption = { value: string; label: string; disabled?: boolean };

type SelectProps = {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    buttonClassName?: string;
    optionsClassName?: string;
};

export function Select({
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    disabled,
    className,
    buttonClassName,
    optionsClassName,
}: SelectProps) {
    const selected = useMemo(
        () => options.find((o) => o.value === value) ?? null,
        [options, value]
    );

    return (
        <div className={cn('relative', className)}>
            <Listbox value={value} onChange={onChange} disabled={disabled}>
                <Listbox.Button
                    className={cn(
                        'w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3',
                        'text-white text-left outline-none flex items-center justify-between gap-3',
                        'focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
                        'disabled:opacity-60 disabled:cursor-not-allowed',
                        buttonClassName
                    )}
                >
                    <span className={cn('truncate', !selected ? 'text-white/50' : 'text-white')}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <span className="text-white/60">▾</span>
                </Listbox.Button>

                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 -translate-y-1"
                >
                    <Listbox.Options
                        className={cn(
                            'absolute z-[9999] mt-2 w-full overflow-hidden rounded-2xl',
                            'border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl',
                            'max-h-64 overflow-y-auto',
                            optionsClassName
                        )}
                    >
                        {options.map((o) => (
                            <Listbox.Option
                                key={o.value}
                                value={o.value}
                                disabled={o.disabled}
                                className={({ active, disabled }) =>
                                    cn(
                                        'cursor-pointer px-4 py-3 text-sm',
                                        disabled && 'opacity-40 cursor-not-allowed',
                                        active ? 'bg-white/10 text-white' : 'text-white/80'
                                    )
                                }
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="truncate font-medium">{o.label}</span>
                                    {o.value === value && <span className="text-emerald-300 text-xs">✓</span>}
                                </div>
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </Listbox>
        </div>
    );
}

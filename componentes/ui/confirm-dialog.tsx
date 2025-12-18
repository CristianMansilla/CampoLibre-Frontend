'use client';

import { useEffect } from 'react';
import { Card } from '@/componentes/ui/card';
import { Button } from '@/componentes/ui/button';
import { cn } from '@/lib/cn';

type ConfirmDialogProps = {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    closeOnOverlayClick?: boolean;
};

export default function ConfirmDialog({
    open,
    title = 'Confirmar acción',
    description = '¿Estás seguro que querés continuar?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    loading = false,
    danger = false,
    onConfirm,
    onCancel,
    closeOnOverlayClick = true,
}: ConfirmDialogProps) {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
                onClick={() => {
                    if (closeOnOverlayClick && !loading) onCancel();
                }}
            />

            <div className="absolute inset-0 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-6 sm:p-7">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <p className="text-sm text-white/65 mt-2">{description}</p>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={loading}
                            onClick={onCancel}
                        >
                            {cancelText}
                        </Button>

                        <Button
                            type="button"
                            variant={danger ? 'danger' : 'primary'}
                            disabled={loading}
                            onClick={onConfirm}
                            className={cn(danger ? '' : '')}
                        >
                            {loading ? 'Procesando...' : confirmText}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

import { useEffect, useId, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger",
}) => {
    const titleId = useId();
    const descId = useId();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const handleKey = (e) => {
            if (e.key === "Escape" && !isSubmitting) onClose?.();
        };
        window.addEventListener("keydown", handleKey);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, isSubmitting, onClose]);

    const handleConfirm = async () => {
        if (isSubmitting) return;
        try {
            setIsSubmitting(true);
            await onConfirm?.();
            onClose?.();
        } finally {
            setIsSubmitting(false);
        }
    };

    const accent =
        type === "danger"
            ? {
                icon: "bg-red-50 text-red-600",
                button: "bg-red-600 shadow-red-600/20 hover:bg-red-700",
            }
            : {
                icon: "bg-orange-50 text-orange-600",
                button: "bg-orange-600 shadow-orange-600/20 hover:bg-orange-700",
            };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="confirmation-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={isSubmitting ? undefined : onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    aria-describedby={descId}
                >
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.18 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 z-10"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${accent.icon}`}>
                                    <AlertCircle size={24} />
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    aria-label="Close"
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <h3
                                id={titleId}
                                className="text-xl font-black text-slate-900 mb-2 leading-tight"
                            >
                                {title}
                            </h3>
                            <p
                                id={descId}
                                className="text-slate-500 text-sm font-medium leading-relaxed"
                            >
                                {message}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelText}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${accent.button}`}
                            >
                                {isSubmitting ? "Please wait…" : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;

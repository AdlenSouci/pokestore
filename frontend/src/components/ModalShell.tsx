import { createContext, useContext, useEffect, useId, useRef, type ReactNode } from 'react';

const DialogTitleContext = createContext('');

export function useDialogTitleId() {
  return useContext(DialogTitleContext);
}

interface ModalShellProps {
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
}

export function ModalShell({ onClose, children, panelClassName = '' }: ModalShellProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const previousFocus = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm border-0 p-0 cursor-default"
        aria-label="Fermer la fenêtre"
        onClick={onClose}
      />
      <DialogTitleContext.Provider value={titleId}>
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={`relative z-10 outline-none ${panelClassName}`}
        >
          {children}
        </div>
      </DialogTitleContext.Provider>
    </div>
  );
}

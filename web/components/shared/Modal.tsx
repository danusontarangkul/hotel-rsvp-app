'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import Actions from './Actions';
import Button from './Button';
import SectionHeading from './SectionHeading';
import { CloseIcon } from './icons';

type ModalProps = {
  title: string;
  onClose: () => void;
  closeDisabled?: boolean;
  actions: ReactNode;
  children: ReactNode;
};

export default function Modal({
  title,
  onClose,
  closeDisabled = false,
  actions,
  children,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !closeDisabled) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, closeDisabled]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6 outline-none sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <SectionHeading id={titleId}>{title}</SectionHeading>
          <Button
            variant="icon"
            aria-label="Close"
            disabled={closeDisabled}
            onClick={onClose}
          >
            <CloseIcon />
          </Button>
        </div>
        <div className="mb-6">{children}</div>
        <Actions>{actions}</Actions>
      </div>
    </div>
  );
}

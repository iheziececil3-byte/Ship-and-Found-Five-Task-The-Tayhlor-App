'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { TermsContent } from './TermsContent';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';

      const focusableSelector =
        'button:not([disabled]), a[href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

      const getFocusableElements = (): HTMLElement[] => {
        if (!dialogRef.current) return [];
        return Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)
        ).filter(
          (el) => el.offsetParent !== null || el.getClientRects().length > 0
        );
      };

      // Set initial focus inside dialog
      const timer = setTimeout(() => {
        const focusables = getFocusableElements();
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          dialogRef.current?.focus();
        }
      }, 50);

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
          return;
        }

        if (event.key === 'Tab') {
          const focusables = getFocusableElements();
          if (focusables.length === 0) {
            event.preventDefault();
            return;
          }

          const firstElement = focusables[0];
          const lastElement = focusables[focusables.length - 1];

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
        if (previousActiveElementRef.current) {
          previousActiveElementRef.current.focus();
        }
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[85vh] bg-surface rounded-2xl border border-outline-variant shadow-hard flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface">
          <div>
            <h2 id="terms-modal-title" className="font-display font-semibold text-fluid-title text-primary">
              Tayhlor Terms &amp; Conditions
            </h2>
            <p className="text-fluid-badge text-secondary mt-0.5">
              Please read through before creating your customer account
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Terms modal"
            className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-surface-container-low">
          <TermsContent />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-outline-variant bg-surface">
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fluid-badge text-primary underline hover:opacity-80 inline-flex items-center gap-1"
          >
            <span>Open in dedicated page</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial py-2 px-4 rounded-lg border border-outline-variant text-primary text-fluid-label font-medium hover:bg-surface-container transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="flex-1 sm:flex-initial py-2 px-5 rounded-lg bg-primary text-on-primary font-medium text-fluid-label shadow-soft hover:opacity-95 transition-opacity"
            >
              I Agree &amp; Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import React from 'react';
import { useTranslation } from '@/src/i18n/useTranslation';

export type CollapsibleViewProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  helperText?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  rightSlot?: React.ReactNode;
};

export const CollapsibleView: React.FC<CollapsibleViewProps> = ({
  title,
  subtitle,
  helperText,
  isOpen,
  onToggle,
  children,
  className,
  rightSlot,
}) => {
  const { t } = useTranslation();
  const labelKey = isOpen ? 'dashboard.collapseView.collapse' : 'dashboard.collapseView.expand';
  const toggleLabel = t(labelKey) || (isOpen ? 'Collapse view' : 'Expand view');
  const wrapperClassName = ['border rounded-lg bg-white shadow-sm', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={toggleLabel}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <div className="text-lg font-semibold text-gray-900">{title}</div>
          {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
          {helperText && <div className="mt-1 text-xs text-gray-500">{helperText}</div>}
        </div>
        <div className="flex items-center gap-3">
          {rightSlot}
          <span className="sr-only">{toggleLabel}</span>
          <svg
            className={`w-6 h-6 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </button>

      {isOpen && <div className="px-4 pb-4 border-t bg-gray-50">{children}</div>}
    </div>
  );
};

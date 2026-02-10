'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';

export type FeedbackHistoryEntry = {
  id: string;
  note: string;
  createdAt?: Date | string | null;
  createdBy?:
    | string
    | {
        name?: string | null;
        fullName?: string | null;
        email?: string | null;
        id?: string | null;
      }
    | null;
};

export interface FeedbackHistoryPanelProps {
  entries: FeedbackHistoryEntry[];
  title: string;
  caption?: string;
  emptyStateLabel?: string;
  toggleAriaLabel?: string;
  unknownDateLabel?: string;
  reviewerLabel?: string;
  showReviewerName?: boolean;
  enableCarousel?: boolean;
  maxItemsPerSlide?: number;
  previousSlideLabel?: string;
  nextSlideLabel?: string;
  dateFormatter?: (date: Date) => string;
  className?: string;
  panelId?: string;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

const fallbackDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const normalizeDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatReviewerLabel = (value: FeedbackHistoryEntry['createdBy']): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.name || value.fullName || value.email || value.id || null;
};

type NormalizedEntry = {
  id: string;
  note: string;
  createdAt: Date | null;
  createdBy: FeedbackHistoryEntry['createdBy'] | null;
};

export const FeedbackHistoryPanel: React.FC<FeedbackHistoryPanelProps> = ({
  entries,
  title,
  caption,
  emptyStateLabel = 'No feedback has been recorded yet.',
  toggleAriaLabel = 'Toggle feedback history',
  unknownDateLabel = 'Date unavailable',
  reviewerLabel = 'Reviewer',
  showReviewerName = false,
  enableCarousel = false,
  maxItemsPerSlide = 3,
  previousSlideLabel = 'Previous',
  nextSlideLabel = 'Next',
  dateFormatter,
  className = '',
  panelId,
  defaultOpen = true,
  isOpen,
  onToggle,
}) => {
  const resolvedFormatter = dateFormatter ?? fallbackDateFormatter.format.bind(fallbackDateFormatter);
  const generatedId = useId();
  const resolvedPanelId = panelId || `${generatedId}-panel`;
  const isControlled = typeof isOpen === 'boolean';
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!isControlled) {
      setInternalOpen(defaultOpen);
    }
  }, [defaultOpen, isControlled]);

  const open = isControlled ? (isOpen as boolean) : internalOpen;

  const normalizedEntries = useMemo<NormalizedEntry[]>(() => {
    return entries
      .filter((entry) => typeof entry?.note === 'string' && entry.note.trim())
      .map((entry, index) => ({
        id: entry.id || `feedback-entry-${index}`,
        note: entry.note.trim(),
        createdAt: normalizeDate(entry.createdAt),
        createdBy: entry.createdBy ?? null,
      }));
  }, [entries]);

  const chunkSize = Math.max(1, maxItemsPerSlide || 1);

  const slides = useMemo<NormalizedEntry[][]>(() => {
    if (!enableCarousel) return [];
    const chunks: NormalizedEntry[][] = [];
    for (let i = 0; i < normalizedEntries.length; i += chunkSize) {
      chunks.push(normalizedEntries.slice(i, i + chunkSize));
    }
    return chunks;
  }, [enableCarousel, normalizedEntries, chunkSize]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [normalizedEntries.length, enableCarousel, open, chunkSize]);

  const canGoPrevious = currentSlide > 0;
  const canGoNext = enableCarousel && currentSlide < Math.max(0, slides.length - 1);

  const handleToggle = () => {
    const next = !open;
    if (!isControlled) {
      setInternalOpen(next);
    }
    onToggle?.(next);
  };

  const handleSlide = (direction: 'previous' | 'next') => {
    if (direction === 'previous' && canGoPrevious) {
      setCurrentSlide((prev) => Math.max(0, prev - 1));
    }
    if (direction === 'next' && canGoNext) {
      setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
    }
  };

  const panelClasses = ['mt-6 rounded-lg border border-rose-100 bg-rose-50/50', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={panelClasses}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
        aria-controls={resolvedPanelId}
        aria-label={toggleAriaLabel}
      >
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          {caption && <p className="text-xs text-gray-500">{caption}</p>}
        </div>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div id={resolvedPanelId} className="border-t border-rose-100 bg-white/80 px-4 py-4">
          {normalizedEntries.length ? (
            enableCarousel ? (
              <div className="relative">
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {slides.map((slide, slideIndex) => (
                      <div key={`feedback-slide-${slideIndex}`} className="w-full flex-shrink-0 px-1">
                        <div className="grid gap-4">
                          {slide.map((entry) => (
                            <div key={entry.id} className="rounded border border-gray-100 bg-white p-3 shadow-sm">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span>{entry.createdAt ? resolvedFormatter(entry.createdAt) : unknownDateLabel}</span>
                                {showReviewerName && formatReviewerLabel(entry.createdBy) && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span>
                                      {`${reviewerLabel}: ${formatReviewerLabel(entry.createdBy)}`}
                                    </span>
                                  </>
                                )}
                              </div>
                              <p className="mt-2 whitespace-pre-line text-sm text-gray-800">{entry.note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSlide('previous')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow disabled:opacity-40"
                      disabled={!canGoPrevious}
                      aria-label={previousSlideLabel}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSlide('next')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow disabled:opacity-40"
                      disabled={!canGoNext}
                      aria-label={nextSlideLabel}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                {slides.length > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    {slides.map((_, index) => (
                      <span
                        key={`feedback-dot-${index}`}
                        className={`h-2.5 w-2.5 rounded-full ${index === currentSlide ? 'bg-rose-500' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <ul className="space-y-3">
                {normalizedEntries.map((entry) => (
                  <li key={entry.id} className="rounded border border-gray-100 bg-white p-3 shadow-sm">
                    <div className="text-xs text-gray-500">
                      {entry.createdAt ? resolvedFormatter(entry.createdAt) : unknownDateLabel}
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-800">{entry.note}</p>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className="text-sm text-gray-600">{emptyStateLabel}</p>
          )}
        </div>
      )}
    </section>
  );
};

'use client';

import type { HelpFaqEntry } from '@/src/i18n/translations';
import { useTranslation } from '@/src/i18n/useTranslation';

interface FaqSectionProps {
  items: HelpFaqEntry[];
}

export function FaqSection({ items }: FaqSectionProps) {
  const { language } = useTranslation();
  const fallbackMessage = "We're preparing answers. Check back soon.";

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">FAQ</p>
      <h2 className="text-2xl font-bold text-gray-900">Frequently asked questions</h2>
      <div className="mt-6 space-y-6">
        {items.length === 0 && <p className="text-gray-600">{fallbackMessage}</p>}
        {items.map((item) => {
          const question = item.question[language] || item.question.en;
          const paragraphs = item.answers[language] || item.answers.en || [];
          return (
            <article key={item.id} className="border-b border-gray-100 pb-6 last:border-none last:pb-0">
              <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
              <div className="mt-2 space-y-3 text-gray-600">
                {paragraphs.map((paragraph, index) => (
                  <p key={`${item.id}-${language}-${index}`}>{paragraph}</p>
                ))}
                {paragraphs.length === 0 && <p className="italic text-gray-500">{fallbackMessage}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { TranslationOutlined } from '@ant-design/icons';
import { useLanguage } from '@/src/i18n/LanguageContext';
import { Language } from '@/src/i18n/translations';

const languageOptions: Array<{ code: Language; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

type LanguageSwitcherProps = {
  variant?: 'button' | 'menu' | 'pill';
};

export function LanguageSwitcher({ variant = 'button' }: LanguageSwitcherProps = {}) {
  const { language, setLanguage } = useLanguage();
  const activeOption = languageOptions.find((opt) => opt.code === language);

  const handleCycleLanguage = () => {
    const currentIndex = languageOptions.findIndex((opt) => opt.code === language);
    const nextOption = languageOptions[(currentIndex + 1) % languageOptions.length];
    setLanguage(nextOption.code);
  };

  const baseClasses =
    variant === 'menu'
      ? 'w-full px-4 py-2 text-gray-900 hover:bg-gray-100 flex items-center justify-center gap-3 text-sm'
      : variant === 'pill'
        ? 'px-3 py-1 rounded-full border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm'
        : 'px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 hover:bg-gray-50 min-w-[140px] text-sm font-medium flex items-center justify-center gap-3';
  const iconClasses = 'text-gray-500 text-base';

  return (
    <button
      type="button"
      onClick={handleCycleLanguage}
      className={baseClasses}
      aria-label="Change language"
      title="Change language"
    >
      <span className="flex items-center gap-2 text-center">
        <TranslationOutlined className={iconClasses} aria-hidden="true" />
        <span>{activeOption?.label ?? language.toUpperCase()}</span>
      </span>
    </button>
  );
}

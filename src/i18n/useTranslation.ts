import { useLanguage } from '@/src/i18n/LanguageContext';
import { getTranslation } from '@/src/i18n/translations';

export function useTranslation() {
  const { language } = useLanguage();

  return {
    t: (key: string, fallback?: string) => getTranslation(language, key, fallback),
    language,
  };
}

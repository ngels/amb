'use client';

import Link from 'next/link';
import { HomeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { useTranslation } from '@/src/i18n/useTranslation';

type SigninFooterProps = {
  className?: string;
};

const iconButtonStyle =
  'flex flex-col items-center text-gray-600 hover:text-blue-600 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';

export function SigninFooter({ className }: SigninFooterProps) {
  const { t } = useTranslation();

  return (
    <div className={`py-6 ${className || ''}`.trim()}>
      <div className="max-w-md mx-auto flex items-center justify-center gap-8 px-2">
        <Link href="/" className={iconButtonStyle} aria-label={t('signin.homeLink') || 'Go to home'}>
          <HomeOutlined className="text-lg" />
        </Link>
        <div className="h-6 w-px bg-gray-200" aria-hidden="true" />
        <LanguageSwitcher variant="pill" />
        <div className="h-6 w-px bg-gray-200" aria-hidden="true" />
        <a
          href="/help"
          target="_blank"
          rel="noopener noreferrer"
          className={iconButtonStyle}
          aria-label={t('signin.helpLink.aria') || 'Open help in a new tab'}
        >
          <QuestionCircleOutlined className="text-lg" />
        </a>
      </div>
    </div>
  );
}

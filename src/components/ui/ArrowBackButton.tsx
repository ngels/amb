'use client';

import Link from 'next/link';
import React from 'react';

interface ArrowBackButtonProps {
  ariaLabel: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const baseClasses = 'inline-flex items-center justify-center rounded-full p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';

const ArrowBackIcon = () => (
  <svg
    className="w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19 11H7.83l5.58-5.59L12 4 4 12l8 8 1.41-1.41L7.83 13H19v-2z" />
  </svg>
);

export const ArrowBackButton: React.FC<ArrowBackButtonProps> & { ArrowBackIcon: typeof ArrowBackIcon } = ({
  ariaLabel,
  href,
  onClick,
  icon,
  className = '',
}) => {
  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={`${baseClasses} ${className}`.trim()}
      >
        {icon || <ArrowBackIcon />}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`${baseClasses} ${className}`.trim()}
    >
      {icon || <ArrowBackIcon />}
    </button>
  );
};

ArrowBackButton.ArrowBackIcon = ArrowBackIcon;

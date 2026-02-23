'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useTranslation } from '@/src/i18n/useTranslation';
import {
  GRANDPARENT_FIELDS,
  PROFILE_SUMMARY_SECTIONS,
  ProfileSummaryField,
} from './profileSummaryConfig';
import {
  hasGrandparentInfo,
  hasValue,
  normalizeProfileData,
} from './profileDataUtils';
import Image from 'next/image';
import { DEFAULT_PROFILE_PICTURE } from '@/src/utils/profilePicture';

type ProfilePicturePreviewProps = {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
};

const ProfilePicturePreview = ({ src, alt, size = 128, className }: ProfilePicturePreviewProps) => {
  const [imageSrc, setImageSrc] = useState(src || DEFAULT_PROFILE_PICTURE);

  useEffect(() => {
    setImageSrc(src || DEFAULT_PROFILE_PICTURE);
  }, [src]);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      unoptimized
      onError={() => {
        if (imageSrc !== DEFAULT_PROFILE_PICTURE) {
          setImageSrc(DEFAULT_PROFILE_PICTURE);
        }
      }}
    />
  );
};

type StepSectionProps = {
  titleKey: string;
  fields: ProfileSummaryField[];
  data: any;
  t: (key: string) => string;
  notProvidedLabel: string;
};
const StepSection = ({ titleKey, fields, data, t, notProvidedLabel }: StepSectionProps) => {
  const hasSectionContent = fields.some((field) => {
    const rawValue = field.valueGetter ? field.valueGetter(data) : data?.[field.name];
    return hasValue(rawValue);
  });

  if (!hasSectionContent) return null;

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {t(titleKey) || titleKey}
      </h3>
      <div className="bg-white rounded p-4">
        <div className="grid grid-cols-2 gap-6 text-sm">
          {fields.map((field) => {
            const rawValue = field.valueGetter ? field.valueGetter(data) : data?.[field.name];
            const displayValue = hasValue(rawValue) ? String(rawValue) : notProvidedLabel;
            const isPictureField = field.name === 'picture';
            const pictureUrl = isPictureField ? (data?.picture || null) : null;

            if (isPictureField) {
              return (
                <div key={field.name} className="col-span-2 flex flex-col">
                  <p className="text-gray-600 font-medium">{t(field.labelKey) || field.labelKey}</p>
                  <div className="mt-3 h-32 w-32 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <ProfilePicturePreview
                      src={pictureUrl}
                      alt={t('identification.step1.picture') || 'Profile picture'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              );
            }

            return (
              <div key={field.name}>
                <p className="text-gray-600 font-medium">{t(field.labelKey) || field.labelKey}</p>
                <p className="text-gray-900 mt-1">
                  <span className={hasValue(rawValue) ? 'font-semibold' : 'text-gray-400 italic'}>
                    {displayValue}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

type GrandparentDetailsProps = {
  person?: Record<string, any> | null;
  titleKey: string;
  t: (key: string) => string;
  notProvidedLabel: string;
};

const GrandparentDetails = ({ person, titleKey, t, notProvidedLabel }: GrandparentDetailsProps) => {
  if (!hasGrandparentInfo(person)) return null;

  return (
    <div className="mb-4 ml-4">
      <h5 className="text-sm font-medium text-gray-700 mb-3">{t(titleKey) || titleKey}</h5>
      <div className="grid grid-cols-2 gap-4 text-sm">
        {GRANDPARENT_FIELDS.map((field) => {
          const rawValue = person?.[field.key];
          const displayValue = hasValue(rawValue) ? String(rawValue) : notProvidedLabel;
          return (
            <div key={field.key}>
              <p className="text-gray-600 font-medium">{t(field.labelKey) || field.labelKey}</p>
              <p className="text-gray-900 mt-1">
                <span className={hasValue(rawValue) ? 'font-semibold' : 'text-gray-400 italic'}>
                  {displayValue}
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

type GrandparentsSectionProps = {
  data: any;
  t: (key: string) => string;
  notProvidedLabel: string;
};

const GrandparentsSection = ({ data, t, notProvidedLabel }: GrandparentsSectionProps) => {
  const paternalGrandfather = data?.grandpere_pere;
  const paternalGrandmother = data?.grandmere_pere;
  const maternalGrandfather = data?.grandpere_mere;
  const maternalGrandmother = data?.grandmere_mere;

  const hasPaternal = hasGrandparentInfo(paternalGrandfather) || hasGrandparentInfo(paternalGrandmother);
  const hasMaternal = hasGrandparentInfo(maternalGrandfather) || hasGrandparentInfo(maternalGrandmother);

  if (!hasPaternal && !hasMaternal) return null;

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {t('identification.step5.title')}
      </h3>
      <div className="bg-white rounded p-4 space-y-6">
        {hasPaternal && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b">
              {t('identification.step5.block1')}
            </h4>
            <GrandparentDetails
              person={paternalGrandfather}
              titleKey="identification.step5.block1.section1"
              t={t}
              notProvidedLabel={notProvidedLabel}
            />
            <GrandparentDetails
              person={paternalGrandmother}
              titleKey="identification.step5.block1.section2"
              t={t}
              notProvidedLabel={notProvidedLabel}
            />
          </div>
        )}

        {hasMaternal && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b">
              {t('identification.step5.block2')}
            </h4>
            <GrandparentDetails
              person={maternalGrandfather}
              titleKey="identification.step5.block2.section1"
              t={t}
              notProvidedLabel={notProvidedLabel}
            />
            <GrandparentDetails
              person={maternalGrandmother}
              titleKey="identification.step5.block2.section2"
              t={t}
              notProvidedLabel={notProvidedLabel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export type ProfileViewProps = {
  data: any;
  includeId?: boolean;
  className?: string;
};

export function ProfileView({ data, includeId = false, className }: ProfileViewProps) {
  const { t } = useTranslation();
  const normalizedData = useMemo(() => normalizeProfileData(data), [data]);

  if (!normalizedData) return null;

  const notProvidedLabel = t('profile.summary.notProvided') || 'Not provided';
  const classes = ['space-y-6 mb-8', className].filter(Boolean).join(' ');
  const wrapperProps = includeId ? { id: 'profile-content', className: classes } : { className: classes };

  return (
    <div {...wrapperProps}>
      {PROFILE_SUMMARY_SECTIONS.map((section) => (
        <StepSection
          key={section.key}
          titleKey={section.titleKey}
          fields={section.fields}
          data={normalizedData}
          t={t}
          notProvidedLabel={notProvidedLabel}
        />
      ))}
      <GrandparentsSection data={normalizedData} t={t} notProvidedLabel={notProvidedLabel} />
    </div>
  );
}

export default ProfileView;

'use client';

import React, { useMemo } from 'react';
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

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { translations } from '@/src/i18n/translations';
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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#111827',
    position: 'relative',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  seal: {
    width: 80,
    height: 80,
    marginTop: 12,
  },
  photoPlaceholder: {
    width: 113.4,
    height: 113.4,
    borderWidth: 1,
    borderColor: '#6b7280',
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  photoText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#6b7280',
    textTransform: 'uppercase',
    lineHeight: 1.4,
  },
  primarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
    marginBottom: 20,
  },
  primaryFields: {
    flex: 1,
  },
  photoWrapper: {
    width: 140,
    alignItems: 'flex-end',
  },
  section: {
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#d1d5db',
    marginBottom: 20,
    width: '100%',
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  singleColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  field: {
    width: '48%',
    marginBottom: 10,
  },
  fieldFull: {
    width: '100%',
    marginBottom: 10,
  },
  keyValue: {
    fontSize: 12,
    color: '#111827',
  },
  keyLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#4b5563',
  },
  subsectionTitle: {
    fontSize: 12,
    color: '#1f2937',
    marginBottom: 4,
    fontWeight: 600,
  },
  groupBlock: {
    marginBottom: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#4b5563',
  },
  footerText: {
    fontSize: 10,
  },
});

export interface ProfilePdfDocumentProps {
  profile: Record<string, any> | null;
}

const translateFr = (key: string) => translations.fr[key] || key;

const formatLabel = (label: string) => {
  if (!label) return '';
  const trimmed = label.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const getFieldValue = (field: ProfileSummaryField, data: Record<string, any>) =>
  field.valueGetter ? field.valueGetter(data) : data?.[field.name];

const renderGrandparentDetails = (
  person: Record<string, any> | null | undefined,
  titleKey: string,
  notProvidedLabel: string,
) => {
  if (!hasGrandparentInfo(person)) return null;

  return (
    <View key={titleKey} style={styles.groupBlock} wrap={false}>
      <Text style={styles.subsectionTitle}>{translateFr(titleKey) || titleKey}</Text>
      <View style={styles.grid}>
        {GRANDPARENT_FIELDS.map((field) => {
          const rawValue = person?.[field.key];
          const displayValue = hasValue(rawValue) ? String(rawValue) : notProvidedLabel;
          return (
            <View key={`${titleKey}-${field.key}`} style={styles.field}>
              <Text style={styles.keyValue}>
                <Text style={styles.keyLabel}>{formatLabel(translateFr(field.labelKey) || field.labelKey)}</Text>
                {`: ${displayValue}`}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const ProfilePdfDocument: React.FC<ProfilePdfDocumentProps> = ({ profile }) => {
  if (!profile) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>{translateFr('profile.summary.notProvided') || 'Profil indisponible'}</Text>
        </Page>
      </Document>
    );
  }

  const normalizedProfile = normalizeProfileData(profile);
  const notProvidedLabel = translateFr('profile.summary.notProvided') || 'Non fourni';

  const [primarySection, ...otherSections] = PROFILE_SUMMARY_SECTIONS;

  const renderSection = (
    section: { key: string; titleKey: string; fields: ProfileSummaryField[] },
    options?: { singleColumn?: boolean },
  ) => {
    const hasContent = section.fields.some((field) => hasValue(getFieldValue(field, normalizedProfile)));
    if (!hasContent) return null;

    const containerStyle = options?.singleColumn ? styles.singleColumn : styles.grid;
    const fieldStyle = options?.singleColumn ? styles.fieldFull : styles.field;

    return (
      <View key={section.key} style={styles.section} wrap={false}>
        <View style={containerStyle}>
          {section.fields.map((field) => {
            const rawValue = getFieldValue(field, normalizedProfile);
            const displayValue = hasValue(rawValue) ? String(rawValue) : notProvidedLabel;
            return (
              <View key={`${section.key}-${field.name}`} style={fieldStyle}>
                <Text style={styles.keyValue}>
                  <Text style={styles.keyLabel}>{formatLabel(translateFr(field.labelKey) || field.labelKey)}</Text>
                  {`: ${displayValue}`}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderGrandparentGroup = (
    groupTitleKey: string,
    grandfatherTitleKey: string,
    grandmotherTitleKey: string,
    grandfather: Record<string, any> | null | undefined,
    grandmother: Record<string, any> | null | undefined,
  ) => {
    const hasGroupContent = hasGrandparentInfo(grandfather) || hasGrandparentInfo(grandmother);
    if (!hasGroupContent) return null;

    return (
      <View key={groupTitleKey} style={styles.groupBlock} wrap={false}>
        {renderGrandparentDetails(grandfather, grandfatherTitleKey, notProvidedLabel)}
        {renderGrandparentDetails(grandmother, grandmotherTitleKey, notProvidedLabel)}
      </View>
    );
  };

  const hasPaternalGrandparents =
    hasGrandparentInfo(normalizedProfile?.grandpere_pere) || hasGrandparentInfo(normalizedProfile?.grandmere_pere);
  const hasMaternalGrandparents =
    hasGrandparentInfo(normalizedProfile?.grandpere_mere) || hasGrandparentInfo(normalizedProfile?.grandmere_mere);
  const shouldRenderGrandparents = hasPaternalGrandparents || hasMaternalGrandparents;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>FICHE D'IDENTIFICATION SPECIALE</Text>
          <Image src="/leopard.png" style={styles.seal} alt="logo" />
        </View>

        <View style={styles.separator} />

        {primarySection && (
          <View style={styles.primarySection} wrap={false}>
            <View style={styles.primaryFields}>{renderSection(primarySection, { singleColumn: true })}</View>
            <View style={styles.photoWrapper}>
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoText}>
                  Photo 4x4 cm
                  {'\n'}
                  Fond blanc
                </Text>
              </View>
            </View>
          </View>
        )}

        {otherSections.map((section) => renderSection(section))}

        {shouldRenderGrandparents && (
          <View style={styles.section} wrap={false}>
            {renderGrandparentGroup(
              'identification.step5.block1',
              'identification.step5.block1.section1',
              'identification.step5.block1.section2',
              normalizedProfile?.grandpere_pere,
              normalizedProfile?.grandmere_pere,
            )}
            {renderGrandparentGroup(
              'identification.step5.block2',
              'identification.step5.block2.section1',
              'identification.step5.block2.section2',
              normalizedProfile?.grandpere_mere,
              normalizedProfile?.grandmere_mere,
            )}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Fiche d'identification</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

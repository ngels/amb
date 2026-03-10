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
    paddingHorizontal: 24,
    paddingVertical: 36,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#111827',
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  body: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
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
    width: 141.7,
    height: 141.7,
    borderWidth: 1,
    borderColor: '#6b7280',
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    overflow: 'hidden',
  },
  photoText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#6b7280',
    textTransform: 'uppercase',
    lineHeight: 1.4,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 2,
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
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#d1d5db',
    marginBottom: 20,
    width: '100%',
  },
  tableSection: {
    marginBottom: 12,
  },
  tableHeader: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 12,
  },
  tableRowAlt: {
    backgroundColor: '#ffffff',
  },
  tableCell: {
    width: '48%',
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
  grandparentSection: {
    marginTop: 12,
    paddingBottom: 40,
  },
  grandparentGroup: {
    marginBottom: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
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
    <View key={titleKey} style={styles.tableSection} wrap={false}>
      <View style={styles.tableHeader}>
        <Text style={styles.subsectionTitle}>{translateFr(titleKey) || titleKey}</Text>
      </View>
      <View>
        {GRANDPARENT_FIELDS.map((field, index) => {
          const rawValue = person?.[field.key];
          const displayValue = hasValue(rawValue) ? String(rawValue) : notProvidedLabel;
          const rowStyle = index % 2 === 0 ? styles.tableRow : [styles.tableRow, styles.tableRowAlt];
          return (
            <View key={`${titleKey}-${field.key}`} style={rowStyle}>
              <Text style={[styles.keyLabel, { width: '35%' }]}>
                {formatLabel(translateFr(field.labelKey) || field.labelKey)}
              </Text>
              <Text style={[styles.keyValue, { width: '60%', textAlign: 'left', fontSize: 11 }]}>{displayValue}</Text>
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
  const profilePhotoUrl = hasValue(normalizedProfile?.picture) ? normalizedProfile.picture : null;

  const renderSection = (
    section: { key: string; titleKey: string; fields: ProfileSummaryField[] },
    options?: { singleColumn?: boolean; useTable?: boolean; skipNumbering?: boolean },
  ) => {
    const visibleFields = section.fields.filter((field) => field.name !== 'picture');
    const hasContent = visibleFields.some((field) => hasValue(getFieldValue(field, normalizedProfile)));
    if (!hasContent) return null;

    const containerStyle = options?.singleColumn ? styles.singleColumn : styles.grid;
    const fieldStyle = options?.singleColumn ? styles.fieldFull : styles.field;

    return (
      <View key={section.key} style={styles.section} wrap={false}>
        <View style={containerStyle}>
          {visibleFields.map((field, index) => {
            const rawValue = getFieldValue(field, normalizedProfile);
            const displayValue = hasValue(rawValue) ? String(rawValue) : notProvidedLabel;
            const labelText = formatLabel(translateFr(field.labelKey) || field.labelKey);
            const labeledField = labelText;

            if (options?.useTable) {
              const rowStyle = index % 2 === 0 ? styles.tableRow : [styles.tableRow, styles.tableRowAlt];
              return (
                <View key={`${section.key}-${field.name}`} style={rowStyle}>
                  <Text style={[styles.keyLabel, { width: '40%', flexShrink: 0 }]}>{labeledField}</Text>
                  <Text style={[styles.keyValue, { width: '60%', fontSize: 11, textAlign: 'left', flexShrink: 1 }]}>
                    {displayValue}
                  </Text>
                </View>
              );
            }

            return (
              <View key={`${section.key}-${field.name}`} style={fieldStyle}>
                <Text style={styles.keyValue}>
                  <Text style={styles.keyLabel}>{labeledField}</Text>
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
    options?: { breakBefore?: boolean },
  ) => {
    const hasGroupContent = hasGrandparentInfo(grandfather) || hasGrandparentInfo(grandmother);
    if (!hasGroupContent) return null;
    const breakBefore = options?.breakBefore ?? false;

    return (
      <View key={groupTitleKey} style={styles.grandparentGroup} wrap={false} break={breakBefore}>
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
        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={styles.title}>FICHE D'IDENTIFICATION SPECIALE</Text>
            <Image src="/leopard.png" style={styles.seal} />
          </View>

          <View style={styles.separator} />

          {primarySection && (
            <View style={styles.primarySection} wrap={false}>
              <View style={styles.primaryFields}>{renderSection(primarySection, { singleColumn: true, useTable: true })}</View>
              <View style={styles.photoWrapper}>
                <View style={styles.photoPlaceholder}>
                  {profilePhotoUrl ? (
                    <Image src={profilePhotoUrl} style={styles.photoImage} />
                  ) : (
                    <Text style={styles.photoText}>
                      Photo 4x4 cm
                      {'\n'}
                      Fond blanc
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {otherSections.map((section) => (
            <View key={section.key} style={styles.tableSection} wrap={false}>
              {renderSection(section, { useTable: true })}
            </View>
          ))}

          {shouldRenderGrandparents && (() => {
            const groups: React.ReactNode[] = [];
            if (hasPaternalGrandparents) {
              const group = renderGrandparentGroup(
                'identification.step5.block1',
                'identification.step5.block1.section1',
                'identification.step5.block1.section2',
                normalizedProfile?.grandpere_pere,
                normalizedProfile?.grandmere_pere,
              );
              if (group) groups.push(group);
            }
            if (hasMaternalGrandparents) {
              const group = renderGrandparentGroup(
                'identification.step5.block2',
                'identification.step5.block2.section1',
                'identification.step5.block2.section2',
                normalizedProfile?.grandpere_mere,
                normalizedProfile?.grandmere_mere,
                { breakBefore: groups.length > 0 },
              );
              if (group) groups.push(group);
            }
            return groups.length ? (
              <View style={styles.grandparentSection} break>
                {groups}
              </View>
            ) : null;
          })()}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Fiche d'identification</Text>
            <Text
              style={styles.footerText}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
};

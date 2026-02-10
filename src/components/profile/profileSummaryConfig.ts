import { subjectQualityLabel } from '@/src/constants/subjectQuality';

export type ProfileSummaryField = {
  name: string;
  labelKey: string;
  valueGetter?: (data: any) => string | number | null;
};

export type ProfileSummarySection = {
  key: string;
  titleKey: string;
  fields: ProfileSummaryField[];
};

export const PROFILE_SUMMARY_SECTIONS: ProfileSummarySection[] = [
  {
    key: 'personal',
    titleKey: 'identification.step1.title',
    fields: [
      { name: 'firstName', labelKey: 'identification.step1.firstName' },
      { name: 'givenName', labelKey: 'identification.step1.givenName' },
      { name: 'lastName', labelKey: 'identification.step1.lastName' },
      {
        name: 'type_of_profile',
        labelKey: 'identification.step1.subjectQuality',
        valueGetter: (profile) => subjectQualityLabel(profile?.type_of_profile) || profile?.type_of_profile || null,
      },
      { name: 'gender', labelKey: 'identification.step1.gender' },
      { name: 'bloodType', labelKey: 'identification.step1.bloodType' },
      { name: 'nsi', labelKey: 'identification.step1.nsi' },
      { name: 'dateOfBirth', labelKey: 'identification.step1.dateOfBirth' },
      { name: 'placeOfBirth', labelKey: 'identification.step1.placeOfBirth' },
    ],
  },
  {
    key: 'origin',
    titleKey: 'identification.step2.title',
    fields: [
      { name: 'tribe', labelKey: 'identification.step2.tribe' },
      { name: 'villageOfOrigin', labelKey: 'identification.step2.villageOfOrigin' },
      { name: 'group', labelKey: 'identification.step2.group' },
      { name: 'sector', labelKey: 'identification.step2.sector' },
      { name: 'district', labelKey: 'identification.step2.district' },
      { name: 'province', labelKey: 'identification.step2.province' },
      { name: 'nationality', labelKey: 'identification.step2.nationality' },
    ],
  },
  {
    key: 'familyEducation',
    titleKey: 'identification.step3.title',
    fields: [
      { name: 'maritalStatus', labelKey: 'identification.step3.maritalStatus' },
      { name: 'spouse', labelKey: 'identification.step3.spouse' },
      { name: 'level_of_education', labelKey: 'identification.step3.level_of_education' },
      { name: 'institution', labelKey: 'identification.step3.institution' },
      { name: 'year', labelKey: 'identification.step3.year' },
      { name: 'residence', labelKey: 'identification.step3.residence' },
      { name: 'home', labelKey: 'identification.step3.home' },
    ],
  },
  {
    key: 'employmentContact',
    titleKey: 'identification.step4.title',
    fields: [
      {
        name: 'criminal_or_security_background',
        labelKey: 'identification.step4.criminalOrSecurityBackground',
      },
      { name: 'military_service', labelKey: 'identification.step4.militaryService' },
      { name: 'occupation_and_position', labelKey: 'identification.step4.occupationAndPosition' },
      { name: 'email', labelKey: 'identification.step4.email' },
      {
        name: 'phone_number',
        labelKey: 'identification.step4.phone',
        valueGetter: (profile) => {
          if (!profile?.phone_number) return null;
          const code = profile.phone_country_code || '';
          return `${code}${profile.phone_number}`;
        },
      },
    ],
  },
];

export type GrandparentFieldConfig = {
  key: string;
  labelKey: string;
};

export const GRANDPARENT_FIELDS: GrandparentFieldConfig[] = [
  { key: 'first_name', labelKey: 'identification.step5.names' },
  { key: 'group', labelKey: 'identification.step5.group' },
  { key: 'sector', labelKey: 'identification.step5.secteur' },
  { key: 'territory', labelKey: 'identification.step5.territory' },
  { key: 'district', labelKey: 'identification.step5.district' },
  { key: 'province', labelKey: 'identification.step5.province' },
  { key: 'country', labelKey: 'identification.step5.country' },
];

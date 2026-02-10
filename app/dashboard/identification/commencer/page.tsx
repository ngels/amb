'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardNav } from '@/src/components/ui/DashboardNav';
import { useTranslation } from '@/src/i18n/useTranslation';
import { updateProfile, getProfile, getProfileById } from '@/src/services/profileService';
import { COUNTRY_PHONE_CODES } from '@/src/constants/countryCodes';
import { PROVINCE_OPTIONS, getTerritoryOptions } from '@/src/constants/provinces';
import { SUBJECT_QUALITY_OPTIONS } from '@/src/constants/subjectQuality';
import { useAuth } from '@/src/hooks/useAuth';
import { ArrowBackButton } from '@/src/components/ui/ArrowBackButton';

interface FormData {
  firstName: string;
  givenName: string;
  lastName: string;
  gender: string;
  bloodType: string;
  nsi: string;
  dateOfBirth: string;
  placeOfBirth: string;
  tribe: string;
  villageOfOrigin: string;
  group: string;
  sector: string;
  district: string;
  territory: string;
  province: string;
  nationality: string;
  maritalStatus: string;
  spouse: string;
  level_of_education: string;
  institution: string;
  year: string;
  residence: string;
  home: string;
  criminal_or_security_background: string;
  military_service: string;
  occupation_and_position: string;
  phone_country_code: string;
  phone_number: string;
  email: string;
  picture: string;
  type_of_profile: string;
  // Step 5 - Block 1 (Paternal Grandparents) - Section 1 (Grandfather)
  gp_paternal_gf_names: string;
  gp_paternal_gf_givenName: string;
  gp_paternal_gf_group: string;
  gp_paternal_gf_secteur: string;
  gp_paternal_gf_territory: string;
  gp_paternal_gf_district: string;
  gp_paternal_gf_province: string;
  gp_paternal_gf_country: string;
  // Step 5 - Block 1 (Paternal Grandparents) - Section 2 (Grandmother)
  gp_paternal_gm_names: string;
  gp_paternal_gm_givenName: string;
  gp_paternal_gm_group: string;
  gp_paternal_gm_secteur: string;
  gp_paternal_gm_territory: string;
  gp_paternal_gm_district: string;
  gp_paternal_gm_province: string;
  gp_paternal_gm_country: string;
  // Step 5 - Block 2 (Maternal Grandparents) - Section 1 (Grandfather)
  gp_maternal_gf_names: string;
  gp_maternal_gf_givenName: string;
  gp_maternal_gf_group: string;
  gp_maternal_gf_secteur: string;
  gp_maternal_gf_territory: string;
  gp_maternal_gf_district: string;
  gp_maternal_gf_province: string;
  gp_maternal_gf_country: string;
  // Step 5 - Block 2 (Maternal Grandparents) - Section 2 (Grandmother)
  gp_maternal_gm_names: string;
  gp_maternal_gm_givenName: string;
  gp_maternal_gm_group: string;
  gp_maternal_gm_secteur: string;
  gp_maternal_gm_territory: string;
  gp_maternal_gm_district: string;
  gp_maternal_gm_province: string;
  gp_maternal_gm_country: string;
}

interface FieldConfig {
  name: keyof FormData;
  type: 'text' | 'datepicker' | 'select' | 'file';
  labelKey: string;
  required: boolean;
  helperKey?: string;
  options?: { label: string; value: string }[];
  condition?: (formData: FormData) => boolean; // Function to determine if field should be visible
  accept?: string;
}

const MAX_PICTURE_SIZE_BYTES = 250 * 1024; // 250 KB
const ALLOWED_PICTURE_MIME_TYPES = ['image/jpeg', 'image/png'];
const PICTURE_UPLOAD_ENDPOINT = '/api/profile-picture-upload';
const getFieldDisplayValue = (fieldConfig: FieldConfig, data: FormData) => {
  const value = data[fieldConfig.name];
  if (!value) return '';
  if (fieldConfig.type === 'select' && fieldConfig.options) {
    const matched = fieldConfig.options.find((option) => option.value === value);
    return matched?.label || value;
  }
  return value;
};

const STEPS = [
  {
    number: 1,
    titleKey: 'identification.step1.title',
    fields: [
      {
        name: 'type_of_profile',
        type: 'select',
        labelKey: 'identification.step1.subjectQuality',
        helperKey: 'identification.step1.subjectQualityHelper',
        required: true,
        options: SUBJECT_QUALITY_OPTIONS,
      },
      { name: 'firstName', type: 'text', labelKey: 'identification.step1.firstName', required: true },
      { name: 'givenName', type: 'text', labelKey: 'identification.step1.givenName', required: false, helperKey: 'identification.step1.givenNameHelper' },
      { name: 'lastName', type: 'text', labelKey: 'identification.step1.lastName', required: false },  
      {
        name: 'picture',
        type: 'file',
        labelKey: 'identification.step1.picture',
        required: false,
        helperKey: 'identification.step1.pictureHelper',
        accept: '.jpg,.jpeg,.png',
      },
      {
        name: 'gender',
        type: 'select',
        labelKey: 'identification.step1.gender',
        required: true,
        options: [
          { label: 'Feminin (Female)', value: 'F' },
          { label: 'Masculin (Male)', value: 'M' },
        ],
      },
      {
        name: 'bloodType',
        type: 'select',
        labelKey: 'identification.step1.bloodType',
        required: false,
        options: [
          { label: 'A+', value: 'A+' },
          { label: 'A-', value: 'A-' },
          { label: 'B+', value: 'B+' },
          { label: 'B-', value: 'B-' },
          { label: 'AB+', value: 'AB+' },
          { label: 'AB-', value: 'AB-' },
          { label: 'O+', value: 'O+' },
          { label: 'O-', value: 'O-' },
        ],
      },
      { name: 'nsi', type: 'text', labelKey: 'identification.step1.nsi', required: false },
      { name: 'dateOfBirth', type: 'datepicker', labelKey: 'identification.step1.dateOfBirth', required: true },
      { name: 'placeOfBirth', type: 'text', labelKey: 'identification.step1.placeOfBirth', required: true },
    ] as FieldConfig[],
  },
  {
    number: 2,
    titleKey: 'identification.step2.title',
    fields: [
      {
        name: 'nationality',
        type: 'select',
        labelKey: 'identification.step2.nationality',
        required: false,
        options: [
          { label: 'Originaire', value: 'originaire' },
          { label: 'Naturalisé(e)', value: 'naturaliser' },
          // { label: 'OPT', value: 'opt' },
          { label: 'Adoptive', value: 'adoptive' },
        ],
      },
      {
        name: 'province',
        type: 'select',
        labelKey: 'identification.step2.province',
        required: false,
        options: PROVINCE_OPTIONS,
      },
      {
        name: 'territory',
        type: 'select',
        labelKey: 'identification.step2.territory',
        required: false,
      },
      { name: 'district', type: 'text', labelKey: 'identification.step2.district', required: false },
      { name: 'group', type: 'text', labelKey: 'identification.step2.group', required: false },
      { name: 'sector', type: 'text', labelKey: 'identification.step2.sector', required: false },
      { name: 'villageOfOrigin', type: 'text', labelKey: 'identification.step2.villageOfOrigin', required: false },
      { name: 'tribe', type: 'text', labelKey: 'identification.step2.tribe', required: false },
    ] as FieldConfig[],
  },
  {
    number: 3,
    titleKey: 'identification.step3.title',
    fields: [
      {
        name: 'maritalStatus',
        type: 'select',
        labelKey: 'identification.step3.maritalStatus',
        required: true,
        options: [
          { label: 'Célibataire', value: 'celibataire' },
          { label: 'Marié(e)', value: 'marie' },
          { label: 'Veuf(ve)', value: 'veuf' },
          { label: 'Divorcé(e)', value: 'divorcee' },
        ],
      },
      {
        name: 'spouse',
        type: 'text',
        labelKey: 'identification.step3.spouse',
        required: false,
        condition: (data) => data.maritalStatus === 'marie',
      },
      {
        name: 'level_of_education',
        type: 'select',
        labelKey: 'identification.step3.level_of_education',
        required: true,
        options: [
          { label: 'Diplôme', value: 'diplôme' },
          { label: 'Licencié(e)', value: 'licencie' },
          { label: 'Master', value: 'master' },
          { label: 'Docteur', value: 'docteur' },
          { label: 'Autre', value: 'autre' },
        ],
      },
      {
        name: 'institution',
        type: 'text',
        labelKey: 'identification.step3.institution',
        required: false,
        condition: (data) => data.level_of_education !== 'autre' && data.level_of_education !== '',
      },
      {
        name: 'year',
        type: 'datepicker',
        labelKey: 'identification.step3.year',
        required: false,
        condition: (data) => data.level_of_education !== 'autre' && data.level_of_education !== '',
      },
      { name: 'residence', type: 'text', labelKey: 'identification.step3.residence', required: false },
      { name: 'home', type: 'text', labelKey: 'identification.step3.home', required: false },
    ] as FieldConfig[],
  },
  {
    number: 4,
    titleKey: 'identification.step4.title',
    fields: [
      {
        name: 'criminal_or_security_background',
        type: 'select',
        labelKey: 'identification.step4.criminalOrSecurityBackground',
        required: true,
        options: [
          { label: 'Ase', value: 'ase' },
          { label: 'DDP', value: 'ddp' },
          { label: 'VMA', value: 'vma' },
          { label: 'RCH', value: 'rch' },
          { label: 'Autres', value: 'autres' },
        ],
      },
      {
        name: 'military_service',
        type: 'text',
        labelKey: 'identification.step4.militaryService',
        required: false,
      },
      {
        name: 'occupation_and_position',
        type: 'text',
        labelKey: 'identification.step4.occupationAndPosition',
        required: false,
      },
      {
        name: 'phone_number',
        type: 'text',
        labelKey: 'identification.step4.phoneNumber',
        required: false,
      },
      {
        name: 'email',
        type: 'text',
        labelKey: 'identification.step4.email',
        required: true,
      },
    ] as FieldConfig[],
  },
  {
    number: 5,
    titleKey: 'identification.step5.title',
    blocks: [
      {
        blockNumber: 1,
        blockTitleKey: 'identification.step5.block1',
        sections: [
          {
            sectionNumber: 1,
            sectionTitleKey: 'identification.step5.block1.section1',
            fields: [
              { name: 'gp_paternal_gf_names', type: 'text', labelKey: 'identification.step5.names', required: true },
              { name: 'gp_paternal_gf_givenName', type: 'text', labelKey: 'identification.step5.givenName', required: false },
              { name: 'gp_paternal_gf_group', type: 'text', labelKey: 'identification.step5.group', required: false },
              { name: 'gp_paternal_gf_secteur', type: 'text', labelKey: 'identification.step5.secteur', required: false },
              { name: 'gp_paternal_gf_territory', type: 'text', labelKey: 'identification.step5.territory', required: false },
              { name: 'gp_paternal_gf_district', type: 'text', labelKey: 'identification.step5.district', required: false },
              { name: 'gp_paternal_gf_province', type: 'text', labelKey: 'identification.step5.province', required: false },
              { name: 'gp_paternal_gf_country', type: 'text', labelKey: 'identification.step5.country', required: true },
            ] as FieldConfig[],
          },
          {
            sectionNumber: 2,
            sectionTitleKey: 'identification.step5.block1.section2',
            fields: [
              { name: 'gp_paternal_gm_names', type: 'text', labelKey: 'identification.step5.names', required: true },
              { name: 'gp_paternal_gm_givenName', type: 'text', labelKey: 'identification.step5.givenName', required: false },
              { name: 'gp_paternal_gm_group', type: 'text', labelKey: 'identification.step5.group', required: false },
              { name: 'gp_paternal_gm_secteur', type: 'text', labelKey: 'identification.step5.secteur', required: false },
              { name: 'gp_paternal_gm_territory', type: 'text', labelKey: 'identification.step5.territory', required: false },
              { name: 'gp_paternal_gm_district', type: 'text', labelKey: 'identification.step5.district', required: false },
              { name: 'gp_paternal_gm_province', type: 'text', labelKey: 'identification.step5.province', required: false },
              { name: 'gp_paternal_gm_country', type: 'text', labelKey: 'identification.step5.country', required: true },
            ] as FieldConfig[],
          },
        ],
      },
      {
        blockNumber: 2,
        blockTitleKey: 'identification.step5.block2',
        sections: [
          {
            sectionNumber: 1,
            sectionTitleKey: 'identification.step5.block2.section1',
            fields: [
              { name: 'gp_maternal_gf_names', type: 'text', labelKey: 'identification.step5.names', required: true },
              { name: 'gp_maternal_gf_givenName', type: 'text', labelKey: 'identification.step5.givenName', required: false },
              { name: 'gp_maternal_gf_group', type: 'text', labelKey: 'identification.step5.group', required: false },
              { name: 'gp_maternal_gf_secteur', type: 'text', labelKey: 'identification.step5.secteur', required: false },
              { name: 'gp_maternal_gf_territory', type: 'text', labelKey: 'identification.step5.territory', required: false },
              { name: 'gp_maternal_gf_district', type: 'text', labelKey: 'identification.step5.district', required: false },
              { name: 'gp_maternal_gf_province', type: 'text', labelKey: 'identification.step5.province', required: false },
              { name: 'gp_maternal_gf_country', type: 'text', labelKey: 'identification.step5.country', required: true },
            ] as FieldConfig[],
          },
          {
            sectionNumber: 2,
            sectionTitleKey: 'identification.step5.block2.section2',
            fields: [
              { name: 'gp_maternal_gm_names', type: 'text', labelKey: 'identification.step5.names', required: true },
              { name: 'gp_maternal_gm_givenName', type: 'text', labelKey: 'identification.step5.givenName', required: false },
              { name: 'gp_maternal_gm_group', type: 'text', labelKey: 'identification.step5.group', required: false },
              { name: 'gp_maternal_gm_secteur', type: 'text', labelKey: 'identification.step5.secteur', required: false },
              { name: 'gp_maternal_gm_territory', type: 'text', labelKey: 'identification.step5.territory', required: false },
              { name: 'gp_maternal_gm_district', type: 'text', labelKey: 'identification.step5.district', required: false },
              { name: 'gp_maternal_gm_province', type: 'text', labelKey: 'identification.step5.province', required: false },
              { name: 'gp_maternal_gm_country', type: 'text', labelKey: 'identification.step5.country', required: true },
            ] as FieldConfig[],
          },
        ],
      },
    ],
  },
];

const normalizePermissions = (value: any): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return normalizePermissions(JSON.parse(trimmed));
      } catch (e) {
        return value;
      }
    }
    return value;
  }
  if (typeof value === 'object') {
    const maybeRole = (value as Record<string, any>).role || (value as Record<string, any>).name;
    return typeof maybeRole === 'string' ? maybeRole : null;
  }
  return null;
};

export default function CommencerPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  useAuth();
  const profileIdParam = searchParams?.get('profileId');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    givenName: '',
    lastName: '',
    gender: '',
    bloodType: '',
    nsi: '',
    dateOfBirth: '',
    placeOfBirth: '',
    tribe: '',
    villageOfOrigin: '',
    group: '',
    sector: '',
    district: '',
    territory: '',
    province: '',
    nationality: '',
    maritalStatus: '',
    spouse: '',
    level_of_education: '',
    institution: '',
    year: '',
    residence: '',
    home: '',
    criminal_or_security_background: '',
    military_service: '',
    occupation_and_position: '',
    phone_country_code: '+243',
    phone_number: '',
    email: '',
    picture: '',
    type_of_profile: '',
    // Step 5 fields
    gp_paternal_gf_names: '',
    gp_paternal_gf_givenName: '',
    gp_paternal_gf_group: '',
    gp_paternal_gf_secteur: '',
    gp_paternal_gf_territory: '',
    gp_paternal_gf_district: '',
    gp_paternal_gf_province: '',
    gp_paternal_gf_country: '',
    gp_paternal_gm_names: '',
    gp_paternal_gm_givenName: '',
    gp_paternal_gm_group: '',
    gp_paternal_gm_secteur: '',
    gp_paternal_gm_territory: '',
    gp_paternal_gm_district: '',
    gp_paternal_gm_province: '',
    gp_paternal_gm_country: '',
    gp_maternal_gf_names: '',
    gp_maternal_gf_givenName: '',
    gp_maternal_gf_group: '',
    gp_maternal_gf_secteur: '',
    gp_maternal_gf_territory: '',
    gp_maternal_gf_district: '',
    gp_maternal_gf_province: '',
    gp_maternal_gf_country: '',
    gp_maternal_gm_names: '',
    gp_maternal_gm_givenName: '',
    gp_maternal_gm_group: '',
    gp_maternal_gm_secteur: '',
    gp_maternal_gm_territory: '',
    gp_maternal_gm_district: '',
    gp_maternal_gm_province: '',
    gp_maternal_gm_country: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReview, setIsReview] = useState(false);
  const [missingRequiredFields, setMissingRequiredFields] = useState<Set<string>>(new Set());
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<string | null>(null);
  const [pictureUploading, setPictureUploading] = useState(false);
  const [pictureError, setPictureError] = useState<string | null>(null);
  const [picturePreviewUrl, setPicturePreviewUrl] = useState<string | null>(null);
  const picturePreviewUrlRef = useRef<string | null>(null);
  const clearPicturePreview = useCallback(() => {
    if (picturePreviewUrlRef.current) {
      URL.revokeObjectURL(picturePreviewUrlRef.current);
      picturePreviewUrlRef.current = null;
    }
    setPicturePreviewUrl(null);
  }, []);

  const submitDisabledCopy =
    t('identification.submitDisabled') || 'Submission is disabled for the current profile status.';
  const isNormalUser = permissions === 'user';
  const shouldDisableSubmit =
    isNormalUser && ['1', '3', '4'].includes(profileCompletion ?? '');

  const getCachedEditingProfile = () => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = sessionStorage.getItem('editingProfile');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  };

  const syncProfileCompletion = useCallback(() => {
    if (typeof window === 'undefined') {
      setProfileCompletion(null);
      return;
    }
    try {
      const stored = localStorage.getItem('profileCompleteStatus');
      setProfileCompletion(stored);
    } catch (e) {
      setProfileCompletion(null);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('userPermissions') : null;
      setPermissions(normalizePermissions(stored));
    } catch (e) {
      setPermissions(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPicturePreview();
    };
  }, [clearPicturePreview]);

  useEffect(() => {
    syncProfileCompletion();
  }, [syncProfileCompletion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleCustom = () => syncProfileCompletion();
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'profileCompleteStatus') {
        syncProfileCompletion();
      }
    };

    window.addEventListener('profile-completion-changed', handleCustom as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('profile-completion-changed', handleCustom as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncProfileCompletion]);

  const populateFormFromProfile = (profile: any) => {
    if (!profile) return;

    let phoneCountryCode = '+243';
    let phoneNumber = '';
    if (profile.phone_number) {
      const fullPhone = profile.phone_number.toString();
      const matchedCountry = COUNTRY_PHONE_CODES.find((c) => fullPhone.startsWith(c.code));
      if (matchedCountry) {
        phoneCountryCode = matchedCountry.code;
        phoneNumber = fullPhone.substring(matchedCountry.code.length);
      } else {
        phoneNumber = fullPhone;
      }
    }

    setCurrentProfileId(profile._id || profile.id || profileIdParam || null);

    setFormData((prev) => ({
      ...prev,
      firstName: profile.firstName || '',
      givenName: profile.givenName || '',
      lastName: profile.lastName || '',
      gender: profile.gender || '',
      bloodType: profile.bloodType || '',
      nsi: profile.nsi || '',
      dateOfBirth: profile.dateOfBirth || '',
      placeOfBirth: profile.placeOfBirth || '',
      tribe: profile.tribe || '',
      villageOfOrigin: profile.villageOfOrigin || '',
      group: profile.group || '',
      sector: profile.sector || '',
      district: profile.district || '',
      territory: profile.territory || '',
      province: profile.province || '',
      nationality: profile.nationality || '',
      type_of_profile: profile.type_of_profile ? String(profile.type_of_profile) : '',
      maritalStatus: profile.maritalStatus || '',
      spouse: profile.spouse || '',
      level_of_education: profile.level_of_education || '',
      institution: profile.institution || '',
      year: profile.year || '',
      residence: profile.residence || '',
      home: profile.home || '',
      criminal_or_security_background: profile.criminal_or_security_background || '',
      military_service: profile.military_service || '',
      occupation_and_position: profile.occupation_and_position || '',
      phone_country_code: phoneCountryCode,
      phone_number: phoneNumber,
      email: profile.email || '',
      picture: profile.picture || '',
      gp_paternal_gf_names: profile.grandpere_pere?.first_name || profile.gp_paternal_gf_names || '',
      gp_paternal_gf_givenName: profile.grandpere_pere?.given_name || profile.gp_paternal_gf_givenName || '',
      gp_paternal_gf_group: profile.grandpere_pere?.group || profile.gp_paternal_gf_group || '',
      gp_paternal_gf_secteur: profile.grandpere_pere?.sector || profile.gp_paternal_gf_secteur || '',
      gp_paternal_gf_territory: profile.grandpere_pere?.territory || profile.gp_paternal_gf_territory || '',
      gp_paternal_gf_district: profile.grandpere_pere?.district || profile.gp_paternal_gf_district || '',
      gp_paternal_gf_province: profile.grandpere_pere?.province || profile.gp_paternal_gf_province || '',
      gp_paternal_gf_country: profile.grandpere_pere?.country || profile.gp_paternal_gf_country || '',
      gp_paternal_gm_names: profile.grandmere_pere?.first_name || profile.gp_paternal_gm_names || '',
      gp_paternal_gm_givenName: profile.grandmere_pere?.given_name || profile.gp_paternal_gm_givenName || '',
      gp_paternal_gm_group: profile.grandmere_pere?.group || profile.gp_paternal_gm_group || '',
      gp_paternal_gm_secteur: profile.grandmere_pere?.sector || profile.gp_paternal_gm_secteur || '',
      gp_paternal_gm_territory: profile.grandmere_pere?.territory || profile.gp_paternal_gm_territory || '',
      gp_paternal_gm_district: profile.grandmere_pere?.district || profile.gp_paternal_gm_district || '',
      gp_paternal_gm_province: profile.grandmere_pere?.province || profile.gp_paternal_gm_province || '',
      gp_paternal_gm_country: profile.grandmere_pere?.country || profile.gp_paternal_gm_country || '',
      gp_maternal_gf_names: profile.grandpere_mere?.first_name || profile.gp_maternal_gf_names || '',
      gp_maternal_gf_givenName: profile.grandpere_mere?.given_name || profile.gp_maternal_gf_givenName || '',
      gp_maternal_gf_group: profile.grandpere_mere?.group || profile.gp_maternal_gf_group || '',
      gp_maternal_gf_secteur: profile.grandpere_mere?.sector || profile.gp_maternal_gf_secteur || '',
      gp_maternal_gf_territory: profile.grandpere_mere?.territory || profile.gp_maternal_gf_territory || '',
      gp_maternal_gf_district: profile.grandpere_mere?.district || profile.gp_maternal_gf_district || '',
      gp_maternal_gf_province: profile.grandpere_mere?.province || profile.gp_maternal_gf_province || '',
      gp_maternal_gf_country: profile.grandpere_mere?.country || profile.gp_maternal_gf_country || '',
      gp_maternal_gm_names: profile.grandmere_mere?.first_name || profile.gp_maternal_gm_names || '',
      gp_maternal_gm_givenName: profile.grandmere_mere?.given_name || profile.gp_maternal_gm_givenName || '',
      gp_maternal_gm_group: profile.grandmere_mere?.group || profile.gp_maternal_gm_group || '',
      gp_maternal_gm_secteur: profile.grandmere_mere?.sector || profile.gp_maternal_gm_secteur || '',
      gp_maternal_gm_territory: profile.grandmere_mere?.territory || profile.gp_maternal_gm_territory || '',
      gp_maternal_gm_district: profile.grandmere_mere?.district || profile.gp_maternal_gm_district || '',
      gp_maternal_gm_province: profile.grandmere_mere?.province || profile.gp_maternal_gf_province || '',
      gp_maternal_gm_country: profile.grandmere_mere?.country || profile.gp_maternal_gm_country || '',
    }));

    clearPicturePreview();
    setPictureError(null);

    const completionRaw = profile?.complete ?? profile?.status ?? null;
    const normalizedCompletion =
      completionRaw === undefined || completionRaw === null ? null : String(completionRaw);
    setProfileCompletion(normalizedCompletion);
    if (typeof window !== 'undefined') {
      try {
        if (normalizedCompletion === null) {
          localStorage.removeItem('profileCompleteStatus');
        } else {
          localStorage.setItem('profileCompleteStatus', normalizedCompletion);
        }
        window.dispatchEvent(new Event('profile-completion-changed'));
      } catch (e) {}
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileIdParam) {
        if (permissions === null) return; // wait for permissions to resolve
        if (permissions !== 'user') {
          setCurrentProfileId(null);
          return;
        }
      }

      setError(null);
      try {
        let profileData: any = null;
        if (profileIdParam) {
          profileData = getCachedEditingProfile();
          if (!profileData) {
            const response = await getProfileById(profileIdParam);
            profileData = response?.data || response;
          }
        } else {
          const response = await getProfile();
          profileData = response?.data;
        }

        if (profileData) {
          populateFormFromProfile(profileData);
          try {
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('editingProfile');
            }
          } catch (e) {}
        } else if (!profileIdParam) {
          console.log('No existing profile found');
        }
      } catch (e) {
        console.log('Error loading profile:', e);
      }
    };

    loadProfile();
  }, [profileIdParam, permissions]);

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [fieldName]: value,
      };

      if (fieldName === 'province') {
        const availableTerritories = getTerritoryOptions(value).map((opt) => opt.value);
        if (prev.territory && !availableTerritories.includes(prev.territory)) {
          updated.territory = '';
        }
      }

      return updated;
    });
    // Clear error for this field if it was previously missing
    setMissingRequiredFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });
  };

  const handlePictureClear = () => {
    clearPicturePreview();
    setPictureError(null);
    handleInputChange('picture', '');
  };

  const handlePictureFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_PICTURE_MIME_TYPES.includes(file.type)) {
      setPictureError(
        t('identification.step1.pictureFormatError') || 'Only JPG and PNG images are allowed.',
      );
      event.target.value = '';
      clearPicturePreview();
      handleInputChange('picture', '');
      return;
    }

    if (file.size > MAX_PICTURE_SIZE_BYTES) {
      setPictureError(t('identification.step1.pictureSizeError') || 'Image must be 250 KB or smaller.');
      event.target.value = '';
      clearPicturePreview();
      handleInputChange('picture', '');
      return;
    }

    clearPicturePreview();
    const previewUrl = URL.createObjectURL(file);
    picturePreviewUrlRef.current = previewUrl;
    setPicturePreviewUrl(previewUrl);
    setPictureUploading(true);
    setPictureError(null);

    try {
      const payload = new globalThis.FormData();
      payload.append('file', file);
      const response = await fetch(PICTURE_UPLOAD_ENDPOINT, {
        method: 'POST',
        body: payload,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error || 'Failed to upload picture.');
      }
      if (!body?.path) {
        throw new Error('Upload completed but no file path was returned.');
      }
      handleInputChange('picture', body.path);
    } catch (uploadErr: any) {
      clearPicturePreview();
      handleInputChange('picture', '');
      setPictureError(uploadErr?.message || 'Failed to upload picture.');
    } finally {
      setPictureUploading(false);
      event.target.value = '';
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const step = STEPS[stepNumber - 1];
    const missing = new Set<string>();

    // Handle blocks (Step 5)
    if ((step as any).blocks) {
      (step as any).blocks.forEach((block: any) => {
        block.sections.forEach((section: any) => {
          section.fields.forEach((fieldConfig: FieldConfig) => {
            if (fieldConfig.required) {
              const value = formData[fieldConfig.name];
              if (!value || value.trim() === '') {
                missing.add(fieldConfig.name);
              }
            }
          });
        });
      });
    } else {
      // Handle regular fields (Steps 1-4, 6)
      (step as any).fields?.forEach((fieldConfig: FieldConfig) => {
        // Skip validation for conditionally hidden fields
        if (fieldConfig.condition && !fieldConfig.condition(formData)) {
          return;
        }

        if (fieldConfig.required) {
          const value = formData[fieldConfig.name];
          if (!value || value.trim() === '') {
            missing.add(fieldConfig.name);
          }
        }
      });
    }

    setMissingRequiredFields(missing);
    return missing.size === 0;
  };

  const handleNext = async () => {
    // Validate current step
    if (!validateStep(currentStep)) {
      setError(t('identification.requiredFieldsMissing') || 'Please fill in all required fields.');
      return;
    }

    if (pictureUploading) {
      setError(t('identification.step1.pictureUploading') || 'Please wait for the picture upload to finish.');
      return;
    }

    if (currentStep === 6 && shouldDisableSubmit) {
      setError(submitDisabledCopy);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Prepare data for backend - only include non-empty fields
      const dataToSave: any = {};
      if (currentProfileId) dataToSave.profileId = currentProfileId;
      
      if (formData.firstName) dataToSave.firstName = formData.firstName;
      if (formData.givenName) dataToSave.givenName = formData.givenName;
      if (formData.lastName) dataToSave.lastName = formData.lastName;
      if (formData.gender) dataToSave.gender = formData.gender;
      if (formData.bloodType) dataToSave.bloodType = formData.bloodType;
      if (formData.nsi) dataToSave.nsi = formData.nsi;
      if (formData.dateOfBirth) dataToSave.dateOfBirth = formData.dateOfBirth;
      if (formData.placeOfBirth) dataToSave.placeOfBirth = formData.placeOfBirth;
      if (formData.tribe) dataToSave.tribe = formData.tribe;
      if (formData.villageOfOrigin) dataToSave.villageOfOrigin = formData.villageOfOrigin;
      if (formData.group) dataToSave.group = formData.group;
      if (formData.sector) dataToSave.sector = formData.sector;
      if (formData.district) dataToSave.district = formData.district;
      if (formData.territory) dataToSave.territory = formData.territory;
      if (formData.province) dataToSave.province = formData.province;
      if (formData.nationality) dataToSave.nationality = formData.nationality;
      if (formData.type_of_profile) dataToSave.type_of_profile = Number(formData.type_of_profile);
      if (formData.maritalStatus) dataToSave.maritalStatus = formData.maritalStatus;
      if (formData.spouse) dataToSave.spouse = formData.spouse;
      if (formData.level_of_education) dataToSave.level_of_education = formData.level_of_education;
      if (formData.institution) dataToSave.institution = formData.institution;
      if (formData.year) dataToSave.year = formData.year;
      if (formData.residence) dataToSave.residence = formData.residence;
      if (formData.home) dataToSave.home = formData.home;
      if (formData.criminal_or_security_background) dataToSave.criminal_or_security_background = formData.criminal_or_security_background;
      if (formData.military_service) dataToSave.military_service = formData.military_service;
      if (formData.occupation_and_position) dataToSave.occupation_and_position = formData.occupation_and_position;
      if (formData.phone_number) {
        dataToSave.phone_number = formData.phone_number;
      }
      if (formData.email) dataToSave.email = formData.email;
      if (formData.picture) dataToSave.picture = formData.picture;
      
      // Step 5 fields - Transform to nested structure for API
      // grandpere_pere = gp_paternal_gf (Paternal Grandfather)
      if (formData.gp_paternal_gf_names || formData.gp_paternal_gf_group || formData.gp_paternal_gf_secteur || 
          formData.gp_paternal_gf_territory || formData.gp_paternal_gf_district || formData.gp_paternal_gf_province || 
          formData.gp_paternal_gf_country) {
        dataToSave.grandpere_pere = {};
        if (formData.gp_paternal_gf_names) dataToSave.grandpere_pere.first_name = formData.gp_paternal_gf_names;
        if (formData.gp_paternal_gf_group) dataToSave.grandpere_pere.group = formData.gp_paternal_gf_group;
        if (formData.gp_paternal_gf_secteur) dataToSave.grandpere_pere.sector = formData.gp_paternal_gf_secteur;
        if (formData.gp_paternal_gf_territory) dataToSave.grandpere_pere.territory = formData.gp_paternal_gf_territory;
        if (formData.gp_paternal_gf_district) dataToSave.grandpere_pere.district = formData.gp_paternal_gf_district;
        if (formData.gp_paternal_gf_province) dataToSave.grandpere_pere.province = formData.gp_paternal_gf_province;
        if (formData.gp_paternal_gf_country) dataToSave.grandpere_pere.country = formData.gp_paternal_gf_country;
      }
      
      // grandmere_pere = gp_paternal_gm (Paternal Grandmother)
      if (formData.gp_paternal_gm_names || formData.gp_paternal_gm_group || formData.gp_paternal_gm_secteur || 
          formData.gp_paternal_gm_territory || formData.gp_paternal_gm_district || formData.gp_paternal_gm_province || 
          formData.gp_paternal_gm_country) {
        dataToSave.grandmere_pere = {};
        if (formData.gp_paternal_gm_names) dataToSave.grandmere_pere.first_name = formData.gp_paternal_gm_names;
        if (formData.gp_paternal_gm_group) dataToSave.grandmere_pere.group = formData.gp_paternal_gm_group;
        if (formData.gp_paternal_gm_secteur) dataToSave.grandmere_pere.sector = formData.gp_paternal_gm_secteur;
        if (formData.gp_paternal_gm_territory) dataToSave.grandmere_pere.territory = formData.gp_paternal_gm_territory;
        if (formData.gp_paternal_gm_district) dataToSave.grandmere_pere.district = formData.gp_paternal_gm_district;
        if (formData.gp_paternal_gm_province) dataToSave.grandmere_pere.province = formData.gp_paternal_gm_province;
        if (formData.gp_paternal_gm_country) dataToSave.grandmere_pere.country = formData.gp_paternal_gm_country;
      }
      
      // grandpere_mere = gp_maternal_gf (Maternal Grandfather)
      if (formData.gp_maternal_gf_names || formData.gp_maternal_gf_group || formData.gp_maternal_gf_secteur || 
          formData.gp_maternal_gf_territory || formData.gp_maternal_gf_district || formData.gp_maternal_gf_province || 
          formData.gp_maternal_gf_country) {
        dataToSave.grandpere_mere = {};
        if (formData.gp_maternal_gf_names) dataToSave.grandpere_mere.first_name = formData.gp_maternal_gf_names;
        if (formData.gp_maternal_gf_group) dataToSave.grandpere_mere.group = formData.gp_maternal_gf_group;
        if (formData.gp_maternal_gf_secteur) dataToSave.grandpere_mere.sector = formData.gp_maternal_gf_secteur;
        if (formData.gp_maternal_gf_territory) dataToSave.grandpere_mere.territory = formData.gp_maternal_gf_territory;
        if (formData.gp_maternal_gf_district) dataToSave.grandpere_mere.district = formData.gp_maternal_gf_district;
        if (formData.gp_maternal_gf_province) dataToSave.grandpere_mere.province = formData.gp_maternal_gf_province;
        if (formData.gp_maternal_gf_country) dataToSave.grandpere_mere.country = formData.gp_maternal_gf_country;
      }
      
      // grandmere_mere = gp_maternal_gm (Maternal Grandmother)
      if (formData.gp_maternal_gm_names || formData.gp_maternal_gm_group || formData.gp_maternal_gm_secteur || 
          formData.gp_maternal_gm_territory || formData.gp_maternal_gm_district || formData.gp_maternal_gm_province || 
          formData.gp_maternal_gm_country) {
        dataToSave.grandmere_mere = {};
        if (formData.gp_maternal_gm_names) dataToSave.grandmere_mere.first_name = formData.gp_maternal_gm_names;
        if (formData.gp_maternal_gm_group) dataToSave.grandmere_mere.group = formData.gp_maternal_gm_group;
        if (formData.gp_maternal_gm_secteur) dataToSave.grandmere_mere.sector = formData.gp_maternal_gm_secteur;
        if (formData.gp_maternal_gm_territory) dataToSave.grandmere_mere.territory = formData.gp_maternal_gm_territory;
        if (formData.gp_maternal_gm_district) dataToSave.grandmere_mere.district = formData.gp_maternal_gm_district;
        if (formData.gp_maternal_gm_province) dataToSave.grandmere_mere.province = formData.gp_maternal_gm_province;
        if (formData.gp_maternal_gm_country) dataToSave.grandmere_mere.country = formData.gp_maternal_gm_country;
      }

      // Save current progress
      await updateProfile(dataToSave);

      if (currentStep === 5) {
        // Move to review after step 5
        setIsReview(true);
      } else if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to save profile. Please try again.');
      console.error('Error saving profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSave = async () => {
    if (shouldDisableSubmit) {
      setError(submitDisabledCopy);
      return;
    }

    if (pictureUploading) {
      setError(t('identification.step1.pictureUploading') || 'Please wait for the picture upload to finish.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Prepare data for backend - only include non-empty fields, plus complete flag
      const dataToSave: any = { complete: 1 };
      if (currentProfileId) dataToSave.profileId = currentProfileId;
      
      if (formData.firstName) dataToSave.firstName = formData.firstName;
      if (formData.givenName) dataToSave.givenName = formData.givenName;
      if (formData.lastName) dataToSave.lastName = formData.lastName;
      if (formData.gender) dataToSave.gender = formData.gender;
      if (formData.bloodType) dataToSave.bloodType = formData.bloodType;
      if (formData.nsi) dataToSave.nsi = formData.nsi;
      if (formData.dateOfBirth) dataToSave.dateOfBirth = formData.dateOfBirth;
      if (formData.placeOfBirth) dataToSave.placeOfBirth = formData.placeOfBirth;
      if (formData.tribe) dataToSave.tribe = formData.tribe;
      if (formData.villageOfOrigin) dataToSave.villageOfOrigin = formData.villageOfOrigin;
      if (formData.group) dataToSave.group = formData.group;
      if (formData.sector) dataToSave.sector = formData.sector;
      if (formData.district) dataToSave.district = formData.district;
      if (formData.territory) dataToSave.territory = formData.territory;
      if (formData.province) dataToSave.province = formData.province;
      if (formData.nationality) dataToSave.nationality = formData.nationality;
      if (formData.type_of_profile) dataToSave.type_of_profile = Number(formData.type_of_profile);
      if (formData.maritalStatus) dataToSave.maritalStatus = formData.maritalStatus;
      if (formData.spouse) dataToSave.spouse = formData.spouse;
      if (formData.level_of_education) dataToSave.level_of_education = formData.level_of_education;
      if (formData.institution) dataToSave.institution = formData.institution;
      if (formData.year) dataToSave.year = formData.year;
      if (formData.residence) dataToSave.residence = formData.residence;
      if (formData.home) dataToSave.home = formData.home;
      if (formData.criminal_or_security_background) dataToSave.criminal_or_security_background = formData.criminal_or_security_background;
      if (formData.military_service) dataToSave.military_service = formData.military_service;
      if (formData.occupation_and_position) dataToSave.occupation_and_position = formData.occupation_and_position;
      if (formData.phone_number) {
        dataToSave.phone_number = formData.phone_number;
      }
      if (formData.email) dataToSave.email = formData.email;
      if (formData.picture) dataToSave.picture = formData.picture;
      
      // Step 5 fields - Transform to nested structure for API
      // grandpere_pere = gp_paternal_gf (Paternal Grandfather)
      if (formData.gp_paternal_gf_names || formData.gp_paternal_gf_group || formData.gp_paternal_gf_secteur || 
          formData.gp_paternal_gf_territory || formData.gp_paternal_gf_district || formData.gp_paternal_gf_province || 
          formData.gp_paternal_gf_country) {
        dataToSave.grandpere_pere = {};
        if (formData.gp_paternal_gf_names) dataToSave.grandpere_pere.first_name = formData.gp_paternal_gf_names;
        if (formData.gp_paternal_gf_group) dataToSave.grandpere_pere.group = formData.gp_paternal_gf_group;
        if (formData.gp_paternal_gf_secteur) dataToSave.grandpere_pere.sector = formData.gp_paternal_gf_secteur;
        if (formData.gp_paternal_gf_territory) dataToSave.grandpere_pere.territory = formData.gp_paternal_gf_territory;
        if (formData.gp_paternal_gf_district) dataToSave.grandpere_pere.district = formData.gp_paternal_gf_district;
        if (formData.gp_paternal_gf_province) dataToSave.grandpere_pere.province = formData.gp_paternal_gf_province;
        if (formData.gp_paternal_gf_country) dataToSave.grandpere_pere.country = formData.gp_paternal_gf_country;
      }
      
      // grandmere_pere = gp_paternal_gm (Paternal Grandmother)
      if (formData.gp_paternal_gm_names || formData.gp_paternal_gm_group || formData.gp_paternal_gm_secteur || 
          formData.gp_paternal_gm_territory || formData.gp_paternal_gm_district || formData.gp_paternal_gm_province || 
          formData.gp_paternal_gm_country) {
        dataToSave.grandmere_pere = {};
        if (formData.gp_paternal_gm_names) dataToSave.grandmere_pere.first_name = formData.gp_paternal_gm_names;
        if (formData.gp_paternal_gm_group) dataToSave.grandmere_pere.group = formData.gp_paternal_gm_group;
        if (formData.gp_paternal_gm_secteur) dataToSave.grandmere_pere.sector = formData.gp_paternal_gm_secteur;
        if (formData.gp_paternal_gm_territory) dataToSave.grandmere_pere.territory = formData.gp_paternal_gm_territory;
        if (formData.gp_paternal_gm_district) dataToSave.grandmere_pere.district = formData.gp_paternal_gm_district;
        if (formData.gp_paternal_gm_province) dataToSave.grandmere_pere.province = formData.gp_paternal_gm_province;
        if (formData.gp_paternal_gm_country) dataToSave.grandmere_pere.country = formData.gp_paternal_gm_country;
      }
      
      // grandpere_mere = gp_maternal_gf (Maternal Grandfather)
      if (formData.gp_maternal_gf_names || formData.gp_maternal_gf_group || formData.gp_maternal_gf_secteur || 
          formData.gp_maternal_gf_territory || formData.gp_maternal_gf_district || formData.gp_maternal_gf_province || 
          formData.gp_maternal_gf_country) {
        dataToSave.grandpere_mere = {};
        if (formData.gp_maternal_gf_names) dataToSave.grandpere_mere.first_name = formData.gp_maternal_gf_names;
        if (formData.gp_maternal_gf_group) dataToSave.grandpere_mere.group = formData.gp_maternal_gf_group;
        if (formData.gp_maternal_gf_secteur) dataToSave.grandpere_mere.sector = formData.gp_maternal_gf_secteur;
        if (formData.gp_maternal_gf_territory) dataToSave.grandpere_mere.territory = formData.gp_maternal_gf_territory;
        if (formData.gp_maternal_gf_district) dataToSave.grandpere_mere.district = formData.gp_maternal_gf_district;
        if (formData.gp_maternal_gf_province) dataToSave.grandpere_mere.province = formData.gp_maternal_gf_province;
        if (formData.gp_maternal_gf_country) dataToSave.grandpere_mere.country = formData.gp_maternal_gf_country;
      }
      
      // grandmere_mere = gp_maternal_gm (Maternal Grandmother)
      if (formData.gp_maternal_gm_names || formData.gp_maternal_gm_group || formData.gp_maternal_gm_secteur || 
          formData.gp_maternal_gm_territory || formData.gp_maternal_gm_district || formData.gp_maternal_gm_province || 
          formData.gp_maternal_gm_country) {
        dataToSave.grandmere_mere = {};
        if (formData.gp_maternal_gm_names) dataToSave.grandmere_mere.first_name = formData.gp_maternal_gm_names;
        if (formData.gp_maternal_gm_group) dataToSave.grandmere_mere.group = formData.gp_maternal_gm_group;
        if (formData.gp_maternal_gm_secteur) dataToSave.grandmere_mere.sector = formData.gp_maternal_gm_secteur;
        if (formData.gp_maternal_gm_territory) dataToSave.grandmere_mere.territory = formData.gp_maternal_gm_territory;
        if (formData.gp_maternal_gm_district) dataToSave.grandmere_mere.district = formData.gp_maternal_gm_district;
        if (formData.gp_maternal_gm_province) dataToSave.grandmere_mere.province = formData.gp_maternal_gm_province;
        if (formData.gp_maternal_gm_country) dataToSave.grandmere_mere.country = formData.gp_maternal_gm_country;
      }

      await updateProfile(dataToSave);
      alert('Profile saved successfully!');
      if (permissions && permissions !== 'user' && profileIdParam) {
        router.replace('/dashboard/identification/voir-tout');
      } else {
        router.replace('/dashboard');
      }
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to save profile. Please try again.');
      console.error('Error saving profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepData = STEPS[currentStep - 1];
  const isFinalStepLocked = currentStep === 6 && shouldDisableSubmit;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <ArrowBackButton
              href="/dashboard"
              ariaLabel={t('dashboard.back') || 'Back to dashboard'}
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {t('identification.commencer') || 'Profile Creation'}
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            {t('identification.startIntro')}
          </p>

          {/* Progress Bar */}
          {!isReview && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {<span className="text-sm font-semibold text-gray-700">
                  Step {currentStep} of 6
                </span> }
                <span className="text-sm text-gray-600">
                  {Math.round((currentStep / 6) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Review Screen */}
          {isReview ? (
            <div key="review-screen" className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-2">{t('identification.review') || 'Review Your Profile'}</h2>
              <p className="text-sm text-gray-600 mb-8">Summary of your profile information</p>

              <div className="space-y-8 mb-8">
                {STEPS.filter(step => step.number !== 6).map((step) => (
                  <div key={step.number} className="border rounded-lg p-6 bg-gray-50">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {t(step.titleKey) || `Step ${step.number}`}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Section {step.number}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsReview(false);
                          setCurrentStep(step.number);
                        }}
                        className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-300"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="bg-white rounded p-4">
                      {(step as any).blocks ? (
                        // For steps with blocks (Step 5)
                        <div className="space-y-6">
                          {(step as any).blocks.map((block: any) => (
                            <div key={`block-${block.blockNumber}`}>
                              <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b">
                                {t(block.blockTitleKey) || `Block ${block.blockNumber}`}
                              </h4>
                              <div className="space-y-4">
                                {block.sections.map((section: any) => (
                                  <div key={`section-${block.blockNumber}-${section.sectionNumber}`} className="ml-4">
                                    <h5 className="text-sm font-medium text-gray-700 mb-3 pb-2 border-b border-gray-200">
                                      {t(section.sectionTitleKey) || `Section ${section.sectionNumber}`}
                                    </h5>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      {section.fields.map((fieldConfig: FieldConfig) => (
                                        <div key={fieldConfig.name}>
                                          <p className="text-gray-600 font-medium">
                                            {t(fieldConfig.labelKey)}
                                          </p>
                                          <p className="text-gray-900 mt-1">
                                            {formData[fieldConfig.name] ? (
                                              <span className="font-semibold">{getFieldDisplayValue(fieldConfig, formData)}</span>
                                            ) : (
                                              <span className="text-gray-400 italic">{t('profile.summary.notProvided') || 'Not provided'}</span>
                                            )}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // For steps with regular fields
                        <div className="grid grid-cols-2 gap-6 text-sm">
                          {step.number === 1 && (
                            <div className="col-span-2">
                              <p className="text-gray-600 font-medium">
                                {t('identification.step1.picture') || 'Profile picture'}
                              </p>
                              {formData.picture ? (
                                <div className="mt-3 flex flex-col items-start justify-center">
                                  {(picturePreviewUrl || (formData.picture?.startsWith('http') ? formData.picture : null)) ? (
                                    <img
                                      src={picturePreviewUrl || (formData.picture?.startsWith('http') ? formData.picture : undefined)}
                                      alt={t('identification.step1.picturePreviewAlt') || 'Profile picture preview'}
                                      className="h-32 w-32 rounded-md object-cover shadow"
                                    />
                                  ) : (
                                    <div className="h-32 w-32 rounded-md border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500 flex items-center justify-center text-center p-2">
                                      {t('identification.step1.pictureNoPreview') || 'Preview unavailable'}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="mt-2 text-gray-400 italic">
                                  {t('profile.summary.notProvided') || 'Not provided'}
                                </p>
                              )}
                            </div>
                          )}
                          {(step as any).fields?.map((fieldConfig: FieldConfig, index: number) => {
                            // Skip conditional fields if condition not met
                            if (fieldConfig.condition && !fieldConfig.condition(formData)) {
                              return null;
                            }
                            // Skip phone_number in favor of combined display
                            if (fieldConfig.name === 'phone_number') {
                              return null;
                            }
                            if (fieldConfig.name === 'picture') {
                              return null;
                            }
                            return (
                              <div key={fieldConfig.name}>
                                <p className="text-gray-600 font-medium">
                                  {t(fieldConfig.labelKey)}
                                </p>
                                <p className="text-gray-900 mt-1">
                                  {formData[fieldConfig.name] ? (
                                    <span className="font-semibold">{getFieldDisplayValue(fieldConfig, formData)}</span>
                                  ) : (
                                    <span className="text-gray-400 italic">{t('profile.summary.notProvided') || 'Not provided'}</span>
                                  )}
                                </p>
                              </div>
                            );
                          })}
                          {/* Display phone number combined */}
                          {step.number === 4 && (
                            <div>
                              <p className="text-gray-600 font-medium">
                                {t('identification.step4.phoneNumber') || 'Phone'}
                              </p>
                              <p className="text-gray-900 mt-1">
                                {formData.phone_number ? (
                                    <span className="font-semibold">{formData.phone_country_code}{formData.phone_number}</span>
                                ) : (
                                  <span className="text-gray-400 italic">{t('profile.summary.notProvided') || 'Not provided'}</span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6 border-t">
                <button
                  onClick={() => setIsReview(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  disabled={isLoading}
                >
                  {t('identification.backToEditing') || 'Back to Editing'}
                </button>
                <button
                  onClick={handleFinalSave}
                  disabled={isLoading || shouldDisableSubmit}
                  title={shouldDisableSubmit ? submitDisabledCopy : undefined}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('identification.saving') || 'Saving...' : 'Soumettre'}
                </button>
              </div>
              {shouldDisableSubmit && (
                <p className="mt-2 text-sm text-red-600 text-right">{submitDisabledCopy}</p>
              )}
            </div>
          ) : (
            /* Form Step */
            <div key="form-step" className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">
                {t(currentStepData.titleKey) || `Step ${currentStep}`}
              </h2>

              <div className="space-y-6">
                {/* Handle blocks (Step 5) */}
                {(currentStepData as any).blocks ? (
                  (currentStepData as any).blocks.map((block: any) => (
                    <div key={`block-${block.blockNumber}`} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        {t(block.blockTitleKey) || `Block ${block.blockNumber}`}
                      </h3>
                      
                      {block.sections.map((section: any) => (
                        <div key={`section-${block.blockNumber}-${section.sectionNumber}`} className="mb-6 bg-gray-50 p-4 rounded">
                          <h4 className="text-lg font-medium text-gray-700 mb-4">
                            {t(section.sectionTitleKey) || `Section ${section.sectionNumber}`}
                          </h4>
                          
                          <div className="space-y-4">
                            {section.fields.map((fieldConfig: FieldConfig) => (
                              <div key={fieldConfig.name}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {t(fieldConfig.labelKey)}
                                  {fieldConfig.required && <span className="text-red-600 ml-1">*</span>}
                                </label>

                                <input
                                  type="text"
                                  value={formData[fieldConfig.name]}
                                  onChange={(e) =>
                                    handleInputChange(fieldConfig.name, e.target.value)
                                  }
                                  placeholder={t(fieldConfig.labelKey) || ''}
                                  className={`w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    missingRequiredFields.has(fieldConfig.name)
                                      ? 'border-red-500 bg-red-50'
                                      : 'border-gray-300'
                                  }`}
                                />

                                {missingRequiredFields.has(fieldConfig.name) && (
                                  <p className="text-xs text-red-600 mt-1">
                                    {t('identification.fieldRequired') || 'This field is required'}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  // Handle regular fields (Steps 1-4, 6)
                  (currentStepData as any).fields?.map((fieldConfig: FieldConfig) => {
                  // Skip rendering if field has a condition and it's not met
                  if (fieldConfig.condition && !fieldConfig.condition(formData)) {
                    return null;
                  }

                  if (fieldConfig.name === 'picture') {
                    return (
                      <div
                        key={fieldConfig.name}
                        className="rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-4"
                      >
                        <label className="block text-sm font-medium text-gray-800">
                          {t(fieldConfig.labelKey)}
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          {t(fieldConfig.helperKey) || 'Upload a JPG or PNG image under 250 KB. The stored file path will be sent to the API.'}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <input
                            type="file"
                            accept={fieldConfig.accept || 'image/jpeg,image/png'}
                            onChange={handlePictureFileChange}
                            disabled={pictureUploading}
                            className="text-sm text-gray-700 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 disabled:file:bg-gray-400 disabled:file:cursor-not-allowed"
                          />
                          {formData.picture && (
                            <button
                              type="button"
                              onClick={handlePictureClear}
                              className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                              disabled={pictureUploading}
                            >
                              {t('identification.step1.pictureRemove') || 'Remove photo'}
                            </button>
                          )}
                          {pictureUploading && (
                            <span className="text-sm text-gray-500">
                              {t('identification.step1.pictureUploading') || 'Uploading...'}
                            </span>
                          )}
                        </div>
                        {picturePreviewUrl && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold text-gray-600 mb-2">
                              {t('identification.step1.picturePreview') || 'Preview'}
                            </p>
                            <img
                              src={picturePreviewUrl}
                              alt={t('identification.step1.picturePreviewAlt') || 'Selected profile picture preview'}
                              className="h-32 w-32 rounded object-cover shadow"
                            />
                          </div>
                        )}
                        {!picturePreviewUrl && formData.picture && (
                          <p className="mt-4 text-xs text-gray-600 break-words">
                            {t('identification.step1.pictureSavedPath') || 'Saved file path'}: {formData.picture}
                          </p>
                        )}
                        {pictureError && (
                          <p className="mt-2 text-xs text-red-600">{pictureError}</p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={fieldConfig.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t(fieldConfig.labelKey)}
                        {fieldConfig.required && <span className="text-red-600 ml-1">*</span>}
                      </label>

                      {fieldConfig.type === 'datepicker' ? (
                        <input
                          type="date"
                          value={formData[fieldConfig.name]}
                          onChange={(e) =>
                            handleInputChange(fieldConfig.name, e.target.value)
                          }
                          className={`w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            missingRequiredFields.has(fieldConfig.name)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300'
                          }`}
                        />
                      ) : fieldConfig.type === 'select' ? (
                        (() => {
                          const isTerritoryField = fieldConfig.name === 'territory';
                          const territoryOptions = isTerritoryField ? getTerritoryOptions(formData.province) : [];
                          const selectOptions = (isTerritoryField ? territoryOptions : fieldConfig.options) || [];
                          const defaultPlaceholder = t('identification.selectPlaceholder') || 'Select...';
                          const selectPlaceholder = isTerritoryField
                            ? !formData.province
                              ? t('identification.step2.selectProvinceFirst') || 'Select a province first'
                              : selectOptions.length === 0
                                ? t('identification.step2.noTerritories') || 'No territories available for this province'
                                : defaultPlaceholder
                            : defaultPlaceholder;
                          const isSelectDisabled = isTerritoryField && (!formData.province || selectOptions.length === 0);

                          return (
                            <select
                              value={formData[fieldConfig.name]}
                              onChange={(e) =>
                                handleInputChange(fieldConfig.name, e.target.value)
                              }
                              disabled={isSelectDisabled}
                              className={`w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                missingRequiredFields.has(fieldConfig.name)
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-300'
                              } ${isSelectDisabled ? 'bg-gray-100 text-gray-500' : ''}`}
                            >
                              <option value="">{selectPlaceholder}</option>
                              {selectOptions.map((opt, idx) => (
                                <option key={`${fieldConfig.name}-opt-${opt.value || idx}`} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          );
                        })()
                      ) : fieldConfig.name === 'phone_number' ? (
                        // Special handling for phone number with country code selector
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            {t('identification.step4.phone') || 'Phone'}
                          </label>
                          <div className="flex gap-2">
                            <div className="w-40">
                              <label className="text-xs text-gray-600 mb-1 block">
                                {t('identification.step4.phoneCountryCode') || 'Country Code'}
                              </label>
                              <select
                                value={formData.phone_country_code}
                                onChange={(e) =>
                                  handleInputChange('phone_country_code', e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {COUNTRY_PHONE_CODES.map((country) => (
                                  <option
                                    key={`${country.iso2 || country.code}-${country.code}`}
                                    value={country.code}
                                  >
                                    {country.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-600 mb-1 block">
                                {t('identification.step4.phoneNumber') || 'Number'}
                              </label>
                              <input
                                type="tel"
                                value={formData.phone_number}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '');
                                  handleInputChange('phone_number', value);
                                }}
                                placeholder={t('identification.step4.phoneNumberPlaceholder') || 'Numbers only'}
                                className={`w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  missingRequiredFields.has('phone_number')
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData[fieldConfig.name]}
                          onChange={(e) =>
                            handleInputChange(fieldConfig.name, e.target.value)
                          }
                          placeholder={t(fieldConfig.labelKey) || ''}
                          className={`w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            missingRequiredFields.has(fieldConfig.name)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300'
                          }`}
                        />
                      )}

                      {fieldConfig.helperKey && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t(fieldConfig.helperKey)}
                        </p>
                      )}

                      {missingRequiredFields.has(fieldConfig.name) && (
                        <p className="text-xs text-red-600 mt-1">
                          {t('identification.fieldRequired') || 'This field is required'}
                        </p>
                      )}
                    </div>
                  );
                })
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isLoading}
                  className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('identification.previous') || 'Previous'}
                </button>

                <button
                  onClick={handleNext}
                  disabled={isLoading || isFinalStepLocked || pictureUploading}
                  title={
                    isFinalStepLocked
                      ? submitDisabledCopy
                      : pictureUploading
                        ? t('identification.step1.pictureUploading') || 'Picture upload in progress'
                        : undefined
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? t('identification.saving') || 'Saving...'
                    : currentStep === 6
                      ? 'Soumettre'
                      : t('identification.next') || 'Next'}
                </button>
              </div>
              {isFinalStepLocked && (
                <p className="text-sm text-red-600 text-right mt-2">{submitDisabledCopy}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

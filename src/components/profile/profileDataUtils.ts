import { GRANDPARENT_FIELDS } from './profileSummaryConfig';

export const hasValue = (value: unknown): boolean => value !== undefined && value !== null && value !== '';

export const buildGrandparentFromForm = (data: any, prefix: string) => {
  if (!data) return null;
  const names = data?.[`${prefix}_names`];
  const group = data?.[`${prefix}_group`];
  const sector = data?.[`${prefix}_secteur`] || data?.[`${prefix}_sector`];
  const territory = data?.[`${prefix}_territory`];
  const district = data?.[`${prefix}_district`];
  const province = data?.[`${prefix}_province`];
  const country = data?.[`${prefix}_country`];
  const values = [names, group, sector, territory, district, province, country];
  if (values.every((value) => !hasValue(value))) {
    return null;
  }
  return {
    first_name: names || '',
    group: group || '',
    sector: sector || '',
    territory: territory || '',
    district: district || '',
    province: province || '',
    country: country || '',
  };
};

export const normalizeProfileData = (data: any) => {
  if (!data) return data;
  const normalized = { ...data };
  normalized.grandpere_pere = data.grandpere_pere || buildGrandparentFromForm(data, 'gp_paternal_gf');
  normalized.grandmere_pere = data.grandmere_pere || buildGrandparentFromForm(data, 'gp_paternal_gm');
  normalized.grandpere_mere = data.grandpere_mere || buildGrandparentFromForm(data, 'gp_maternal_gf');
  normalized.grandmere_mere = data.grandmere_mere || buildGrandparentFromForm(data, 'gp_maternal_gm');
  return normalized;
};

export const hasGrandparentInfo = (person?: Record<string, any> | null): boolean => {
  if (!person) return false;
  return GRANDPARENT_FIELDS.some((field) => hasValue(person?.[field.key]));
};

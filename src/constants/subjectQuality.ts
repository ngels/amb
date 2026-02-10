export type SubjectQualityOption = {
  value: string;
  label: string;
};

export const SUBJECT_QUALITY_OPTIONS: SubjectQualityOption[] = [
  { label: 'Passeport diplomatique', value: '1' },
  { label: 'Passeport de service', value: '2' },
  { label: 'Passeport ordinaire', value: '3' },
  { label: 'DT', value: '4' },
  { label: 'REF', value: '5' },
  { label: 'DEPL', value: '6' },
  { label: 'Autre', value: '7' },
];

const SUBJECT_QUALITY_LOOKUP: Record<string, string> = SUBJECT_QUALITY_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<string, string>,
);

export const subjectQualityLabel = (value?: string | number | null) => {
  if (value === undefined || value === null) return null;
  const key = typeof value === 'number' ? value.toString() : value;
  return SUBJECT_QUALITY_LOOKUP[key] ?? null;
};
